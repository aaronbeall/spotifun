import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiSignature, getSessionUsername, LastFmAuthError, signInUrl } from './lastfmAuth';

describe('apiSignature', () => {
  it('signs sorted name+value pairs plus the secret, skipping format and callback', () => {
    // md5('api_keyKEYmethodauth.getSessiontokenTOKsecret')
    const sig = apiSignature({ token: 'TOK', method: 'auth.getSession', api_key: 'KEY', format: 'json', callback: 'x' }, 'secret');
    expect(sig).toBe('77d61cbdb9bf03f975d2d3a6ef001d4c');
  });
});

describe('Last.fm sign-in', () => {
  beforeEach(() => {
    vi.stubEnv('LASTFM_API_KEY', 'KEY');
    vi.stubEnv('LASTFM_SHARED_SECRET', 'secret');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('sends the listener to Last.fm with the key and callback', () => {
    const url = new URL(signInUrl('https://spotifun.app/api/auth/lastfm/callback?state=abc'));
    expect(url.origin + url.pathname).toBe('https://www.last.fm/api/auth/');
    expect(url.searchParams.get('api_key')).toBe('KEY');
    expect(url.searchParams.get('cb')).toBe('https://spotifun.app/api/auth/lastfm/callback?state=abc');
  });

  it('swaps the token for the username with a signed request', async () => {
    const fetchMock = vi.fn(async () => Response.json({ session: { name: 'RJ', key: 'k', subscriber: 0 } }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(getSessionUsername('TOK')).resolves.toBe('RJ');
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const body = init.body as URLSearchParams;
    expect(body.get('method')).toBe('auth.getSession');
    expect(body.get('token')).toBe('TOK');
    expect(body.get('api_sig')).toBe(apiSignature({ method: 'auth.getSession', api_key: 'KEY', token: 'TOK' }, 'secret'));
  });

  it('reports a rejected token', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 4, message: 'Invalid authentication token' })));
    await expect(getSessionUsername('bad')).rejects.toMatchObject({ reason: 'rejected' });
  });

  it('reports a missing secret as not configured', () => {
    vi.stubEnv('LASTFM_SHARED_SECRET', '');
    expect(() => signInUrl('https://x/cb')).toThrow(LastFmAuthError);
  });
});
