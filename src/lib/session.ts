import { NextRequest, NextResponse } from 'next/server';

/**
 * Spotifun reads public Last.fm data, so a "session" is just the username the listener
 * typed, kept in a cookie. No password or token is ever involved.
 */
const USERNAME_COOKIE = 'lastfm_user';
const ONE_YEAR = 365 * 24 * 60 * 60;

export class UnauthenticatedError extends Error {}

/** Last.fm usernames: 2–15 letters, digits, - or _, starting with a letter */
const USERNAME_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{1,14}$/;

export function normalizeUsername(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().replace(/^@/, '');
  // Accept a pasted profile link too: https://www.last.fm/user/<name>
  const fromUrl = trimmed.match(/last\.fm\/(?:[a-z]{2}\/)?user\/([^/?#]+)/i)?.[1];
  const username = fromUrl ? decodeURIComponent(fromUrl) : trimmed;
  return USERNAME_PATTERN.test(username) ? username : null;
}

export function getUsername(request: NextRequest): string {
  const username = normalizeUsername(request.cookies.get(USERNAME_COOKIE)?.value);
  if (!username) throw new UnauthenticatedError('No Last.fm username');
  return username;
}

export function setUsernameCookie(response: NextResponse, username: string) {
  response.cookies.set(USERNAME_COOKIE, username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: ONE_YEAR,
    sameSite: 'lax',
    path: '/',
  });
}

export function clearUsernameCookie(response: NextResponse) {
  response.cookies.set(USERNAME_COOKIE, '', { maxAge: 0, path: '/' });
}
