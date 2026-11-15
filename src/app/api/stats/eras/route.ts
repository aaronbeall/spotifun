import { NextRequest, NextResponse } from 'next/server';
import { getTopArtists, getTopTracks } from '@/lib/spotify';
import { setAuthCookies, UnauthenticatedError, withSpotifyAccessToken } from '@/lib/auth';
import { ERA_RANGES, eraSnapshot } from '@/lib/eraSnapshots';
import { ErasResponse } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<ErasResponse | { error: string }>> {
  try {
    const { result, refreshedTokens } = await withSpotifyAccessToken(request, async () => {
      const [artists, tracks] = await Promise.all([
        Promise.all(ERA_RANGES.map(range => getTopArtists(range.timeRange, 50))),
        Promise.all(ERA_RANGES.map(range => getTopTracks(range.timeRange, 50))),
      ]);
      return {
        eras: ERA_RANGES.map((range, index) => eraSnapshot(range.timeRange, range.label, artists[index], tracks[index])),
      };
    });

    const response = NextResponse.json(result);
    if (refreshedTokens) setAuthCookies(response, refreshedTokens);
    return response;
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }
    console.error('Error fetching time ranges:', error);
    return NextResponse.json({ error: 'Failed to fetch time ranges' }, { status: 500 });
  }
}
