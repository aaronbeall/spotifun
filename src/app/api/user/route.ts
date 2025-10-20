import { NextRequest, NextResponse } from 'next/server';
import { spotifyApi } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('spotify_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    spotifyApi.setAccessToken(accessToken);
    const user = await spotifyApi.getMe();
    
    return NextResponse.json(user.body);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}

