import { NextRequest, NextResponse } from 'next/server';
import {
  spotifyApi, getRecentlyPlayed, getTopTracks, getTopArtists, calculateTrackStats, calculateArtistStats,
  calculateGenreStats, calculateTopGenres, fetchArtistsInBatches
} from '@/lib/spotify';
import { Stats, TimeRange } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<Stats | { error: string }>> {
  try {
    const accessToken = request.cookies.get('spotify_access_token')?.value;
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') as TimeRange) || 'medium_term';

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    spotifyApi.setAccessToken(accessToken);

    // Fetch initial data in parallel
    const [recentlyPlayed, topTracks, topArtists] = await Promise.all([
      getRecentlyPlayed(50),
      getTopTracks(timeRange, 50),
      getTopArtists(timeRange, 50)
    ]);

    // Get all unique artist IDs from recently played tracks
    const artistIds = Array.from(new Set(
      recentlyPlayed.flatMap(item => item.track.artists.map(artist => artist.id))
    ));

    // Fetch all artist details in batches
    const artistDetails = await fetchArtistsInBatches(artistIds);

    // Calculate top genres from top artists
    const topGenres = calculateTopGenres(topArtists);

    // Calculate statistics in parallel with pre-fetched artist data
    const [trackStats, artistStats, genreStats] = await Promise.all([
      calculateTrackStats(recentlyPlayed),
      calculateArtistStats(recentlyPlayed, artistDetails),
      calculateGenreStats(recentlyPlayed, artistDetails)
    ]);

    // Calculate additional metrics
    const totalPlays = recentlyPlayed.length;
    const uniqueArtists = new Set(recentlyPlayed.flatMap(item => item.track.artists.map(artist => artist.id))).size;
    const uniqueTracks = new Set(recentlyPlayed.map(item => item.track.id)).size;
    const totalDuration = recentlyPlayed.reduce((sum, item) => sum + item.track.duration_ms, 0);

    const stats: Stats = {
      overview: {
        totalPlays,
        uniqueArtists,
        uniqueTracks,
        totalDuration,
        averageSessionLength: totalDuration / totalPlays / 60000, // in minutes
        // Genre diversity: Ratio of unique genres to unique artists (0-1 scale)
        // Higher values indicate listening to artists from many different genres
        // Lower values indicate focusing on a few specific genres
        genreDiversity: genreStats.length / Math.max(uniqueArtists, 1),

        // Artist diversity: Ratio of unique artists to total plays (0-1 scale)
        // Higher values indicate listening to many different artists
        // Lower values indicate listening to the same artists repeatedly
        artistDiversity: uniqueArtists / Math.max(totalPlays, 1)
      },
      tracks: trackStats,
      artists: artistStats,
      genres: genreStats,
      topTracks,
      topArtists,
      topGenres,
      timeRange
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
