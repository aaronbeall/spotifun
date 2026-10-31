import { NextRequest, NextResponse } from 'next/server';
import { getLikedSongsSummary, getUserPlaylistSummaries, MissingScopeError } from '@/lib/spotify';
import { setAuthCookies, UnauthenticatedError, withSpotifyAccessToken } from '@/lib/auth';
import { PlaylistsResponse } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<PlaylistsResponse | { error: string }>> {
  try {
    const { result, refreshedTokens } = await withSpotifyAccessToken(request, async () => {
      const [playlists, liked] = await Promise.all([
        getUserPlaylistSummaries(),
        getLikedSongsSummary().then(
          likedSongs => ({ likedSongs, likedSongsNeedsReconnect: false }),
          (error: unknown) => {
            if (error instanceof MissingScopeError) {
              return { likedSongs: null, likedSongsNeedsReconnect: true };
            }
            throw error;
          }
        ),
      ]);

      const body: PlaylistsResponse = {
        likedSongs: liked.likedSongs,
        likedSongsNeedsReconnect: liked.likedSongsNeedsReconnect,
        playlists,
      };
      return body;
    });

    const response = NextResponse.json(result);
    if (refreshedTokens) setAuthCookies(response, refreshedTokens);
    return response;
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }
    console.error('Error fetching playlists:', error);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}
