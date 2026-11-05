import { NextResponse } from 'next/server';
import { getDemoNowPlaying } from '@/lib/demo/demoData';
import { getArtwork } from '@/lib/demo/artwork';
import { NowPlaying } from '@/types';

/** Example-profile twin of /api/player/current */
export async function GET(): Promise<NextResponse<NowPlaying>> {
  return NextResponse.json(getDemoNowPlaying(await getArtwork()));
}
