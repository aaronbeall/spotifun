import { NextRequest, NextResponse } from 'next/server';
import { spotifyApi } from '@/lib/spotify';
import { setAuthCookies, UnauthenticatedError, withSpotifyAccessToken } from '@/lib/auth';
import { UserProfile } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<UserProfile | { error: string }>> {
  try {
    const { result: body, refreshedTokens } = await withSpotifyAccessToken(request, async () => {
      const { body } = await spotifyApi.getMe();
      return body;
    });

    const userResponse: UserProfile = {
      id: body.id,
      display_name: body.display_name || '',
      images: body.images || [],
      email: body.email,
      product: body.product,
      followers: body.followers ? { total: body.followers.total } : undefined
    };

    const response = NextResponse.json(userResponse);
    if (refreshedTokens) setAuthCookies(response, refreshedTokens);
    return response;
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
