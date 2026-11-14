import { NextRequest, NextResponse } from 'next/server';
import { listSamplePlaylists, statsForSamplePlaylist } from '@/lib/samplePlaylists';
import { stripInternalFields } from '@/lib/statsPipeline';
import type { Stats } from '@/types';

function unavailable() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

/** Dev-only list of the frozen coverage playlists, or stats for one of them (`?id=`). */
export async function GET(request: NextRequest): Promise<NextResponse> {
  if (process.env.NODE_ENV !== 'development') return unavailable();

  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json(listSamplePlaylists());

  const stats = await statsForSamplePlaylist(id);
  if (!stats) return NextResponse.json({ error: 'Unknown sample playlist' }, { status: 404 });
  return new NextResponse<Stats>(JSON.stringify(stats, stripInternalFields), {
    headers: { 'content-type': 'application/json' },
  });
}
