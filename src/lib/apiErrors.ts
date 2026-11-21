import { NextResponse } from 'next/server';
import { UnauthenticatedError } from '@/lib/session';
import { LastFmPrivateError, LastFmUnavailableError, LastFmUserNotFoundError } from '@/lib/lastfmApi';

/** Error codes the dashboard reads from failed API responses */
export type ApiErrorCode = 'no_user' | 'user_not_found' | 'private' | 'lastfm_unavailable' | 'failed';

/** Maps a thrown error to the JSON error response every Last.fm-backed route returns. */
export function errorResponse(error: unknown, what: string): NextResponse<{ error: ApiErrorCode }> {
  if (error instanceof UnauthenticatedError) {
    return NextResponse.json({ error: 'no_user' }, { status: 401 });
  }
  if (error instanceof LastFmUserNotFoundError) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  }
  if (error instanceof LastFmPrivateError) {
    return NextResponse.json({ error: 'private' }, { status: 403 });
  }
  if (error instanceof LastFmUnavailableError) {
    return NextResponse.json({ error: 'lastfm_unavailable' }, { status: 503 });
  }
  console.error(`Error fetching ${what}:`, error);
  return NextResponse.json({ error: 'failed' }, { status: 500 });
}
