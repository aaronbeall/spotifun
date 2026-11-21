import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));

import { resetApiCacheState } from './apiCache';
import { enrichArtists, enrichTracks, findTrack, popularityFromFans, popularityFromRank } from './deezer';
import type { Artist, Track } from '@/types/music';

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

function deezer(routes: (url: URL) => unknown) {
  const urls: URL[] = [];
  vi.stubGlobal('fetch', vi.fn(async (input: string, init?: RequestInit) => {
    if (init?.signal?.aborted) throw new DOMException('aborted', 'AbortError');
    const url = new URL(input);
    urls.push(url);
    return json(routes(url));
  }));
  return urls;
}

const track = (artist: string, name: string, extra: Partial<Track> = {}): Track => ({
  id: `track:${artist}|${name}`.toLowerCase(),
  name,
  artists: [{ id: `artist:${artist}`.toLowerCase(), name: artist }],
  album: { id: `album:${artist}|${name}`, name: '', images: [] },
  duration_ms: 0,
  ...extra,
});

describe('popularity scales', () => {
  it('maps Deezer track rank onto 0–100', () => {
    expect(popularityFromRank(950_000)).toBe(95);
    expect(popularityFromRank(180_000)).toBe(18);
    expect(popularityFromRank(0)).toBeUndefined();
    expect(popularityFromRank(undefined)).toBeUndefined();
  });

  it('puts fan counts on a log scale', () => {
    expect(popularityFromFans(10_000)).toBe(36);
    expect(popularityFromFans(1_000_000)).toBe(72);
    expect(popularityFromFans(10_000_000)).toBe(90);
    expect(popularityFromFans(100_000_000)).toBe(100);
  });
});

describe('Deezer matching', () => {
  beforeEach(() => resetApiCacheState());
  afterEach(() => vi.unstubAllGlobals());

  it('matches a remaster to the plain title, but not a different artist', async () => {
    deezer(() => ({
      data: [
        { id: 1, title: 'Dreams', artist: { id: 9, name: 'Cover Band' }, album: { id: 2, title: 'Covers' }, rank: 100000, duration: 200 },
        { id: 3, title: 'Dreams (2004 Remaster)', artist: { id: 8, name: 'Fleetwood Mac' }, album: { id: 4, title: 'Rumours', cover_big: 'https://img/rumours.jpg' }, rank: 900000, duration: 257 },
      ],
    }));
    const match = await findTrack('Fleetwood Mac', 'Dreams');
    expect(match).toMatchObject({ id: 3, albumName: 'Rumours', duration_ms: 257000, popularity: 90 });
    expect(match?.albumImages[0].url).toBe('https://img/rumours.jpg');
  });

  it('fills album art, length, popularity and release year, looking each track up once', async () => {
    const urls = deezer(url => {
      if (url.pathname === '/track/3') return { id: 3, album: { release_date: '1977-02-04' } };
      return { data: [{ id: 3, title: 'Dreams', artist: { name: 'Fleetwood Mac' }, album: { title: 'Rumours', cover_big: 'https://img/r.jpg' }, rank: 900000, duration: 257 }] };
    });
    const dreams = track('Fleetwood Mac', 'Dreams', { playcount: 7 });
    const [first, second] = await enrichTracks([dreams, { ...dreams, playcount: 2 }], { releaseDates: true });
    expect(first).toMatchObject({ duration_ms: 257000, popularity: 90, playcount: 7, album: { name: 'Rumours', release_date: '1977-02-04' } });
    expect(second.playcount).toBe(2);
    expect(urls.filter(url => url.pathname.startsWith('/search'))).toHaveLength(1);
    expect(urls.filter(url => url.pathname === '/track/3')).toHaveLength(1);
  });

  it('leaves tracks it cannot match as they were', async () => {
    deezer(() => ({ data: [] }));
    const unknown = track('Nobody', 'Nothing');
    const [result] = await enrichTracks([unknown]);
    expect(result).toEqual(unknown);
  });

  it('only takes an exact artist name match for photos', async () => {
    deezer(() => ({ data: [{ id: 1, name: 'Burial Hex', picture_big: 'https://img/wrong.jpg', nb_fan: 10 }] }));
    const burial: Artist = { id: 'artist:burial', name: 'Burial', images: [], genres: [] };
    const [result] = await enrichArtists([burial]);
    expect(result.images).toEqual([]);
  });

  it('stops asking during a quota cooldown', async () => {
    const urls = deezer(() => ({ error: { code: 4, message: 'Quota limit exceeded' } }));
    await enrichTracks([track('A', 'One'), track('B', 'Two'), track('C', 'Three')]);
    // The first quota error starts a cooldown; later lookups are served from cache only
    expect(urls.length).toBeLessThan(3);
  });
});
