import {
  calculateTrackStats, calculateArtistStats, calculateGenreStats, calculateTopGenres,
  calculateTopTracksStats, calculateTopArtistsStats, countRecentPlays
} from '@/lib/spotify';
import type { LastFmEnhancedArtist, PlaylistCollection } from '@/lib/spotify';
import { Stats, TimeRange, DataMode, ArtistGenreDebugInfo, GenreTagDebugInfo, TopArtistItem, TopTrackItem, PlaylistAnalysis } from '@/types';

/**
 * Where the stats pipeline gets its raw listening data. The live implementation calls
 * the Spotify Web API; demo mode serves a made-up dataset with the same shapes.
 */
export interface ListeningDataSource {
  getRecentlyPlayed(limit: number): Promise<SpotifyApi.PlayHistoryObject[]>;
  getTopTracks(timeRange: TimeRange, limit: number): Promise<SpotifyApi.TrackObjectFull[]>;
  getTopArtists(timeRange: TimeRange, limit: number): Promise<SpotifyApi.ArtistObjectFull[]>;
  fetchArtistsByIds(artistIds: string[]): Promise<Record<string, SpotifyApi.ArtistObjectFull>>;
  /** Merges extra genre tags (e.g. Last.fm) into artists. Returns artists plus names that couldn't be enriched. */
  enhanceArtists(artists: LastFmEnhancedArtist[]): Promise<{ artists: LastFmEnhancedArtist[]; lastFmUnavailable: string[] }>;
}

export interface ComputeStatsOptions {
  timeRange: TimeRange;
  limit: number;
  mode: DataMode;
  /** Attach the genre debug data used by the dev-only debug panel */
  includeDebug?: boolean;
  debugLastFmStatus?: Stats['debugLastFmStatus'];
  /** Required when `mode` is `playlist`. Absent collections are analyzed as empty. */
  playlist?: PlaylistCollection | null;
}

/** Turns raw listening data into the `Stats` object the dashboard renders. */
export async function computeStats(source: ListeningDataSource, options: ComputeStatsOptions): Promise<Stats> {
  const { timeRange, limit, mode } = options;

  // Fetch initial data in parallel
  const [recentlyPlayed, topTracksRaw, topArtistsRaw] = await Promise.all([
    source.getRecentlyPlayed(limit),
    source.getTopTracks(timeRange, 50),
    source.getTopArtists(timeRange, 50)
  ]);

  const lastFmUnavailable = new Set<string>();
  const enhance = async (artists: SpotifyApi.ArtistObjectFull[]) => {
    const result = await source.enhanceArtists(artists);
    result.lastFmUnavailable.forEach(name => lastFmUnavailable.add(name));
    return result.artists;
  };
  const fetchEnhancedArtistsById = async (artistIds: string[]) => {
    const raw = await source.fetchArtistsByIds(artistIds);
    const enhanced = await enhance(Object.values(raw));
    return Object.fromEntries(enhanced.map(artist => [artist.id, artist]));
  };

  // Enhance top artists for artists with thin genres
  const enhancedTopArtists = await enhance(topArtistsRaw);

  // Recent plays come from the same recently-played window, never from rank.
  const recentPlays = countRecentPlays(recentlyPlayed);
  const topArtists: TopArtistItem[] = enhancedTopArtists.map(artist => ({
    ...artist,
    recentPlays: recentPlays.artists.get(artist.id) ?? 0
  }));
  const topTracks: TopTrackItem[] = topTracksRaw.map(track => {
    const plays = recentPlays.tracks.get(track.id);
    return {
      ...track,
      recentPlays: plays?.count ?? 0,
      ...(plays ? { lastPlayed: plays.lastPlayed } : {})
    };
  });

  // Calculate top genres from top artists
  const topGenres = calculateTopGenres(topArtists);

  let trackStats, artistStats, genreStats, totalPlays, totalDuration, totalGenres, averagePopularity;
  let playlistAnalysis: PlaylistAnalysis | undefined;

  switch (mode) {
    case 'topTracks': {
      // Top Tracks mode: Spotify's ranked list, each track counted once
      const artistIds = Array.from(new Set(
        topTracks.flatMap(track => track.artists.map(artist => artist.id))
      ));
      const topTracksArtistsById = await fetchEnhancedArtistsById(artistIds);

      const statsResult = calculateTopTracksStats(topTracks, topTracksArtistsById);
      trackStats = statsResult.trackStats;
      artistStats = statsResult.artistStats;
      genreStats = statsResult.genreStats;
      totalPlays = statsResult.totalWeight;
      totalDuration = statsResult.totalDuration;
      totalGenres = Object.values(topTracksArtistsById).reduce((sum, artist) => sum + (artist.genres?.length || 0), 0);

      const totalPopularityTracks = topTracks.reduce((sum, track) => sum + (track.popularity || 0), 0);
      averagePopularity = topTracks.length > 0 ? Math.round(totalPopularityTracks / topTracks.length) : 0;
      break;
    }
    case 'topArtists': {
      // Top Artists mode: Spotify's ranked list, each artist counted once
      const statsResult = calculateTopArtistsStats(topArtists, topTracks);
      trackStats = statsResult.trackStats;
      artistStats = statsResult.artistStats;
      genreStats = statsResult.genreStats;
      totalPlays = statsResult.totalWeight;
      totalDuration = statsResult.totalDuration;
      totalGenres = topArtists.reduce((sum, artist) => sum + (artist.genres?.length || 0), 0);

      const totalPopularityArtists = trackStats.reduce((sum, track) => sum + (track.track.popularity || 0), 0);
      averagePopularity = trackStats.length > 0 ? Math.round(totalPopularityArtists / trackStats.length) : 0;
      break;
    }
    case 'playlist': {
      const collection = options.playlist ?? { id: 'liked', name: 'Liked Songs', total: 0, tracks: [] };
      const artistIds = Array.from(new Set(
        collection.tracks.flatMap(item => item.track.artists.map(artist => artist.id).filter(Boolean))
      ));
      const playlistArtistsById = await fetchEnhancedArtistsById(artistIds);
      const addedAtById = new Map(collection.tracks.map(item => [item.track.id, item.addedAt]));
      const statsResult = calculateTopTracksStats(
        collection.tracks.map(item => item.track),
        playlistArtistsById
      );
      trackStats = statsResult.trackStats.map(stat => {
        const addedAt = addedAtById.get(stat.track.id);
        return addedAt ? { ...stat, firstPlayed: addedAt, lastPlayed: addedAt } : stat;
      });
      artistStats = statsResult.artistStats;
      genreStats = statsResult.genreStats;
      totalPlays = statsResult.totalWeight;
      totalDuration = statsResult.totalDuration;
      totalGenres = Object.values(playlistArtistsById).reduce((sum, artist) => sum + (artist.genres?.length || 0), 0);
      const totalPopularity = collection.tracks.reduce((sum, item) => sum + (item.track.popularity || 0), 0);
      averagePopularity = collection.tracks.length > 0 ? Math.round(totalPopularity / collection.tracks.length) : 0;
      playlistAnalysis = {
        id: collection.id,
        name: collection.name,
        ...(collection.image ? { image: collection.image } : {}),
        total: collection.total,
        analyzed: trackStats.length,
      };
      break;
    }
    case 'recent':
    default: {
      // Recently Played mode: use actual play counts
      const artistIds = Array.from(new Set(
        recentlyPlayed.flatMap(item => item.track.artists.map(artist => artist.id))
      ));
      const recentlyPlayedArtistsById = await fetchEnhancedArtistsById(artistIds);

      trackStats = calculateTrackStats(recentlyPlayed, recentlyPlayedArtistsById);
      artistStats = calculateArtistStats(recentlyPlayed, recentlyPlayedArtistsById);
      genreStats = calculateGenreStats(recentlyPlayed, recentlyPlayedArtistsById);
      totalPlays = recentlyPlayed.length;
      totalDuration = recentlyPlayed.reduce((sum, item) => sum + item.track.duration_ms, 0);
      totalGenres = Object.values(recentlyPlayedArtistsById).reduce((sum, artist) => sum + (artist.genres?.length || 0), 0);

      const totalPopularityRecent = recentlyPlayed.reduce((sum, item) => sum + (item.track.popularity || 0), 0);
      averagePopularity = totalPlays > 0 ? Math.round(totalPopularityRecent / totalPlays) : 0;
      break;
    }
  }

  const stats: Stats = {
    overview: {
      totalPlays,
      uniqueArtists: artistStats.length,
      uniqueTracks: trackStats.length,
      uniqueGenres: genreStats.length,
      totalDuration,
      averageSessionLength: totalDuration / Math.max(totalPlays, 1) / 60000, // in minutes
      genreDiversity: genreStats.length / Math.max(totalGenres, 1),
      artistDiversity: artistStats.length / Math.max(totalPlays, 1),
      averagePopularity,
      genreCoverage: 0 // Will be computed below
    },
    recentlyPlayed,
    tracks: trackStats,
    artists: artistStats,
    genres: genreStats,
    topTracks,
    topArtists,
    topGenres,
    timeRange,
    mode,
    ...(playlistAnalysis ? { playlist: playlistAnalysis } : {}),
    ...(lastFmUnavailable.size > 0 && { lastFmUnavailableCount: lastFmUnavailable.size })
  };

  // Compute genre coverage using the improved classification system
  // Import here to avoid circular dependencies
  const { calculateWeightedVACRSScoreWithCoverage } = await import('@/utils/musicClassification');
  const coverageResult = calculateWeightedVACRSScoreWithCoverage(genreStats);
  stats.overview.genreCoverage = coverageResult.coverage;

  const { unmatchedGenreNames } = await import('@/utils/improvedClassification');
  const { isJunkTag } = await import('@/utils/lastfm');
  const candidateNames = genreStats.map(genre => genre.genre);
  for (const { artist } of artistStats) {
    const tags = (artist as LastFmEnhancedArtist)._lastFmData?.rawTags ?? [];
    for (const tag of tags) {
      if (!isJunkTag(tag.name)) candidateNames.push(tag.name);
    }
  }
  stats.unmatchedGenres = unmatchedGenreNames(candidateNames);

  // Debug data, derived from what the pipeline above already fetched (no extra requests)
  if (options.includeDebug) {
    const { classifyGenresWithDetails } = await import('@/utils/musicClassification');
    const { explainGenreMatch } = await import('@/utils/improvedClassification');
    const { isJunkTag } = await import('@/utils/lastfm');

    stats.debugLastFmStatus = options.debugLastFmStatus;

    const debugData: ArtistGenreDebugInfo[] = artistStats.map(({ artist }) => {
      const { genres = [], _spotifyGenres, _lastFmData: lastFmData } = artist as LastFmEnhancedArtist;
      const spotifyGenres = _spotifyGenres ?? genres;
      const spotifyGenresSet = new Set(spotifyGenres);
      const lastFmTagsUsedSet = new Set(genres.filter(genre => !spotifyGenresSet.has(genre)));

      const classifications = classifyGenresWithDetails(genres);

      const spotifyTags: GenreTagDebugInfo[] = spotifyGenres.map(tag => {
        const explanation = explainGenreMatch(tag);
        return {
          tag,
          source: 'spotify',
          ...explanation,
          usedInScoring: explanation.scoresFrom !== null
        };
      });

      const lastFmTags: GenreTagDebugInfo[] = (lastFmData?.rawTags ?? []).map(({ name, count }) => ({
        tag: name,
        source: 'lastfm',
        ...explainGenreMatch(name),
        weight: count,
        filteredAsJunk: isJunkTag(name),
        usedInScoring: lastFmTagsUsedSet.has(name)
      }));

      return {
        artistName: artist.name,
        hasLastFmData: lastFmData !== undefined,
        tags: [...spotifyTags, ...lastFmTags],
        vacrsScores: classifications.scores,
        coverage: classifications.coverage
      };
    });
    stats.debugGenreData = debugData;
  }

  return stats;
}

/** Drops server-only fields (e.g. `_lastFmData`, `_spotifyGenres`) from the response */
export const stripInternalFields = (key: string, value: unknown) => key.startsWith('_') ? undefined : value;

/** Reads and clamps the stats query params shared by the live and demo endpoints. */
export function parseStatsParams(searchParams: URLSearchParams) {
  const timeRange = (searchParams.get('timeRange') as TimeRange) || 'medium_term';
  const limit = Math.min(50, Math.max(5, parseInt(searchParams.get('limit') || '50', 10))); // Ensure limit is between 5 and 50
  const mode = (searchParams.get('mode') as DataMode) || 'recent';
  return { timeRange, limit, mode };
}
