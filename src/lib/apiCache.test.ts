import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));

import { revalidateTag } from 'next/cache';
import { cachedJson, isCoolingDown, mapLimit, resetApiCacheState } from './apiCache';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/** A fetch whose "cache" answers aborted probes and whose network counts real requests */
function fakeFetch(cache: Map<string, unknown>, network: (url: string) => Response) {
  const calls: string[] = [];
  const fn = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    if (init?.signal?.aborted) {
      if (cache.has(url)) return json(cache.get(url));
      throw new DOMException('aborted', 'AbortError');
    }
    calls.push(url);
    return network(url);
  });
  return { fn, calls };
}

describe('cachedJson', () => {
  beforeEach(() => {
    resetApiCacheState();
    vi.mocked(revalidateTag).mockClear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('serves a cache hit without a network request', async () => {
    const { fn, calls } = fakeFetch(new Map([['https://api.test/a', { hello: 'cache' }]]), () => json({ hello: 'network' }));
    vi.stubGlobal('fetch', fn);
    const result = await cachedJson<{ hello: string }>('https://api.test/a', { service: 'deezer', revalidate: 60, tag: 't' });
    expect(result).toEqual({ ok: true, body: { hello: 'cache' } });
    expect(calls).toEqual([]);
  });

  it('goes to the network on a miss, and shares one request between identical calls', async () => {
    const { fn, calls } = fakeFetch(new Map(), () => json({ hello: 'network' }));
    vi.stubGlobal('fetch', fn);
    const options = { service: 'deezer' as const, revalidate: 60, tag: 't' };
    const [first, second] = await Promise.all([
      cachedJson('https://api.test/b', options),
      cachedJson('https://api.test/b', options),
    ]);
    expect(first).toEqual({ ok: true, body: { hello: 'network' } });
    expect(second).toEqual(first);
    expect(calls).toEqual(['https://api.test/b']);
  });

  it('expires the cache entry and cools down after a rate-limit error in a 200 body', async () => {
    const { fn, calls } = fakeFetch(new Map(), () => json({ error: 29 }));
    vi.stubGlobal('fetch', fn);
    const classify = (body: { error?: number }) => body.error === 29 ? 'rate-limited' as const : 'ok' as const;
    const result = await cachedJson('https://api.test/c', { service: 'lastfm', revalidate: 60, tag: 'tag-c', classify });
    expect(result.ok).toBe(false);
    expect(revalidateTag).toHaveBeenCalledWith('tag-c', { expire: 0 });
    expect(isCoolingDown('lastfm')).toBe(true);

    // While cooling down, misses don't reach the network
    const again = await cachedJson('https://api.test/d', { service: 'lastfm', revalidate: 60, tag: 'tag-d', classify });
    expect(again).toEqual({ ok: false, kind: 'rate-limited' });
    expect(calls).toEqual(['https://api.test/c']);
  });

  it('treats HTTP 429 as a rate limit', async () => {
    const { fn } = fakeFetch(new Map(), () => new Response('slow down', { status: 429 }));
    vi.stubGlobal('fetch', fn);
    const result = await cachedJson('https://api.test/e', { service: 'deezer', revalidate: 60, tag: 'e' });
    expect(result).toEqual({ ok: false, kind: 'rate-limited' });
    expect(isCoolingDown('deezer')).toBe(true);
  });

  it('spaces out network requests per service', async () => {
    const times: number[] = [];
    const { fn } = fakeFetch(new Map(), () => {
      times.push(Date.now());
      return json({});
    });
    vi.stubGlobal('fetch', fn);
    await Promise.all(['1', '2', '3'].map(id =>
      cachedJson(`https://api.test/t${id}`, { service: 'lastfm', revalidate: 60, tag: id })
    ));
    expect(times).toHaveLength(3);
    expect(times[2] - times[0]).toBeGreaterThanOrEqual(400);
  });

  it('skips the cache entirely when revalidate is 0', async () => {
    const { fn, calls } = fakeFetch(new Map([['https://api.test/f', { stale: true }]]), () => json({ fresh: true }));
    vi.stubGlobal('fetch', fn);
    const result = await cachedJson('https://api.test/f', { service: 'lastfm', revalidate: 0, tag: 'f' });
    expect(result).toEqual({ ok: true, body: { fresh: true } });
    expect(calls).toEqual(['https://api.test/f']);
    expect(fn.mock.calls[0][1]).toMatchObject({ cache: 'no-store' });
  });
});

describe('mapLimit', () => {
  it('keeps order and never runs more than the limit at once', async () => {
    let running = 0;
    let peak = 0;
    const result = await mapLimit([5, 1, 4, 2, 3], 2, async value => {
      running++;
      peak = Math.max(peak, running);
      await new Promise(resolve => setTimeout(resolve, value));
      running--;
      return value * 10;
    });
    expect(result).toEqual([50, 10, 40, 20, 30]);
    expect(peak).toBe(2);
  });
});
