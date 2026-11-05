import { NextRequest, NextResponse } from 'next/server';
import { getRecentlyPlayed, getTopTracks, getTopArtists, fetchArtistsInBatches, enhanceArtistsWithLastFm, getLikedSongsCollection, getPlaylistCollection, MissingScopeError, InvalidPlaylistError } from '@/lib/spotify';
import { setAuthCookies, UnauthenticatedError, withSpotifyAccessToken } from '@/lib/auth';
import { computeStats, parseStatsParams, stripInternalFields, type ListeningDataSource } from '@/lib/statsPipeline';
import { LIKED_SONGS_ID, Stats } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<Stats | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const { timeRange, limit, mode } = parseStatsParams(searchParams);
    const lastFmApiKey = searchParams.get('lastfm') === '0' ? undefined : process.env.LASTFM_API_KEY;

    const spotifySource: ListeningDataSource = {
      getRecentlyPlayed,
      getTopTracks,
      getTopArtists,
      fetchArtistsByIds: fetchArtistsInBatches,
      // Server-side only, cached 7 days
      enhanceArtists: artists => enhanceArtistsWithLastFm(artists, lastFmApiKey)
    };

    const playlistId = searchParams.get('playlist') || LIKED_SONGS_ID;
    const { result: stats, refreshedTokens } = await withSpotifyAccessToken(request, async () => {
      const playlist = mode === 'playlist'
        ? (playlistId === LIKED_SONGS_ID ? await getLikedSongsCollection() : await getPlaylistCollection(playlistId))
        : null;
      return computeStats(spotifySource, {
        timeRange,
        limit,
        mode,
        playlist,
        includeDebug: process.env.NODE_ENV === 'development',
        debugLastFmStatus: lastFmApiKey
          ? 'on'
          : process.env.LASTFM_API_KEY ? 'disabled' : 'no-api-key'
      });
    });

    const response = new NextResponse<Stats>(JSON.stringify(stats, stripInternalFields), {
      headers: { 'content-type': 'application/json' }
    });
    if (refreshedTokens) setAuthCookies(response, refreshedTokens);
    return response;
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }
    if (error instanceof MissingScopeError) {
      return NextResponse.json({ error: 'missing_scope', scope: error.scope }, { status: 403 });
    }
    if (error instanceof InvalidPlaylistError) {
      return NextResponse.json({ error: 'Invalid playlist' }, { status: 400 });
    }
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 404) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
