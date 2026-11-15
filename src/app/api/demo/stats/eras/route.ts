import { NextResponse } from 'next/server';
import { createDemoDataSource } from '@/lib/demo/demoData';
import { getArtwork } from '@/lib/demo/artwork';
import { ERA_RANGES, eraSnapshot } from '@/lib/eraSnapshots';
import { ErasResponse } from '@/types';

/** Example-profile twin of /api/stats/eras: the same three Spotify periods, from the example catalog. */
export async function GET(): Promise<NextResponse<ErasResponse>> {
  const source = createDemoDataSource(Date.now(), await getArtwork());
  const [artists, tracks] = await Promise.all([
    Promise.all(ERA_RANGES.map(range => source.getTopArtists(range.timeRange, 50))),
    Promise.all(ERA_RANGES.map(range => source.getTopTracks(range.timeRange, 50))),
  ]);
  return NextResponse.json({
    eras: ERA_RANGES.map((range, index) => eraSnapshot(range.timeRange, range.label, artists[index], tracks[index])),
  });
}
