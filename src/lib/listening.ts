/**
 * Turns plays, top lists and collections into the per-track, per-artist and per-genre
 * stats the dashboard shows. Source-agnostic: the data comes from Last.fm (lib/lastfmApi)
 * or the example profile (lib/demo).
 */
import { TrackStats, ArtistStats, GenreStats } from '@/types';
import type { Artist, ArtistRef, Play, Track } from '@/types/music';
import { batchClassifyWithLastFm, type LastFmClassificationResult } from '@/utils/lastfm';

function getGenres(artist: Artist | ArtistRef): string[] {
  return 'genres' in artist ? artist.genres || [] : [];
}

/** Stand-in length when no track length is known (Last.fm often has none) */
const TYPICAL_TRACK_MS = 3.5 * 60_000;

/** A credited artist we have no details for yet */
export function asArtist(ref: ArtistRef): Artist {
  return 'images' in ref ? ref as Artist : { ...ref, images: [], genres: [] };
}

// Calculate track statistics from play history
export const calculateTrackStats = (
  playHistory: Play[],
  artistDetails: Record<string, Artist> = {}
): TrackStats[] => {
  const trackMap = new Map<string, TrackStats>();

  playHistory.forEach(item => {
    const trackId = item.track.id;
    const playedAt = new Date(item.played_at);
    const artists = item.track.artists.map(artist => artistDetails[artist.id] || asArtist(artist));

    if (trackMap.has(trackId)) {
      const stats = trackMap.get(trackId)!;
      stats.playCount++;
      stats.totalDuration += item.track.duration_ms;

      if (playedAt < new Date(stats.firstPlayed)) {
        stats.firstPlayed = item.played_at;
      }
      if (playedAt > new Date(stats.lastPlayed)) {
        stats.lastPlayed = item.played_at;
      }
    } else {
      trackMap.set(trackId, {
        track: item.track,
        artists,
        playCount: 1,
        firstPlayed: item.played_at,
        lastPlayed: item.played_at,
        totalDuration: item.track.duration_ms
      });
    }
  });

  // Ensure all returned TrackStats have artists populated
  return Array.from(trackMap.values())
    .map(stats => ({
      ...stats,
      artists: stats.artists || stats.track.artists.map(artist => artistDetails[artist.id] || asArtist(artist))
    }))
    .sort((a, b) => b.playCount - a.playCount);
};

// Calculate artist statistics
export const calculateArtistStats = (
  playHistory: Play[],
  artistDetails: Record<string, Artist> = {}
): ArtistStats[] => {
  const artistMap = new Map<string, ArtistStats & { trackIds: Set<string> }>();

  // Process each play history item
  playHistory.forEach(item => {
    item.track.artists.forEach(artist => {
      const artistId = artist.id;
      const fullArtist = artistDetails[artistId] || asArtist(artist);

      if (artistMap.has(artistId)) {
        const stats = artistMap.get(artistId)!;
        stats.playCount++;
        stats.totalDuration += item.track.duration_ms;
        stats.trackIds.add(item.track.id);
        stats.uniqueTracks = stats.trackIds.size;
      } else {
        artistMap.set(artistId, {
          artist: fullArtist,
          playCount: 1,
          uniqueTracks: 1,
          totalDuration: item.track.duration_ms,
          genres: fullArtist.genres || [],
          trackIds: new Set([item.track.id])
        });
      }
    });
  });

  return Array.from(artistMap.values())
    .map(stats => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { trackIds: _, ...artistStats } = stats;
      return artistStats;
    })
    .sort((a, b) => b.playCount - a.playCount);
};

// Calculate genre statistics
export const calculateGenreStats = (
  playHistory: Play[],
  artistDetails: Record<string, Artist> = {}
): GenreStats[] => {
  const genreMap = new Map<string, GenreStats & { trackIds: Set<string>; artistIds: Set<string> }>();

  // Process each play history item
  playHistory.forEach(item => {
    const trackId = item.track.id;

    // Process each artist in the track
    item.track.artists.forEach(artist => {
      const artistId = artist.id;
      const fullArtist = artistDetails[artistId] || asArtist(artist);
      const artistGenres = getGenres(fullArtist);

      // Process each genre of the artist
      artistGenres.forEach(genre => {
        if (genreMap.has(genre)) {
          // Update existing genre stats
          const stats = genreMap.get(genre)!;
          stats.playCount++;
          stats.totalDuration += item.track.duration_ms;

          // Track unique tracks and artists
          stats.trackIds.add(trackId);
          stats.artistIds.add(artistId);

          // Update counts
          stats.uniqueTracks = stats.trackIds.size;
          stats.uniqueArtists = stats.artistIds.size;
        } else {
          // Initialize new genre stats
          genreMap.set(genre, {
            genre,
            playCount: 1,
            uniqueTracks: 1,
            uniqueArtists: 1,
            totalDuration: item.track.duration_ms,
            trackIds: new Set([trackId]),
            artistIds: new Set([artistId])
          });
        }
      });
    });
  });

  return Array.from(genreMap.values())
    .map(stats => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { trackIds: _, artistIds: __, ...genreStats } = stats;
      return genreStats;
    })
    .sort((a, b) => b.playCount - a.playCount);
};

// Calculate top genres from artists
export const calculateTopGenres = (artists: Artist[]): Array<{genre: string; count: number}> => {
  const genreCount = new Map<string, number>();

  // Count genre occurrences across all artists
  artists.forEach(artist => {
    artist.genres?.forEach(genre => {
      genreCount.set(genre, (genreCount.get(genre) || 0) + 1);
    });
  });

  // Convert to array and sort by count (descending)
  return Array.from(genreCount.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);
};

// Top Tracks mode: each track is weighted by the listener's play count for the period
// (Last.fm top tracks carry one). Collections such as Loved Tracks have none, so each
// of their tracks counts once.
export const calculateTopTracksStats = (
  topTracks: Track[],
  artistDetails: Record<string, Artist> = {}
): {
  trackStats: TrackStats[];
  artistStats: ArtistStats[];
  genreStats: GenreStats[];
  totalWeight: number;
  totalDuration: number;
} => {
  const trackMap = new Map<string, TrackStats>();
  const artistMap = new Map<string, ArtistStats & { trackIds: Set<string> }>();
  const genreMap = new Map<string, GenreStats & { trackIds: Set<string>; artistIds: Set<string> }>();
  
  let totalWeight = 0;
  let totalDuration = 0;

  topTracks.forEach((track) => {
    const weight = track.playcount ?? 1;
    totalWeight += weight;
    totalDuration += track.duration_ms * weight;

    const artists = track.artists.map(artist => artistDetails[artist.id] || asArtist(artist));

    // Track stats
    trackMap.set(track.id, {
      track,
      artists,
      playCount: weight,
      firstPlayed: '',
      lastPlayed: '',
      totalDuration: track.duration_ms * weight
    });

    // Artist stats
    track.artists.forEach(artist => {
      const artistId = artist.id;
      const fullArtist = artistDetails[artistId] || asArtist(artist);

      if (artistMap.has(artistId)) {
        const stats = artistMap.get(artistId)!;
        stats.playCount += weight;
        stats.totalDuration += track.duration_ms * weight;
        stats.trackIds.add(track.id);
        stats.uniqueTracks = stats.trackIds.size;
      } else {
        artistMap.set(artistId, {
          artist: fullArtist,
          playCount: weight,
          uniqueTracks: 1,
          totalDuration: track.duration_ms * weight,
          genres: fullArtist.genres || [],
          trackIds: new Set([track.id])
        });
      }

      // Genre stats, once per top track even when several credited artists share it.
      getGenres(fullArtist).forEach(genre => {
        const stats = genreMap.get(genre);
        if (stats) {
          const seenTrack = stats.trackIds.has(track.id);
          stats.trackIds.add(track.id);
          stats.artistIds.add(artistId);
          if (!seenTrack) {
            stats.playCount += weight;
            stats.totalDuration += track.duration_ms * weight;
          }
          stats.uniqueTracks = stats.trackIds.size;
          stats.uniqueArtists = stats.artistIds.size;
        } else {
          genreMap.set(genre, {
            genre,
            playCount: weight,
            uniqueTracks: 1,
            uniqueArtists: 1,
            totalDuration: track.duration_ms * weight,
            trackIds: new Set([track.id]),
            artistIds: new Set([artistId])
          });
        }
      });
    });
  });

  return {
    trackStats: Array.from(trackMap.values()).sort((a, b) => b.playCount - a.playCount),
    artistStats: Array.from(artistMap.values())
      .map(stats => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { trackIds: _, ...artistStats } = stats;
        return { ...artistStats, playCount: Math.round(artistStats.playCount) };
      })
      .sort((a, b) => b.playCount - a.playCount),
    genreStats: Array.from(genreMap.values())
      .map(stats => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { trackIds: _, artistIds: __, ...genreStats } = stats;
        return { ...genreStats, playCount: Math.round(genreStats.playCount) };
      })
      .sort((a, b) => b.playCount - a.playCount),
    totalWeight: Math.round(totalWeight),
    totalDuration
  };
};

// Top Artists mode: the listener's ranked artists, weighted by their play count for the
// period (Last.fm top artists carry one). Without a count, an artist weighs as many of
// the listener's top tracks as they appear on: a flat 1 would make the top five of fifty
// artists a 10% share, so Top Artists mode could never score as devoted.
export const calculateTopArtistsStats = (
  topArtists: Artist[],
  topTracks: Track[]
): {
  trackStats: TrackStats[];
  artistStats: ArtistStats[];
  genreStats: GenreStats[];
  totalWeight: number;
  totalDuration: number;
} => {
  const artistMap = new Map<string, ArtistStats & { trackIds: Set<string> }>();
  const trackMap = new Map<string, TrackStats>();
  const genreMap = new Map<string, GenreStats & { trackIds: Set<string>; artistIds: Set<string> }>();
  
  let totalWeight = 0;
  let totalDuration = 0;

  topArtists.forEach((artist) => {
    // Find tracks by this artist from the user's top tracks
    const artistTracks = topTracks.filter(track => 
      track.artists.some(a => a.id === artist.id)
    );
    const weight = artist.playcount ?? Math.max(artistTracks.length, 1);
    const knownDurations = artistTracks.map(t => t.duration_ms).filter(ms => ms > 0);
    const typicalLength = knownDurations.length > 0
      ? knownDurations.reduce((sum, ms) => sum + ms, 0) / knownDurations.length
      : TYPICAL_TRACK_MS;
    const duration = Math.round(typicalLength * weight);

    totalWeight += weight;
    totalDuration += duration;

    artistMap.set(artist.id, {
      artist,
      playCount: weight,
      uniqueTracks: artistTracks.length,
      totalDuration: duration,
      genres: artist.genres || [],
      trackIds: new Set(artistTracks.map(t => t.id))
    });

    artistTracks.forEach((track) => {
      if (trackMap.has(track.id)) return;
      const fullArtists = track.artists
        .map(a => topArtists.find(ta => ta.id === a.id))
        .filter((a): a is Artist => a !== undefined);

      trackMap.set(track.id, {
        track,
        artists: fullArtists.length > 0 ? fullArtists : [artist],
        playCount: track.playcount ?? 1,
        firstPlayed: '',
        lastPlayed: '',
        totalDuration: track.duration_ms * (track.playcount ?? 1)
      });
    });

    getGenres(artist).forEach(genre => {
      const stats = genreMap.get(genre);
      if (stats) {
        stats.playCount += weight;
        stats.totalDuration += duration;
        artistTracks.forEach(track => stats.trackIds.add(track.id));
        stats.artistIds.add(artist.id);
        stats.uniqueTracks = stats.trackIds.size;
        stats.uniqueArtists = stats.artistIds.size;
      } else {
        genreMap.set(genre, {
          genre,
          playCount: weight,
          uniqueTracks: artistTracks.length,
          uniqueArtists: 1,
          totalDuration: duration,
          trackIds: new Set(artistTracks.map(t => t.id)),
          artistIds: new Set([artist.id])
        });
      }
    });
  });

  return {
    trackStats: Array.from(trackMap.values()).sort((a, b) => b.playCount - a.playCount),
    artistStats: Array.from(artistMap.values())
      .map(stats => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { trackIds: _, ...artistStats } = stats;
        return { ...artistStats, playCount: Math.round(artistStats.playCount) };
      })
      .sort((a, b) => b.playCount - a.playCount),
    genreStats: Array.from(genreMap.values())
      .map(stats => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { trackIds: _, artistIds: __, ...genreStats } = stats;
        return { ...genreStats, playCount: Math.round(genreStats.playCount) };
      })
      .sort((a, b) => b.playCount - a.playCount),
    totalWeight: Math.round(totalWeight),
    totalDuration
  };
};


/**
 * Count plays in a recently-played list. The list is newest first, so the first
 * time a track appears is its latest play.
 */
export function countRecentPlays(playHistory: Play[]): {
  tracks: Map<string, { count: number; lastPlayed: string }>;
  artists: Map<string, number>;
} {
  const tracks = new Map<string, { count: number; lastPlayed: string }>();
  const artists = new Map<string, number>();

  for (const item of playHistory) {
    const existing = tracks.get(item.track.id);
    if (existing) {
      existing.count += 1;
    } else {
      tracks.set(item.track.id, { count: 1, lastPlayed: item.played_at });
    }
    for (const artist of item.track.artists) {
      artists.set(artist.id, (artists.get(artist.id) ?? 0) + 1);
    }
  }

  return { tracks, artists };
}

/**
 * Server-only fields attached by enhanceArtistsWithLastFm. Stripped from API responses;
 * only the dev genre debug panel reads them.
 */
export type LastFmEnhancedArtist = Artist & {
  _baseGenres?: string[];
  _lastFmData?: LastFmClassificationResult;
};

/**
 * Fill artist genres from Last.fm tags. Live artists start with no genres, so every one is
 * looked up; example-profile artists with 3+ seeded genres are left as they are.
 * Server-side only - uses Last.fm API with caching
 * 
 * Matched Last.fm tags are merged into `genres`, so downstream code never needs to know
 * where a genre came from.
 * 
 * @param artists - Artists to enhance
 * @param apiKey - Last.fm API key (optional, degrades gracefully)
 * @returns Artists with merged genres, plus the names of artists Last.fm couldn't be
 *   reached for (rate limit, API or network error)
 */
export const enhanceArtistsWithLastFm = async (
  artists: LastFmEnhancedArtist[],
  apiKey?: string
): Promise<{ artists: LastFmEnhancedArtist[]; lastFmUnavailable: string[] }> => {
  // If no API key, return artists as-is
  if (!apiKey) {
    console.log('Last.fm API key not configured, skipping genre enhancement');
    return { artists, lastFmUnavailable: [] };
  }

  // Find artists with thin genres (0-2 genres)
  const thinGenreArtists = artists.filter(artist =>
    !artist._baseGenres && (artist.genres?.length || 0) <= 2
  );
  
  if (thinGenreArtists.length === 0) {
    return { artists, lastFmUnavailable: [] };
  }

  console.log(`Enhancing ${thinGenreArtists.length} artists with thin genres using Last.fm`);

  const artistNames = thinGenreArtists.map(artist => artist.name);
  try {
    // Cached 30 days, so repeat lookups don't hit Last.fm
    const { results: lastFmResults, unavailable } = await batchClassifyWithLastFm(artistNames, apiKey);

    const enhanced = artists.map(artist => {
      const lastFmResult = lastFmResults.get(artist.name);
      if (!lastFmResult || artist._baseGenres) {
        return artist;
      }
      const baseGenres = artist.genres || [];
      const lastFmGenres = lastFmResult.classifications
        .filter(c => c.matchedGenre && c.scores)
        .map(c => c.originalGenre);
      return {
        ...artist,
        genres: Array.from(new Set([...baseGenres, ...lastFmGenres])),
        _baseGenres: baseGenres,
        _lastFmData: lastFmResult
      };
    });
    return { artists: enhanced, lastFmUnavailable: unavailable };
  } catch (error) {
    console.error('Error enhancing artists with Last.fm:', error);
    // Degrade gracefully - return original artists
    return { artists, lastFmUnavailable: artistNames };
  }
};
