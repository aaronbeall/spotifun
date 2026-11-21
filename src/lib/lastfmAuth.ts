/**
 * "Sign in with Last.fm": Last.fm's web auth flow (https://www.last.fm/api/webauth).
 *
 * 1. Send the listener to last.fm/api/auth with our API key and a callback URL.
 * 2. Last.fm sends them back to the callback with a one-time token.
 * 3. auth.getSession, signed with the shared secret, swaps the token for their username.
 *
 * Spotifun only reads public data, so it keeps the username and drops the session key.
 */
import { createHash, randomBytes } from 'node:crypto';

const API_BASE = process.env.LASTFM_API_BASE || 'https://ws.audioscrobbler.com/2.0/';
const AUTH_URL = process.env.LASTFM_AUTH_URL || 'https://www.last.fm/api/auth/';

export class LastFmAuthError extends Error {
  constructor(readonly reason: 'not_configured' | 'rejected' | 'unavailable') {
    super(`Last.fm sign-in failed (${reason})`);
    this.name = 'LastFmAuthError';
  }
}

function credentials() {
  const apiKey = process.env.LASTFM_API_KEY;
  const secret = process.env.LASTFM_SHARED_SECRET;
  if (!apiKey || !secret) throw new LastFmAuthError('not_configured');
  return { apiKey, secret };
}

export function isSignInConfigured(): boolean {
  return Boolean(process.env.LASTFM_API_KEY && process.env.LASTFM_SHARED_SECRET);
}

/** Last.fm's api_sig: md5 of every param (except format and callback) as sorted name+value pairs, then the secret */
export function apiSignature(params: Record<string, string>, secret: string): string {
  const joined = Object.keys(params)
    .filter(key => key !== 'format' && key !== 'callback')
    .sort()
    .map(key => key + params[key])
    .join('');
  return createHash('md5').update(joined + secret, 'utf8').digest('hex');
}

/** A random value tying the callback to the browser that started sign-in */
export function newSignInState(): string {
  return randomBytes(16).toString('hex');
}

export function signInUrl(callbackUrl: string): string {
  const { apiKey } = credentials();
  const url = new URL(AUTH_URL);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('cb', callbackUrl);
  return url.toString();
}

interface SessionBody {
  session?: { name?: string; key?: string };
  error?: number;
  message?: string;
}

/** Swaps the callback token for the signed-in listener's username. Never cached. */
export async function getSessionUsername(token: string): Promise<string> {
  const { apiKey, secret } = credentials();
  const params = { method: 'auth.getSession', api_key: apiKey, token };
  const body = new URLSearchParams({ ...params, api_sig: apiSignature(params, secret), format: 'json' });

  let result: SessionBody;
  try {
    const response = await fetch(API_BASE, { method: 'POST', body, cache: 'no-store' });
    result = await response.json() as SessionBody;
  } catch {
    throw new LastFmAuthError('unavailable');
  }
  const name = result.session?.name;
  if (name) return name;
  // 4 invalid token, 14 unauthorized token, 15 expired token; anything else is on Last.fm's side
  if (result.error === 4 || result.error === 14 || result.error === 15) throw new LastFmAuthError('rejected');
  throw new LastFmAuthError('unavailable');
}
