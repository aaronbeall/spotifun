import { NextRequest, NextResponse } from 'next/server';
import { createDemoDataSource } from '@/lib/demo/demoData';
import { getArtwork } from '@/lib/demo/artwork';
import { computeStats, parseStatsParams, stripInternalFields } from '@/lib/statsPipeline';
import { Stats } from '@/types';

/** Example-profile twin of /api/stats: same pipeline and response shape, example listening data, no login. */
export async function GET(request: NextRequest): Promise<NextResponse<Stats>> {
  const { timeRange, limit, mode } = parseStatsParams(new URL(request.url).searchParams);
  const stats = await computeStats(createDemoDataSource(Date.now(), await getArtwork()), {
    timeRange,
    limit,
    mode,
    includeDebug: process.env.NODE_ENV === 'development',
    debugLastFmStatus: 'disabled'
  });
  return new NextResponse<Stats>(JSON.stringify(stats, stripInternalFields), {
    headers: { 'content-type': 'application/json' }
  });
}
