import { NextRequest, NextResponse } from 'next/server';
import { spotifyApi } from '@/lib/spotify';
import { setAuthCookies } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Spotify auth error:', error);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=access_denied`);
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=no_code`);
    }

    // Exchange code for access token
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;

    // Get user info
    spotifyApi.setAccessToken(access_token);
    const user = await spotifyApi.getMe();

    // Store tokens in cookies (in production, use secure session storage)
    const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard`);

    setAuthCookies(response, {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
    });

    response.cookies.set('spotify_user', JSON.stringify(user.body), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'lax'
    });

    return response;
  } catch (error) {
    console.error('Error in Spotify callback:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=auth_failed`);
  }
}

