import { NextRequest, NextResponse } from 'next/server';
import { spotifyApi, getRecentlyPlayed, getTopTracks, getTopArtists, calculateTrackStats, calculateArtistStats, calculateGenreStats } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('spotify_access_token')?.value;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') as 'short_term' | 'medium_term' | 'long_term' || 'medium_term';
    
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    spotifyApi.setAccessToken(accessToken);

    // Fetch data in parallel
    const [recentlyPlayed, topTracks, topArtists] = await Promise.all([
      getRecentlyPlayed(50),
      getTopTracks(timeRange, 50),
      getTopArtists(timeRange, 50)
    ]);

    // Calculate statistics
    const trackStats = calculateTrackStats(recentlyPlayed);
    const artistStats = calculateArtistStats(recentlyPlayed);
    const genreStats = calculateGenreStats(recentlyPlayed);

    // Calculate additional metrics
    const totalPlays = recentlyPlayed.length;
    const uniqueArtists = new Set(recentlyPlayed.flatMap(item => item.track.artists.map(artist => artist.id))).size;
    const uniqueTracks = new Set(recentlyPlayed.map(item => item.track.id)).size;
    const totalDuration = recentlyPlayed.reduce((sum, item) => sum + item.track.duration_ms, 0);

    const stats = {
      overview: {
        totalPlays,
        uniqueArtists,
        uniqueTracks,
        totalDuration,
        averageSessionLength: totalDuration / totalPlays / 60000, // in minutes
        genreDiversity: genreStats.length / Math.max(uniqueArtists, 1),
        artistDiversity: uniqueArtists / Math.max(totalPlays, 1)
      },
      tracks: trackStats.slice(0, 20),
      artists: artistStats.slice(0, 20),
      genres: genreStats.slice(0, 15),
      topTracks,
      topArtists,
      timeRange
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

