import { NextRequest, NextResponse } from 'next/server';
import { spotifyApi } from '@/lib/spotify';
import { UserProfile } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<UserProfile | { error: string }>> {
  try {
    const accessToken = request.cookies.get('spotify_access_token')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    spotifyApi.setAccessToken(accessToken);
    const { body } = await spotifyApi.getMe();

    const userResponse: UserProfile = {
      id: body.id,
      display_name: body.display_name || '',
      images: body.images || [],
      email: body.email,
      product: body.product,
      followers: body.followers ? { total: body.followers.total } : undefined
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
