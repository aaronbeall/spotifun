import {
  calculateTrackStats, calculateArtistStats, calculateGenreStats, calculateTopGenres,
  calculateTopTracksStats, calculateTopArtistsStats, countRecentPlays, asArtist
} from '@/lib/listening';
import type { LastFmEnhancedArtist } from '@/lib/listening';
import { Stats, TimeRange, DataMode, ArtistGenreDebugInfo, GenreTagDebugInfo, TopArtistItem, TopTrackItem, PlaylistAnalysis, TIME_RANGES, DEFAULT_TIME_RANGE, LIKED_SONGS_NAME } from '@/types';
import type { Artist, ArtistRef, Play, Track } from '@/types/music';
import { genreFamilySpread } from '@/utils/improvedClassification';

/** A set of songs analyzed as a whole in playlist mode (Loved Tracks, or a dev sample). */
export interface PlaylistCollection {
  id: string;
  name: string;
  image?: string;
  total: number;
  tracks: { track: Track; addedAt: string }[];
}

/**
 * Where the stats pipeline gets its raw listening data. The live implementation reads
 * Last.fm and fills artwork from Deezer; demo mode serves a made-up dataset with the same shapes.
 */
export interface ListeningDataSource {
  getRecentlyPlayed(limit: number): Promise<Play[]>;
  getTopTracks(timeRange: TimeRange, limit: number): Promise<Track[]>;
  getTopArtists(timeRange: TimeRange, limit: number): Promise<Artist[]>;
  /** Full details (images, popularity) for credited artists, keyed by id. Unknown artists may be left out. */
  fetchArtists(artists: ArtistRef[]): Promise<Record<string, Artist>>;
  /** Merges genre tags (Last.fm) into artists. Returns artists plus names that couldn't be enriched. */
  enhanceArtists(artists: LastFmEnhancedArtist[]): Promise<{ artists: LastFmEnhancedArtist[]; lastFmUnavailable: string[] }>;
  /** Fills artwork, lengths, popularity and (optionally) release dates on tracks. Optional. */
  enrichTracks?<T extends Track>(tracks: T[], options?: { releaseDates?: boolean }): Promise<T[]>;
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

/** Mean of the popularity scores that are known (tracks Deezer couldn't match have none), or 0. */
export function averageKnownPopularity(values: (number | undefined)[]): number {
  const known = values.filter((value): value is number => typeof value === 'number');
  return known.length > 0 ? Math.round(known.reduce((sum, value) => sum + value, 0) / known.length) : 0;
}

/** Turns raw listening data into the `Stats` object the dashboard renders. */
export async function computeStats(source: ListeningDataSource, options: ComputeStatsOptions): Promise<Stats> {
  const { timeRange, limit, mode } = options;

  const enrichTracks = <T extends Track>(tracks: T[], releaseDates = false) =>
    source.enrichTracks ? source.enrichTracks(tracks, { releaseDates }) : Promise.resolve(tracks);

  // Fetch initial data in parallel
  const [recentlyPlayedRaw, topTracksBare, topArtistsBare] = await Promise.all([
    source.getRecentlyPlayed(limit),
    source.getTopTracks(timeRange, 50),
    source.getTopArtists(timeRange, 50)
  ]);

  // Artwork, lengths and popularity. Release dates only where the era is read from:
  // the top tracks, or the analyzed collection in playlist mode.
  const [recentTracks, topTracksRaw, topArtistsWithImages] = await Promise.all([
    enrichTracks(recentlyPlayedRaw.map(play => play.track)),
    enrichTracks(topTracksBare, mode !== 'playlist'),
    source.fetchArtists(topArtistsBare).then(found => topArtistsBare.map(artist => ({
      ...artist,
      ...found[artist.id],
      playcount: artist.playcount,
    }))),
  ]);
  const recentlyPlayed: Play[] = recentlyPlayedRaw.map((play, index) => ({ ...play, track: recentTracks[index] }));
  const topArtistsRaw = topArtistsWithImages;

  const lastFmUnavailable = new Set<string>();
  const enhance = async (artists: Artist[]) => {
    const result = await source.enhanceArtists(artists);
    result.lastFmUnavailable.forEach(name => lastFmUnavailable.add(name));
    return result.artists;
  };
  const fetchEnhancedArtists = async (refs: ArtistRef[]) => {
    const unique = [...new Map(refs.map(ref => [ref.id, ref])).values()];
    const fetched = await source.fetchArtists(unique);
    const full = unique.map(ref => fetched[ref.id] ?? asArtist(ref));
    const enhanced = await enhance(full);
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

  let trackStats, artistStats, genreStats, totalPlays, totalDuration, averagePopularity;
  let playlistAnalysis: PlaylistAnalysis | undefined;

  switch (mode) {
    case 'topTracks': {
      // Top Tracks mode: the ranked list, weighted by the listener's play counts
      const topTracksArtistsById = await fetchEnhancedArtists(topTracks.flatMap(track => track.artists));

      const statsResult = calculateTopTracksStats(topTracks, topTracksArtistsById);
      trackStats = statsResult.trackStats;
      artistStats = statsResult.artistStats;
      genreStats = statsResult.genreStats;
      totalPlays = statsResult.totalWeight;
      totalDuration = statsResult.totalDuration;

      averagePopularity = averageKnownPopularity(topTracks.map(track => track.popularity));
      break;
    }
    case 'topArtists': {
      // Top Artists mode: the ranked artists, weighted by the listener's play counts
      const statsResult = calculateTopArtistsStats(topArtists, topTracks);
      trackStats = statsResult.trackStats;
      artistStats = statsResult.artistStats;
      genreStats = statsResult.genreStats;
      totalPlays = statsResult.totalWeight;
      totalDuration = statsResult.totalDuration;

      averagePopularity = averageKnownPopularity(trackStats.map(track => track.track.popularity))
        || averageKnownPopularity(topArtists.map(artist => artist.popularity));
      break;
    }
    case 'playlist': {
      const bareCollection = options.playlist ?? { id: 'liked', name: LIKED_SONGS_NAME, total: 0, tracks: [] };
      const enrichedCollectionTracks = await enrichTracks(bareCollection.tracks.map(item => item.track), true);
      const collection = {
        ...bareCollection,
        tracks: bareCollection.tracks.map((item, index) => ({ ...item, track: enrichedCollectionTracks[index] })),
      };
      const playlistArtistsById = await fetchEnhancedArtists(collection.tracks.flatMap(item => item.track.artists));
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
      averagePopularity = averageKnownPopularity(collection.tracks.map(item => item.track.popularity));
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
      const recentlyPlayedArtistsById = await fetchEnhancedArtists(recentlyPlayed.flatMap(item => item.track.artists));

      trackStats = calculateTrackStats(recentlyPlayed, recentlyPlayedArtistsById);
      artistStats = calculateArtistStats(recentlyPlayed, recentlyPlayedArtistsById);
      genreStats = calculateGenreStats(recentlyPlayed, recentlyPlayedArtistsById);
      totalPlays = recentlyPlayed.length;
      totalDuration = recentlyPlayed.reduce((sum, item) => sum + item.track.duration_ms, 0);

      averagePopularity = averageKnownPopularity(recentlyPlayed.map(item => item.track.popularity));
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
      genreDiversity: genreFamilySpread(artistStats.map(artist => artist.genres)),
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
      const { genres = [], _baseGenres, _lastFmData: lastFmData } = artist as LastFmEnhancedArtist;
      const baseGenres = _baseGenres ?? genres;
      const baseGenresSet = new Set(baseGenres);
      const lastFmTagsUsedSet = new Set(genres.filter(genre => !baseGenresSet.has(genre)));

      const classifications = classifyGenresWithDetails(genres);

      const baseTags: GenreTagDebugInfo[] = baseGenres.map(tag => {
        const explanation = explainGenreMatch(tag);
        return {
          tag,
          source: 'seed',
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
        tags: [...baseTags, ...lastFmTags],
        vacrsScores: classifications.scores,
        coverage: classifications.coverage
      };
    });
    stats.debugGenreData = debugData;
  }

  return stats;
}

/** Drops server-only fields (e.g. `_lastFmData`, `_baseGenres`) from the response */
export const stripInternalFields = (key: string, value: unknown) => key.startsWith('_') ? undefined : value;

/** Most recent plays a profile can be built from (one Last.fm page) */
export const MAX_RECENT_PLAYS = 200;

/** Reads and clamps the stats query params shared by the live and demo endpoints. */
export function parseStatsParams(searchParams: URLSearchParams) {
  const requestedRange = searchParams.get('timeRange') as TimeRange;
  const timeRange = TIME_RANGES.includes(requestedRange) ? requestedRange : DEFAULT_TIME_RANGE;
  const parsedLimit = parseInt(searchParams.get('limit') || '50', 10);
  const limit = Math.min(MAX_RECENT_PLAYS, Math.max(5, Number.isFinite(parsedLimit) ? parsedLimit : 50));
  const mode = (searchParams.get('mode') as DataMode) || 'recent';
  return { timeRange, limit, mode };
}
