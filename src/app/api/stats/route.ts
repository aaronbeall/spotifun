import { NextRequest, NextResponse } from 'next/server';
import { getUsername } from '@/lib/session';
import { createLastFmDataSource, getLovedCollection } from '@/lib/lastfmSource';
import { errorResponse } from '@/lib/apiErrors';
import { computeStats, parseStatsParams, stripInternalFields } from '@/lib/statsPipeline';
import { Stats } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<Stats | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const { timeRange, limit, mode } = parseStatsParams(searchParams);
    const username = getUsername(request);

    const playlist = mode === 'playlist' ? await getLovedCollection(username) : null;
    const stats = await computeStats(createLastFmDataSource(username), {
      timeRange,
      limit,
      mode,
      playlist,
      includeDebug: process.env.NODE_ENV === 'development',
      debugLastFmStatus: process.env.LASTFM_API_KEY ? 'on' : 'no-api-key',
    });

    return new NextResponse<Stats>(JSON.stringify(stats, stripInternalFields), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    return errorResponse(error, 'stats');
  }
}
