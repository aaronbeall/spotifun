import { NextRequest, NextResponse } from 'next/server';
import {
  getRecentlyPlayed, getTopTracks, getTopArtists, calculateTrackStats, calculateArtistStats,
  calculateGenreStats, calculateTopGenres, fetchArtistsInBatches
} from '@/lib/spotify';
import { setAuthCookies, UnauthenticatedError, withSpotifyAccessToken } from '@/lib/auth';
import { Stats, TimeRange } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<Stats | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') as TimeRange) || 'medium_term';
    const limit = Math.min(50, Math.max(5, parseInt(searchParams.get('limit') || '50', 10))); // Ensure limit is between 5 and 50

    const { result: stats, refreshedTokens } = await withSpotifyAccessToken(request, async () => {
      // Fetch initial data in parallel
      const [recentlyPlayed, topTracks, topArtists] = await Promise.all([
        getRecentlyPlayed(limit),
        getTopTracks(timeRange, 50),
        getTopArtists(timeRange, 50)
      ]);

      // Get all unique artist IDs from recently played tracks
      const artistIds = Array.from(new Set(
        recentlyPlayed.flatMap(item => item.track.artists.map(artist => artist.id))
      ));

      // Fetch all artist details in batches
      const recentlyPlayedArtistsById = await fetchArtistsInBatches(artistIds);

      // Calculate top genres from top artists
      const topGenres = calculateTopGenres(topArtists);

      // Calculate statistics in parallel with pre-fetched artist data
      const [trackStats, artistStats, genreStats] = await Promise.all([
        calculateTrackStats(recentlyPlayed, recentlyPlayedArtistsById),
        calculateArtistStats(recentlyPlayed, recentlyPlayedArtistsById),
        calculateGenreStats(recentlyPlayed, recentlyPlayedArtistsById)
      ]);

      // Calculate additional metrics
      const totalPlays = recentlyPlayed.length;
      const totalDuration = recentlyPlayed.reduce((sum, item) => sum + item.track.duration_ms, 0);
      const totalGenres = Object.values(recentlyPlayedArtistsById).reduce((sum, artist) => sum + (artist.genres?.length || 0), 0);

      // Calculate average track popularity (0-100 scale)
      const totalPopularity = recentlyPlayed.reduce((sum, item) => sum + (item.track.popularity || 0), 0);
      const averagePopularity = totalPlays > 0 ? Math.round(totalPopularity / totalPlays) : 0;

      const stats: Stats = {
        overview: {
          totalPlays,
          uniqueArtists: artistStats.length,
          uniqueTracks: trackStats.length,
          uniqueGenres: genreStats.length,
          totalDuration,
          averageSessionLength: totalDuration / totalPlays / 60000, // in minutes
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
        timeRange
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
