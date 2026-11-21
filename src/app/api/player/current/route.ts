import { NextRequest, NextResponse } from 'next/server';
import { getUsername } from '@/lib/session';
import { getNowPlaying } from '@/lib/lastfmApi';
import { enrichTracks } from '@/lib/deezer';
import { errorResponse } from '@/lib/apiErrors';
import { NowPlaying } from '@/types';

/** What the listener's scrobbler reports as playing right now */
export async function GET(request: NextRequest): Promise<NextResponse<NowPlaying | { error: string }>> {
  try {
    const { isPlaying, track: bare } = await getNowPlaying(getUsername(request));
    const [track] = bare ? await enrichTracks([bare]) : [null];
    return NextResponse.json({
      isPlaying,
      track: track ? {
        id: track.id,
        name: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        image: track.album.images[0]?.url,
        url: track.url,
      } : null,
    });
  } catch (error) {
    return errorResponse(error, 'now playing');
  }
}
