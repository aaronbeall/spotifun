import { NextRequest, NextResponse } from 'next/server';
import { spotifyApi } from '@/lib/spotify';
import { setAuthCookies, UnauthenticatedError, withSpotifyAccessToken } from '@/lib/auth';
import { NowPlaying } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<NowPlaying | { error: string }>> {
  try {
    const { result: body, refreshedTokens } = await withSpotifyAccessToken(request, async () => {
      const { body } = await spotifyApi.getMyCurrentPlaybackState();
      return body;
    });

    const item = body?.item;
    const track = item && 'artists' in item ? {
      id: item.id,
      name: item.name,
      artist: item.artists.map(a => a.name).join(', '),
      image: item.album?.images?.[0]?.url,
      url: item.external_urls?.spotify,
    } : null;

    const payload: NowPlaying = {
      isPlaying: body?.is_playing ?? false,
      track,
    };

    const response = NextResponse.json(payload);
    if (refreshedTokens) setAuthCookies(response, refreshedTokens);
    return response;
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }
    console.error('Error fetching playback state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playback state' },
      { status: 500 }
    );
  }
}
