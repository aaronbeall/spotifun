import { NextRequest, NextResponse } from 'next/server';
import {
  getRecentlyPlayed, getTopTracks, getTopArtists, calculateTrackStats, calculateArtistStats,
  calculateGenreStats, calculateTopGenres, fetchArtistsInBatches,
  calculateTopTracksStats, calculateTopArtistsStats, enhanceArtistsWithLastFm
} from '@/lib/spotify';
import { setAuthCookies, UnauthenticatedError, withSpotifyAccessToken } from '@/lib/auth';
import { Stats, TimeRange, DataMode } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<Stats | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') as TimeRange) || 'medium_term';
    const limit = Math.min(50, Math.max(5, parseInt(searchParams.get('limit') || '50', 10))); // Ensure limit is between 5 and 50
    const mode = (searchParams.get('mode') as DataMode) || 'recent';

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
        process.env.LASTFM_API_KEY
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
            process.env.LASTFM_API_KEY
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
            process.env.LASTFM_API_KEY
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
          averagePopularity
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
