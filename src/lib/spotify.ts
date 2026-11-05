import SpotifyWebApi from 'spotify-web-api-node';
import { TrackStats, ArtistStats, GenreStats, LIKED_SONGS_ID, PLAYLIST_ANALYSIS_CAP, PlaylistSummary } from '@/types';
import { batchClassifyWithLastFm, supplementGenresWithLastFm, type LastFmClassificationResult } from '@/utils/lastfm';

// Initialize Spotify API
export const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// Set access token for API calls
export const setAccessToken = (token: string) => {
  spotifyApi.setAccessToken(token);
};

// Fetch user's recently played tracks
export const getRecentlyPlayed = async (limit: number = 50): Promise<SpotifyApi.PlayHistoryObject[]> => {
  try {
    const response = await spotifyApi.getMyRecentlyPlayedTracks({ limit });
    return response.body.items;
  } catch (error) {
    console.error('Error fetching recently played tracks:', error);
    throw error;
  }
};

// Fetch user's top tracks
export const getTopTracks = async (timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 50): Promise<SpotifyApi.TrackObjectFull[]> => {
  try {
    const response = await spotifyApi.getMyTopTracks({ time_range: timeRange, limit });
    return response.body.items;
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    throw error;
  }
};

// Fetch user's top artists
export const getTopArtists = async (timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 50): Promise<SpotifyApi.ArtistObjectFull[]> => {
  try {
    const response = await spotifyApi.getMyTopArtists({ time_range: timeRange, limit });
    return response.body.items;
  } catch (error) {
    console.error('Error fetching top artists:', error);
    throw error;
  }
};

export class MissingScopeError extends Error {
  readonly scope: string;

  constructor(scope: string) {
    super(`Missing Spotify scope: ${scope}`);
    this.name = 'MissingScopeError';
    this.scope = scope;
  }
}

export class InvalidPlaylistError extends Error {
  constructor() {
    super('Invalid playlist id');
    this.name = 'InvalidPlaylistError';
  }
}

const PLAYLIST_ID_PATTERN = /^[A-Za-z0-9]{10,32}$/;
const SAVED_TRACK_PAGE = 50;
const PLAYLIST_TRACK_PAGE = 100;
const PLAYLIST_LIST_PAGE = 50;
const PLAYLIST_LIST_CAP = 250;

export interface CollectionTrack {
  track: SpotifyApi.TrackObjectFull;
  addedAt: string;
}

export interface PlaylistCollection {
  id: string;
  name: string;
  image?: string;
  total: number;
  tracks: CollectionTrack[];
}

function statusCodeOf(error: unknown): number | undefined {
  return (error as { statusCode?: number }).statusCode;
}

function isPlayableTrack(
  track: SpotifyApi.TrackObjectFull | null | undefined,
  isLocal = false
): track is SpotifyApi.TrackObjectFull {
  return !!track && !isLocal && !track.is_local && !!track.id && track.type === 'track';
}

interface PagedTracks {
  items: Array<{
    track: SpotifyApi.TrackObjectFull | null;
    added_at: string | null;
    is_local?: boolean;
  }>;
  total: number;
}

/** Reads up to PLAYLIST_ANALYSIS_CAP raw items, then keeps playable songs in that window. */
async function collectTrackWindow(
  pageSize: number,
  fetchPage: (offset: number, limit: number) => Promise<PagedTracks>
): Promise<{ tracks: CollectionTrack[]; total: number }> {
  const tracks: CollectionTrack[] = [];
  const seen = new Set<string>();
  let offset = 0;
  let total = Infinity;

  while (offset < PLAYLIST_ANALYSIS_CAP && offset < total) {
    const limit = Math.min(pageSize, PLAYLIST_ANALYSIS_CAP - offset);
    const page = await fetchPage(offset, limit);
    total = page.total;
    if (page.items.length === 0) break;

    for (const item of page.items) {
      if (!isPlayableTrack(item.track, item.is_local) || seen.has(item.track.id)) continue;
      seen.add(item.track.id);
      tracks.push({ track: item.track, addedAt: item.added_at || '' });
    }

    offset += page.items.length;
  }

  return { tracks, total: Number.isFinite(total) ? total : tracks.length };
}

export async function getUserPlaylistSummaries(): Promise<PlaylistSummary[]> {
  const summaries: PlaylistSummary[] = [];
  let offset = 0;
  let total = Infinity;

  while (offset < total && summaries.length < PLAYLIST_LIST_CAP) {
    const response = await spotifyApi.getUserPlaylists({ limit: PLAYLIST_LIST_PAGE, offset });
    total = response.body.total;

    for (const playlist of response.body.items) {
      if (!playlist?.id) continue;
      summaries.push({
        id: playlist.id,
        name: playlist.name,
        image: playlist.images?.[0]?.url,
        trackCount: playlist.tracks?.total ?? 0,
      });
    }

    if (response.body.items.length === 0) break;
    offset += response.body.items.length;
  }

  return summaries;
}

export async function getLikedSongsSummary(): Promise<PlaylistSummary> {
  try {
    const response = await spotifyApi.getMySavedTracks({ limit: 1 });
    return {
      id: LIKED_SONGS_ID,
      name: 'Liked Songs',
      trackCount: response.body.total,
    };
  } catch (error) {
    if (statusCodeOf(error) === 403) throw new MissingScopeError('user-library-read');
    throw error;
  }
}

export async function getLikedSongsCollection(): Promise<PlaylistCollection> {
  try {
    const { tracks, total } = await collectTrackWindow(SAVED_TRACK_PAGE, async (offset, limit) => {
      const response = await spotifyApi.getMySavedTracks({ limit, offset });
      return { items: response.body.items, total: response.body.total };
    });
    return { id: LIKED_SONGS_ID, name: 'Liked Songs', total, tracks };
  } catch (error) {
    if (error instanceof MissingScopeError) throw error;
    if (statusCodeOf(error) === 403) throw new MissingScopeError('user-library-read');
    throw error;
  }
}

export async function getPlaylistCollection(playlistId: string): Promise<PlaylistCollection> {
  if (!PLAYLIST_ID_PATTERN.test(playlistId)) throw new InvalidPlaylistError();

  const playlist = await spotifyApi.getPlaylist(playlistId, {
    fields: 'id,name,images,tracks.total',
  });
  const { tracks, total } = await collectTrackWindow(PLAYLIST_TRACK_PAGE, async (offset, limit) => {
    const response = await spotifyApi.getPlaylistTracks(playlistId, { limit, offset });
    return {
      items: response.body.items.map(item => ({
        track: item.track,
        added_at: item.added_at,
        is_local: item.is_local,
      })),
      total: response.body.total,
    };
  });

  return {
    id: playlist.body.id,
    name: playlist.body.name,
    image: playlist.body.images?.[0]?.url,
    total,
    tracks,
  };
}

// Get artist details (includes genres)
export const getArtistDetails = async (artistId: string): Promise<SpotifyApi.SingleArtistResponse> => {
  try {
    const response = await spotifyApi.getArtist(artistId);
    return response.body;
  } catch (error) {
    console.error('Error fetching artist details:', error);
    throw error;
  }
};

// Helper function to fetch artists in batches
export async function fetchArtistsInBatches(artistIds: string[]) {
  const batchSize = 50; // Spotify's limit for getArtists endpoint
  const batches = [];

  for (let i = 0; i < artistIds.length; i += batchSize) {
    const batch = artistIds.slice(i, i + batchSize);
    try {
      const response = await spotifyApi.getArtists(batch);
      batches.push(...response.body.artists);
    } catch (error) {
      console.error('Error fetching artist batch:', error);
      throw error;
    }
  }

  return batches.reduce<Record<string, SpotifyApi.ArtistObjectFull>>((acc, artist) => {
    acc[artist.id] = artist;
    return acc;
  }, {});
}

function getGenres(artist: SpotifyApi.ArtistObjectFull | SpotifyApi.ArtistObjectSimplified): string[] {
  return 'genres' in artist ? artist.genres || [] : [];
}

// Calculate track statistics from play history
export const calculateTrackStats = (
  playHistory: SpotifyApi.PlayHistoryObject[],
  artistDetails: Record<string, SpotifyApi.ArtistObjectFull> = {}
): TrackStats[] => {
  const trackMap = new Map<string, TrackStats>();

  playHistory.forEach(item => {
    const trackId = item.track.id;
    const playedAt = new Date(item.played_at);
    const artists = item.track.artists.map(artist => artistDetails[artist.id] || artist);

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
      artists: stats.artists || stats.track.artists.map(artist => artistDetails[artist.id] || artist)
    }))
    .sort((a, b) => b.playCount - a.playCount);
};

// Calculate artist statistics
export const calculateArtistStats = (
  playHistory: SpotifyApi.PlayHistoryObject[],
  artistDetails: Record<string, SpotifyApi.ArtistObjectFull> = {}
): ArtistStats[] => {
  const artistMap = new Map<string, ArtistStats & { trackIds: Set<string> }>();

  // Process each play history item
  playHistory.forEach(item => {
    item.track.artists.forEach(artist => {
      const artistId = artist.id;
      const fullArtist = artistDetails[artistId] || artist;

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
  playHistory: SpotifyApi.PlayHistoryObject[],
  artistDetails: Record<string, SpotifyApi.ArtistObjectFull> = {}
): GenreStats[] => {
  const genreMap = new Map<string, GenreStats & { trackIds: Set<string>; artistIds: Set<string> }>();

  // Process each play history item
  playHistory.forEach(item => {
    const trackId = item.track.id;

    // Process each artist in the track
    item.track.artists.forEach(artist => {
      const artistId = artist.id;
      const fullArtist = artistDetails[artistId] || artist;
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
export const calculateTopGenres = (artists: SpotifyApi.ArtistObjectFull[]): Array<{genre: string; count: number}> => {
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

// Top Tracks mode: each of Spotify's top tracks counts once, in Spotify's order.
// Spotify does not provide play counts for this list.
export const calculateTopTracksStats = (
  topTracks: SpotifyApi.TrackObjectFull[],
  artistDetails: Record<string, SpotifyApi.ArtistObjectFull> = {}
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
    totalWeight += 1;
    totalDuration += track.duration_ms;

    const artists = track.artists.map(artist => artistDetails[artist.id] || artist);

    // Track stats
    trackMap.set(track.id, {
      track,
      artists,
      playCount: 1,
      firstPlayed: '',
      lastPlayed: '',
      totalDuration: track.duration_ms
    });

    // Artist stats
    track.artists.forEach(artist => {
      const artistId = artist.id;
      const fullArtist = artistDetails[artistId] || artist;

      if (artistMap.has(artistId)) {
        const stats = artistMap.get(artistId)!;
        stats.playCount += 1;
        stats.totalDuration += track.duration_ms;
        stats.trackIds.add(track.id);
        stats.uniqueTracks = stats.trackIds.size;
      } else {
        artistMap.set(artistId, {
          artist: fullArtist,
          playCount: 1,
          uniqueTracks: 1,
          totalDuration: track.duration_ms,
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
            stats.playCount += 1;
            stats.totalDuration += track.duration_ms;
          }
          stats.uniqueTracks = stats.trackIds.size;
          stats.uniqueArtists = stats.artistIds.size;
        } else {
          genreMap.set(genre, {
            genre,
            playCount: 1,
            uniqueTracks: 1,
            uniqueArtists: 1,
            totalDuration: track.duration_ms,
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

// Top Artists mode: each of Spotify's top artists counts once, in Spotify's order.
// Tracks are the ones from the user's top tracks that those artists appear on.
export const calculateTopArtistsStats = (
  topArtists: SpotifyApi.ArtistObjectFull[],
  topTracks: SpotifyApi.TrackObjectFull[]
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
    totalWeight += 1;

    // Find tracks by this artist from the user's top tracks
    const artistTracks = topTracks.filter(track => 
      track.artists.some(a => a.id === artist.id)
    );

    artistTracks.forEach(track => {
      totalDuration += track.duration_ms;
    });

    // Initialize artist stats
    artistMap.set(artist.id, {
      artist,
      playCount: 1,
      uniqueTracks: artistTracks.length,
      totalDuration: artistTracks.reduce((sum, t) => sum + t.duration_ms, 0),
      genres: artist.genres || [],
      trackIds: new Set(artistTracks.map(t => t.id))
    });

    artistTracks.forEach((track) => {
      if (trackMap.has(track.id)) return;
      const fullArtists = track.artists
        .map(a => topArtists.find(ta => ta.id === a.id))
        .filter((a): a is SpotifyApi.ArtistObjectFull => a !== undefined);

      trackMap.set(track.id, {
        track,
        artists: fullArtists.length > 0 ? fullArtists : [artist],
        playCount: 1,
        firstPlayed: '',
        lastPlayed: '',
        totalDuration: track.duration_ms
      });
    });

    getGenres(artist).forEach(genre => {
      const duration = artistTracks.reduce((sum, t) => sum + t.duration_ms, 0);
      const stats = genreMap.get(genre);
      if (stats) {
        stats.playCount += 1;
        stats.totalDuration += duration;
        artistTracks.forEach(track => stats.trackIds.add(track.id));
        stats.artistIds.add(artist.id);
        stats.uniqueTracks = stats.trackIds.size;
        stats.uniqueArtists = stats.artistIds.size;
      } else {
        genreMap.set(genre, {
          genre,
          playCount: 1,
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
export function countRecentPlays(playHistory: SpotifyApi.PlayHistoryObject[]): {
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
export type LastFmEnhancedArtist = SpotifyApi.ArtistObjectFull & {
  _spotifyGenres?: string[];
  _lastFmData?: LastFmClassificationResult;
};

/**
 * Enhance artist data with Last.fm tags for artists with thin Spotify genres
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
    !artist._spotifyGenres && (artist.genres?.length || 0) <= 2
  );
  
  if (thinGenreArtists.length === 0) {
    return { artists, lastFmUnavailable: [] };
  }

  console.log(`Enhancing ${thinGenreArtists.length} artists with thin genres using Last.fm`);

  const artistNames = thinGenreArtists.map(artist => artist.name);
  try {
    // Cached 7 days, so repeat lookups don't hit Last.fm
    const { results: lastFmResults, unavailable } = await batchClassifyWithLastFm(artistNames, apiKey);

    const enhanced = artists.map(artist => {
      const lastFmResult = lastFmResults.get(artist.name);
      if (!lastFmResult || artist._spotifyGenres) {
        return artist;
      }
      const spotifyGenres = artist.genres || [];
      const lastFmGenres = lastFmResult.classifications
        .filter(c => c.matchedGenre && c.scores)
        .map(c => c.originalGenre);
      return {
        ...artist,
        genres: Array.from(new Set([...spotifyGenres, ...lastFmGenres])),
        _spotifyGenres: spotifyGenres,
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
