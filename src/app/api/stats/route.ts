import { NextRequest, NextResponse } from 'next/server';
import {
  getRecentlyPlayed, getTopTracks, getTopArtists, calculateTrackStats, calculateArtistStats,
  calculateGenreStats, calculateTopGenres, fetchArtistsInBatches,
  calculateTopTracksStats, calculateTopArtistsStats, enhanceArtistsWithLastFm
} from '@/lib/spotify';
import { setAuthCookies, UnauthenticatedError, withSpotifyAccessToken } from '@/lib/auth';
import { Stats, TimeRange, DataMode } from '@/types';

// In-memory cache for Last.fm enhanced artists (per-process)
const lastFmCache = new Map<string, { artist: SpotifyApi.ArtistObjectFull; timestamp: number }>();
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// Helper to dedupe and cache artists
function getCachedOrEnhanceArtists(
  artists: SpotifyApi.ArtistObjectFull[],
  enhancePromise: Promise<SpotifyApi.ArtistObjectFull[]>
): Promise<SpotifyApi.ArtistObjectFull[]> {
  const now = Date.now();
  const result: SpotifyApi.ArtistObjectFull[] = [];
  const needEnhancement: SpotifyApi.ArtistObjectFull[] = [];
  
  for (const artist of artists) {
    const cached = lastFmCache.get(artist.id);
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      result.push(cached.artist);
    } else {
      needEnhancement.push(artist);
    }
  }
  
  if (needEnhancement.length === 0) {
    return Promise.resolve(result.concat(artists));
  }
  
  return enhancePromise.then(enhanced => {
    // Update cache
    for (const artist of enhanced) {
      if (artist.id) {
        lastFmCache.set(artist.id, { artist, timestamp: now });
      }
    }
    return enhanced;
  });
}

export async function GET(request: NextRequest): Promise<NextResponse<Stats | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') as TimeRange) || 'medium_term';
    const limit = Math.min(50, Math.max(5, parseInt(searchParams.get('limit') || '50', 10))); // Ensure limit is between 5 and 50
    const mode = (searchParams.get('mode') as DataMode) || 'recent';
    
    const isDev = process.env.NODE_ENV === 'development';
    const startTime = Date.now();

    const { result: stats, refreshedTokens } = await withSpotifyAccessToken(request, async () => {
      // Fetch initial data in parallel
      if (isDev) console.time('fetch-spotify-data');
      const [recentlyPlayed, topTracksRaw, topArtistsRaw] = await Promise.all([
        getRecentlyPlayed(limit),
        getTopTracks(timeRange, 50),
        getTopArtists(timeRange, 50)
      ]);
      if (isDev) console.timeEnd('fetch-spotify-data');

      // Early bailout if no Last.fm API key
      const hasLastFmKey = !!process.env.LASTFM_API_KEY;
      
      // Enhance top artists with Last.fm data for artists with thin genres
      // Cap at top 20 artists to avoid long delays
      if (isDev) console.time('enhance-top-artists-lastfm');
      const topArtistsCapped = hasLastFmKey ? topArtistsRaw.slice(0, 20) : topArtistsRaw;
      const topArtists = await Promise.race([
        enhanceArtistsWithLastFm(topArtistsCapped, process.env.LASTFM_API_KEY),
        new Promise<SpotifyApi.ArtistObjectFull[]>(resolve => 
          setTimeout(() => {
            console.warn('Last.fm enhancement timed out (2.5s), continuing without missing tags');
            resolve(topArtistsCapped);
          }, 2500)
        )
      ]).then(enhanced => {
        // Merge back any artists that were capped
        if (topArtistsRaw.length > 20) {
          return [...enhanced, ...topArtistsRaw.slice(20)];
        }
        return enhanced;
      });
      if (isDev) console.timeEnd('enhance-top-artists-lastfm');
      
      const topTracks = topTracksRaw;

      // Calculate top genres from top artists
      const topGenres = calculateTopGenres(topArtists);

      let trackStats, artistStats, genreStats, totalPlays, totalDuration, totalGenres, averagePopularity;

      switch (mode) {
        case 'topTracks': {
          // Top Tracks mode: use rank-based weights from top tracks
          if (isDev) console.time('mode-topTracks-fetch-artists');
          const artistIds = Array.from(new Set(
            topTracks.flatMap(track => track.artists.map(artist => artist.id))
          ));
          const topTracksArtistsByIdRaw = await fetchArtistsInBatches(artistIds);
          if (isDev) console.timeEnd('mode-topTracks-fetch-artists');
          
          // Enhance these artists with Last.fm too (dedupe with cache, cap at 20, timeout)
          if (isDev) console.time('mode-topTracks-enhance-lastfm');
          const artistsArray = Object.values(topTracksArtistsByIdRaw);
          const artistsCapped = hasLastFmKey ? artistsArray.slice(0, 20) : artistsArray;
          const topTracksArtistsEnhanced = await Promise.race([
            enhanceArtistsWithLastFm(artistsCapped, process.env.LASTFM_API_KEY),
            new Promise<SpotifyApi.ArtistObjectFull[]>(resolve => 
              setTimeout(() => resolve(artistsCapped), 2500)
            )
          ]).then(enhanced => {
            if (artistsArray.length > 20) {
              return [...enhanced, ...artistsArray.slice(20)];
            }
            return enhanced;
          });
          const topTracksArtistsById = Object.fromEntries(
            topTracksArtistsEnhanced.map(artist => [artist.id, artist])
          );
          if (isDev) console.timeEnd('mode-topTracks-enhance-lastfm');

          if (isDev) console.time('mode-topTracks-calculate-stats');
          const statsResult = calculateTopTracksStats(topTracks, topTracksArtistsById);
          trackStats = statsResult.trackStats;
          artistStats = statsResult.artistStats;
          genreStats = statsResult.genreStats;
          totalPlays = statsResult.totalWeight;
          totalDuration = statsResult.totalDuration;
          totalGenres = Object.values(topTracksArtistsById).reduce((sum, artist) => sum + (artist.genres?.length || 0), 0);
          
          const totalPopularityTracks = topTracks.reduce((sum, track) => sum + (track.popularity || 0), 0);
          averagePopularity = topTracks.length > 0 ? Math.round(totalPopularityTracks / topTracks.length) : 0;
          if (isDev) console.timeEnd('mode-topTracks-calculate-stats');
          break;
        }
        case 'topArtists': {
          // Top Artists mode: use rank-based weights, match tracks from user's top tracks
          if (isDev) console.time('mode-topArtists-calculate-stats');
          const statsResult = calculateTopArtistsStats(topArtists, topTracks);
          trackStats = statsResult.trackStats;
          artistStats = statsResult.artistStats;
          genreStats = statsResult.genreStats;
          totalPlays = statsResult.totalWeight;
          totalDuration = statsResult.totalDuration;
          totalGenres = topArtists.reduce((sum, artist) => sum + (artist.genres?.length || 0), 0);
          
          const totalPopularityArtists = trackStats.reduce((sum, track) => sum + (track.track.popularity || 0), 0);
          averagePopularity = trackStats.length > 0 ? Math.round(totalPopularityArtists / trackStats.length) : 0;
          if (isDev) console.timeEnd('mode-topArtists-calculate-stats');
          break;
        }
        case 'recent':
        default: {
          // Recently Played mode: use actual play counts
          if (isDev) console.time('mode-recent-fetch-artists');
          const artistIds = Array.from(new Set(
            recentlyPlayed.flatMap(item => item.track.artists.map(artist => artist.id))
          ));
          const recentlyPlayedArtistsByIdRaw = await fetchArtistsInBatches(artistIds);
          if (isDev) console.timeEnd('mode-recent-fetch-artists');
          
          // Enhance these artists with Last.fm too (dedupe with cache, cap at 20, timeout)
          if (isDev) console.time('mode-recent-enhance-lastfm');
          const artistsArray = Object.values(recentlyPlayedArtistsByIdRaw);
          const artistsCapped = hasLastFmKey ? artistsArray.slice(0, 20) : artistsArray;
          const recentlyPlayedArtistsEnhanced = await Promise.race([
            enhanceArtistsWithLastFm(artistsCapped, process.env.LASTFM_API_KEY),
            new Promise<SpotifyApi.ArtistObjectFull[]>(resolve => 
              setTimeout(() => resolve(artistsCapped), 2500)
            )
          ]).then(enhanced => {
            if (artistsArray.length > 20) {
              return [...enhanced, ...artistsArray.slice(20)];
            }
            return enhanced;
          });
          const recentlyPlayedArtistsById = Object.fromEntries(
            recentlyPlayedArtistsEnhanced.map(artist => [artist.id, artist])
          );
          if (isDev) console.timeEnd('mode-recent-enhance-lastfm');

          if (isDev) console.time('mode-recent-calculate-stats');
          trackStats = calculateTrackStats(recentlyPlayed, recentlyPlayedArtistsById);
          artistStats = calculateArtistStats(recentlyPlayed, recentlyPlayedArtistsById);
          genreStats = calculateGenreStats(recentlyPlayed, recentlyPlayedArtistsById);
          totalPlays = recentlyPlayed.length;
          totalDuration = recentlyPlayed.reduce((sum, item) => sum + item.track.duration_ms, 0);
          totalGenres = Object.values(recentlyPlayedArtistsById).reduce((sum, artist) => sum + (artist.genres?.length || 0), 0);

          const totalPopularityRecent = recentlyPlayed.reduce((sum, item) => sum + (item.track.popularity || 0), 0);
          averagePopularity = totalPlays > 0 ? Math.round(totalPopularityRecent / totalPlays) : 0;
          if (isDev) console.timeEnd('mode-recent-calculate-stats');
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
        mode
      };

      // Compute genre coverage using the improved classification system
      if (isDev) console.time('compute-genre-coverage');
      const { calculateWeightedVACRSScoreWithCoverage } = await import('@/utils/musicClassification');
      const coverageResult = calculateWeightedVACRSScoreWithCoverage(genreStats);
      stats.overview.genreCoverage = coverageResult.coverage;
      if (isDev) console.timeEnd('compute-genre-coverage');

      // Dev-only debug data: include per-artist genre classification details
      if (process.env.NODE_ENV === 'development' && searchParams.get('debugGenres') === '1') {
        if (isDev) console.time('generate-debug-data');
        const { classifyGenresWithDetails } = await import('@/utils/musicClassification');
        const debugData = artistStats.map(({ artist }) => {
          const spotifyGenres = artist.genres || [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const lastFmData = (artist as any)._lastFmData;
          const lastFmTagsUsed = lastFmData?.classifications
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ?.filter((c: any) => c.matchedGenre && c.scores)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ?.map((c: any) => c.originalGenre) || [];
          
          const effectiveGenres = [...spotifyGenres, ...lastFmTagsUsed];
          const classifications = classifyGenresWithDetails(effectiveGenres);
          
          return {
            artistName: artist.name,
            spotifyGenres,
            lastFmTagsUsed,
            matchedNodes: classifications.matchedGenres,
            matchType: classifications.matchType,
            vacrsScores: classifications.scores,
            coverage: classifications.coverage
          };
        });
        stats.debugGenreData = debugData;
        if (isDev) console.timeEnd('generate-debug-data');
      }

      if (isDev) {
        const totalTime = Date.now() - startTime;
        console.log(`✓ Stats route completed in ${totalTime}ms (mode: ${mode})`);
      }

      return stats;
    });

    const response = NextResponse.json(stats);
    if (refreshedTokens) setAuthCookies(response, refreshedTokens);
    return response;
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
