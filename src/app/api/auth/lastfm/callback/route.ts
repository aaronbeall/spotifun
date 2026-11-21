import { NextRequest, NextResponse } from 'next/server';
import { getSessionUsername, LastFmAuthError } from '@/lib/lastfmAuth';
import { SIGN_IN_STATE_COOKIE, setUsernameCookie } from '@/lib/session';

/** Last.fm sends the listener back here with a token. Swap it for their username and go to the dashboard. */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const fail = (reason: string) => {
    const response = NextResponse.redirect(new URL(`/?signin=${reason}#start`, origin));
    response.cookies.set(SIGN_IN_STATE_COOKIE, '', { maxAge: 0, path: '/' });
    return response;
  };

  const token = searchParams.get('token');
  const state = searchParams.get('state');
  const expected = request.cookies.get(SIGN_IN_STATE_COOKIE)?.value;
  // No token means the listener said no on Last.fm's page.
  if (!token) return fail('cancelled');
  if (!state || !expected || state !== expected) return fail('expired');

  try {
    const username = await getSessionUsername(token);
    const response = NextResponse.redirect(new URL('/dashboard', origin));
    setUsernameCookie(response, username);
    response.cookies.set(SIGN_IN_STATE_COOKIE, '', { maxAge: 0, path: '/' });
    return response;
  } catch (error) {
    return fail(error instanceof LastFmAuthError ? error.reason : 'unavailable');
  }
}
