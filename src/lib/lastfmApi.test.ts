import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));

import { resetApiCacheState } from './apiCache';
import {
  artistIdFor, getLovedTracks, getNowPlaying, getRecentTracks, getTopArtists, getTopTracks, getUserInfo,
  LastFmPrivateError, LastFmUserNotFoundError, trackIdFor,
} from './lastfmApi';

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

/** Answers every network request with `body`; cache probes always miss */
function respondWith(body: unknown) {
  const urls: URL[] = [];
  vi.stubGlobal('fetch', vi.fn(async (input: string, init?: RequestInit) => {
    if (init?.signal?.aborted) throw new DOMException('aborted', 'AbortError');
    urls.push(new URL(input));
    return json(body);
  }));
  return urls;
}

describe('Last.fm user data', () => {
  beforeEach(() => {
    resetApiCacheState();
    vi.stubEnv('LASTFM_API_KEY', 'test-key');
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('reads recent scrobbles, newest first, without the now-playing entry', async () => {
    const urls = respondWith({
      recenttracks: {
        track: [
          { name: 'Live One', artist: { name: 'Now' }, album: { '#text': 'A' }, '@attr': { nowplaying: 'true' } },
          { name: 'Space Song', artist: { name: 'Beach House', url: 'https://www.last.fm/music/Beach+House' }, album: { '#text': 'Depression Cherry' }, url: 'https://www.last.fm/music/Beach+House/_/Space+Song', date: { uts: '1763740000' } },
          { name: 'Myth', artist: { name: 'Beach House' }, album: { '#text': 'Bloom' }, date: { uts: '1763730000' } },
        ],
      },
    });
    const plays = await getRecentTracks('sam', 50);
    expect(plays).toHaveLength(2);
    expect(plays[0].track).toMatchObject({
      id: trackIdFor('Beach House', 'Space Song'),
      name: 'Space Song',
      album: { name: 'Depression Cherry', images: [] },
      artists: [{ id: artistIdFor('Beach House'), name: 'Beach House' }],
    });
    expect(plays[0].played_at).toBe(new Date(1763740000 * 1000).toISOString());
    expect(urls[0].searchParams.get('method')).toBe('user.getRecentTracks');
    expect(urls[0].searchParams.get('extended')).toBe('1');
  });

  it('gives the same id to a track however its names are cased or spaced', () => {
    expect(trackIdFor('Beach House', 'Space Song')).toBe(trackIdFor('beach  house', ' SPACE song'));
  });

  it('accepts a lone object where Last.fm would usually send a list', async () => {
    respondWith({ toptracks: { track: { name: 'Solo', artist: { name: 'One' }, playcount: '12', duration: '200' } } });
    const tracks = await getTopTracks('sam', '7day', 50);
    expect(tracks).toHaveLength(1);
    expect(tracks[0]).toMatchObject({ name: 'Solo', playcount: 12, duration_ms: 200000 });
  });

  it('keeps top artists in rank order with their play counts', async () => {
    const urls = respondWith({ topartists: { artist: [{ name: 'Mitski', playcount: '310' }, { name: 'Nujabes', playcount: '120' }] } });
    const artists = await getTopArtists('sam', '12month', 50);
    expect(artists.map(a => [a.name, a.playcount])).toEqual([['Mitski', 310], ['Nujabes', 120]]);
    expect(artists[0]).toMatchObject({ images: [], genres: [], url: 'https://www.last.fm/music/Mitski' });
    expect(urls[0].searchParams.get('period')).toBe('12month');
  });

  it('reports what is playing now', async () => {
    respondWith({ recenttracks: { track: [{ name: 'Dreams', artist: { name: 'Fleetwood Mac' }, '@attr': { nowplaying: 'true' } }] } });
    const now = await getNowPlaying('sam');
    expect(now.isPlaying).toBe(true);
    expect(now.track?.name).toBe('Dreams');
  });

  it('reads loved tracks and their total', async () => {
    respondWith({ lovedtracks: { track: [{ name: 'Jolene', artist: { name: 'Dolly Parton' }, date: { uts: '1700000000' } }], '@attr': { total: '87' } } });
    const loved = await getLovedTracks('sam', 500);
    expect(loved.total).toBe(87);
    expect(loved.tracks[0].track.name).toBe('Jolene');
  });

  it('turns profile fields into numbers and dates', async () => {
    respondWith({ user: { name: 'Sam', realname: 'Sam Pling', playcount: '48213', registered: { unixtime: '1394323200' } } });
    const profile = await getUserInfo('sam');
    expect(profile).toMatchObject({ name: 'Sam', realname: 'Sam Pling', playcount: 48213, url: 'https://www.last.fm/user/Sam' });
    expect(profile.registeredAt).toBe('2014-03-09T00:00:00.000Z');
  });

  it('tells a missing user from a private one', async () => {
    respondWith({ error: 6, message: 'User not found' });
    await expect(getUserInfo('nobody')).rejects.toBeInstanceOf(LastFmUserNotFoundError);
    resetApiCacheState();
    respondWith({ error: 17, message: 'Login: User required to be logged in' });
    await expect(getRecentTracks('shy', 50)).rejects.toBeInstanceOf(LastFmPrivateError);
  });
});
