import { NextRequest, NextResponse } from 'next/server';
import { clearUsernameCookie, normalizeUsername, setUsernameCookie } from '@/lib/session';
import { getUserInfo } from '@/lib/lastfmApi';
import { errorResponse } from '@/lib/apiErrors';

/** Starts a "session": checks the Last.fm username exists, then remembers it in a cookie. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as { username?: unknown };
  const username = normalizeUsername(body.username);
  if (!username) {
    return NextResponse.json({ error: 'invalid_username' }, { status: 400 });
  }
  try {
    const profile = await getUserInfo(username);
    const response = NextResponse.json({ username: profile.name });
    setUsernameCookie(response, profile.name);
    return response;
  } catch (error) {
    return errorResponse(error, 'Last.fm user');
  }
}

/** Forgets the username */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  clearUsernameCookie(response);
  return response;
}
