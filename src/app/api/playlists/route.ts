import { NextRequest, NextResponse } from 'next/server';
import { getUsername } from '@/lib/session';
import { getLovedTracks } from '@/lib/lastfmApi';
import { errorResponse } from '@/lib/apiErrors';
import { LIKED_SONGS_ID, LIKED_SONGS_NAME, PlaylistsResponse } from '@/types';

/** Collections playlist mode can analyze. Last.fm has no playlists, only Loved Tracks. */
export async function GET(request: NextRequest): Promise<NextResponse<PlaylistsResponse | { error: string }>> {
  try {
    const loved = await getLovedTracks(getUsername(request), 1);
    return NextResponse.json({
      likedSongs: { id: LIKED_SONGS_ID, name: LIKED_SONGS_NAME, trackCount: loved.total },
      likedSongsNeedsReconnect: false,
      playlists: [],
    });
  } catch (error) {
    return errorResponse(error, 'loved tracks');
  }
}
