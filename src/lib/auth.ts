import { NextRequest, NextResponse } from 'next/server';
import { spotifyApi } from './spotify';

const ACCESS_TOKEN_COOKIE = 'spotify_access_token';
const REFRESH_TOKEN_COOKIE = 'spotify_refresh_token';

export class UnauthenticatedError extends Error {}

interface RefreshedTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

async function refreshTokens(refreshToken: string): Promise<RefreshedTokens> {
  spotifyApi.setRefreshToken(refreshToken);
  const data = await spotifyApi.refreshAccessToken();
  return {
    accessToken: data.body.access_token,
    refreshToken: data.body.refresh_token,
    expiresIn: data.body.expires_in,
  };
}

export function setAuthCookies(response: NextResponse, tokens: RefreshedTokens) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: tokens.expiresIn,
    sameSite: 'lax',
  });

  if (tokens.refreshToken) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
    });
  }
}

/**
 * Runs `fn` against the Spotify API using the access token cookie. If the
 * token has expired, transparently refreshes it via the refresh token
 * cookie and retries once. Callers must write `refreshedTokens` (if
 * present) onto the outgoing response with `setAuthCookies` so the
 * browser picks up the renewed token.
 */
export async function withSpotifyAccessToken<T>(
  request: NextRequest,
  fn: () => Promise<T>
): Promise<{ result: T; refreshedTokens?: RefreshedTokens }> {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    if (!refreshToken) throw new UnauthenticatedError('No access token');
    const refreshedTokens = await refreshTokens(refreshToken);
    spotifyApi.setAccessToken(refreshedTokens.accessToken);
    return { result: await fn(), refreshedTokens };
  }

  spotifyApi.setAccessToken(accessToken);
  try {
    return { result: await fn() };
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode !== 401 || !refreshToken) throw error;

    const refreshedTokens = await refreshTokens(refreshToken);
    spotifyApi.setAccessToken(refreshedTokens.accessToken);
    return { result: await fn(), refreshedTokens };
  }
}
