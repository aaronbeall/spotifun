import { NextRequest, NextResponse } from 'next/server';
import {
  getRecentlyPlayed, getTopTracks, getTopArtists, calculateTrackStats, calculateArtistStats,
  calculateGenreStats, calculateTopGenres, fetchArtistsInBatches,
  calculateTopTracksStats, calculateTopArtistsStats, enhanceArtistsWithLastFm
} from '@/lib/spotify';
import { setAuthCookies, UnauthenticatedError, withSpotifyAccessToken } from '@/lib/auth';
import { Stats, TimeRange, DataMode, ArtistGenreDebugInfo, GenreTagDebugInfo } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<Stats | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') as TimeRange) || 'medium_term';
    const limit = Math.min(50, Math.max(5, parseInt(searchParams.get('limit') || '50', 10))); // Ensure limit is between 5 and 50
    const mode = (searchParams.get('mode') as DataMode) || 'recent';
    const lastFmApiKey = searchParams.get('lastfm') === '0' ? undefined : process.env.LASTFM_API_KEY;

    const { result: stats, refreshedTokens } = await withSpotifyAccessToken(request, async () => {
      // Fetch initial data in parallel
      const [recentlyPlayed, topTracksRaw, topArtistsRaw] = await Promise.all([
        getRecentlyPlayed(limit),
        getTopTracks(timeRange, 50),
        getTopArtists(timeRange, 50)
      ]);

      // Enhance top artists with Last.fm data for artists with thin genres
      // This is server-side only, cached 7 days, rate-limited
      const topArtists = await enhanceArtistsWithLastFm(
        topArtistsRaw,
        lastFmApiKey
      );
      
      const topTracks = topTracksRaw;

      // Calculate top genres from top artists
      const topGenres = calculateTopGenres(topArtists);

      let trackStats, artistStats, genreStats, totalPlays, totalDuration, totalGenres, averagePopularity;

      switch (mode) {
        case 'topTracks': {
          // Top Tracks mode: use rank-based weights from top tracks
          const artistIds = Array.from(new Set(
            topTracks.flatMap(track => track.artists.map(artist => artist.id))
          ));
          const topTracksArtistsByIdRaw = await fetchArtistsInBatches(artistIds);
          
          // Enhance these artists with Last.fm too
          const topTracksArtistsArray = await enhanceArtistsWithLastFm(
            Object.values(topTracksArtistsByIdRaw),
            lastFmApiKey
          );
          const topTracksArtistsById = Object.fromEntries(
            topTracksArtistsArray.map(artist => [artist.id, artist])
          );

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
          // Top Artists mode: use rank-based weights, match tracks from user's top tracks
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
        case 'recent':
        default: {
          // Recently Played mode: use actual play counts
          const artistIds = Array.from(new Set(
            recentlyPlayed.flatMap(item => item.track.artists.map(artist => artist.id))
          ));
          const recentlyPlayedArtistsByIdRaw = await fetchArtistsInBatches(artistIds);
          
          // Enhance these artists with Last.fm too
          const recentlyPlayedArtistsArray = await enhanceArtistsWithLastFm(
            Object.values(recentlyPlayedArtistsByIdRaw),
            lastFmApiKey
          );
          const recentlyPlayedArtistsById = Object.fromEntries(
            recentlyPlayedArtistsArray.map(artist => [artist.id, artist])
          );

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
        mode
      };

      // Compute genre coverage using the improved classification system
      // Import here to avoid circular dependencies
      const { calculateWeightedVACRSScoreWithCoverage } = await import('@/utils/musicClassification');
      const coverageResult = calculateWeightedVACRSScoreWithCoverage(genreStats);
      stats.overview.genreCoverage = coverageResult.coverage;

      // Dev-only debug data: include per-artist genre classification details
      if (process.env.NODE_ENV === 'development' && searchParams.get('debugGenres') === '1') {
        const { classifyGenresWithDetails } = await import('@/utils/musicClassification');
        const { explainGenreMatch } = await import('@/utils/improvedClassification');

        const { batchFetchLastFmTagsRaw, isJunkTag } = await import('@/utils/lastfm');

        // Raw Last.fm tags for every artist, for display only. Scoring still uses the
        // filtered tags attached by enhanceArtistsWithLastFm (thin-genre artists only).
        const rawLastFmTags = lastFmApiKey
          ? await batchFetchLastFmTagsRaw(
              Array.from(new Set(artistStats.map(({ artist }) => artist.name))),
              lastFmApiKey
            )
          : new Map<string, Array<{ name: string; count: number }>>();
        stats.debugLastFmStatus = lastFmApiKey
          ? 'on'
          : process.env.LASTFM_API_KEY ? 'disabled' : 'no-api-key';

        const debugData: ArtistGenreDebugInfo[] = artistStats.map(({ artist }) => {
          const spotifyGenres = artist.genres || [];
          const lastFmClassifications: Array<{ originalGenre: string; matchedGenre: string | null; scores: unknown }> =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (artist as any)._lastFmData?.classifications || [];
          // Must mirror getEffectiveGenres in lib/spotify.ts: Last.fm tags only count for
          // thin-genre artists, and only when they resolve to a taxonomy node.
          const lastFmTagsUsed = spotifyGenres.length <= 2
            ? lastFmClassifications.filter(c => c.matchedGenre && c.scores).map(c => c.originalGenre)
            : [];
          const lastFmTagsUsedSet = new Set(lastFmTagsUsed);

          const classifications = classifyGenresWithDetails([...spotifyGenres, ...lastFmTagsUsed]);

          const spotifyTags: GenreTagDebugInfo[] = spotifyGenres.map(tag => {
            const explanation = explainGenreMatch(tag);
            return {
              tag,
              source: 'spotify',
              ...explanation,
              usedInScoring: explanation.scoresFrom !== null
            };
          });

          const lastFmTags: GenreTagDebugInfo[] = (rawLastFmTags.get(artist.name) ?? []).map(({ name, count }) => ({
            tag: name,
            source: 'lastfm',
            ...explainGenreMatch(name),
            weight: count,
            filteredAsJunk: isJunkTag(name),
            usedInScoring: lastFmTagsUsedSet.has(name)
          }));

          return {
            artistName: artist.name,
            tags: [...spotifyTags, ...lastFmTags],
            vacrsScores: classifications.scores,
            coverage: classifications.coverage
          };
        });
        stats.debugGenreData = debugData;
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
