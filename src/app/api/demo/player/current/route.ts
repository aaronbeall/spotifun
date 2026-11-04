import { NextResponse } from 'next/server';
import { getDemoNowPlaying } from '@/lib/demo/demoData';
import { NowPlaying } from '@/types';

/** Demo twin of /api/player/current */
export async function GET(): Promise<NextResponse<NowPlaying>> {
  return NextResponse.json(getDemoNowPlaying());
}
