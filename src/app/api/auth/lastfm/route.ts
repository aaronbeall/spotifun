import { NextRequest, NextResponse } from 'next/server';
import { LastFmAuthError, newSignInState, signInUrl } from '@/lib/lastfmAuth';
import { SIGN_IN_STATE_COOKIE } from '@/lib/session';

/** Sends the listener to Last.fm to sign in. Last.fm comes back to ./callback. */
export function GET(request: NextRequest) {
  const state = newSignInState();
  const callback = new URL('/api/auth/lastfm/callback', request.nextUrl.origin);
  callback.searchParams.set('state', state);
  try {
    const response = NextResponse.redirect(signInUrl(callback.toString()));
    response.cookies.set(SIGN_IN_STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60,
      sameSite: 'lax',
      path: '/',
    });
    return response;
  } catch (error) {
    const reason = error instanceof LastFmAuthError ? error.reason : 'unavailable';
    return NextResponse.redirect(new URL(`/?signin=${reason}#start`, request.nextUrl.origin));
  }
}
