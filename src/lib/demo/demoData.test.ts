import { describe, expect, it } from 'vitest';
import { albumKey, createDemoDataSource, DEMO_USER, getArtworkQueries, getDemoNowPlaying } from './demoData';
import { computeStats } from '@/lib/statsPipeline';
import type { DataMode, TimeRange } from '@/types';

const NOW = Date.parse('2026-11-02T12:00:00Z');

describe('demo data', () => {
  it('is deterministic for a fixed clock', async () => {
    const a = await createDemoDataSource(NOW).getRecentlyPlayed(50);
    const b = await createDemoDataSource(NOW).getRecentlyPlayed(50);
    expect(a).toEqual(b);
  });

  it('returns recent plays newest first, within the requested limit', async () => {
    const plays = await createDemoDataSource(NOW).getRecentlyPlayed(20);
    expect(plays).toHaveLength(20);
    const times = plays.map(p => Date.parse(p.played_at));
    expect([...times].sort((x, y) => y - x)).toEqual(times);
    expect(times[0]).toBeLessThanOrEqual(NOW);
  });

  it('ranks top artists differently per time range', async () => {
    const source = createDemoDataSource(NOW);
    const short = (await source.getTopArtists('short_term', 10)).map(a => a.id);
    const long = (await source.getTopArtists('long_term', 10)).map(a => a.id);
    expect(short).not.toEqual(long);
  });

  it.each<[TimeRange, DataMode]>([
    ['short_term', 'recent'],
    ['medium_term', 'topTracks'],
    ['long_term', 'topArtists'],
  ])('produces a full dashboard dataset (%s, %s)', async (timeRange, mode) => {
    const stats = await computeStats(createDemoDataSource(NOW), { timeRange, limit: 50, mode });
    expect(stats.mode).toBe(mode);
    expect(stats.tracks.length).toBeGreaterThan(5);
    expect(stats.artists.length).toBeGreaterThan(5);
    expect(stats.genres.length).toBeGreaterThan(5);
    expect(stats.topArtists.length).toBeGreaterThan(20);
    expect(stats.topTracks).toHaveLength(50);
    expect(stats.topGenres.length).toBeGreaterThan(10);
    expect(stats.overview.genreCoverage).toBeGreaterThan(0.5);
    expect(stats.topTracks.some(t => t.recentPlays > 0)).toBe(true);
  });

  it('has a profile and a now-playing track', () => {
    expect(DEMO_USER.display_name).toBeTruthy();
    expect(getDemoNowPlaying().track?.name).toBeTruthy();
  });
});

describe('example artwork', () => {
  it('swaps in real artwork and links where the lookup found them, and keeps generated art elsewhere', async () => {
    const realImage = [{ url: 'https://i.scdn.co/image/beach-house', width: 640, height: 640 }];
    const albumImage = [{ url: 'https://i.scdn.co/image/depression-cherry', width: 640, height: 640 }];
    const artwork = {
      artists: { 'Beach House': { images: realImage, url: 'https://open.spotify.com/artist/beach-house' } },
      albums: { [albumKey('Beach House', 'Depression Cherry')]: { images: albumImage, url: 'https://open.spotify.com/album/depression-cherry' } },
    };
    const source = createDemoDataSource(NOW, artwork);
    const artists = await source.getTopArtists('long_term', 50);
    const beachHouse = artists.find(a => a.name === 'Beach House')!;
    expect(beachHouse.images).toEqual(realImage);
    expect(beachHouse.external_urls.spotify).toBe('https://open.spotify.com/artist/beach-house');
    expect(artists.find(a => a.name === 'Mitski')!.images[0].url).toMatch(/^data:image\/svg/);

    const tracks = await source.getTopTracks('long_term', 50);
    const spaceSong = tracks.find(t => t.name === 'Space Song')!;
    expect(spaceSong.album.images).toEqual(albumImage);
    expect(spaceSong.artists[0].external_urls.spotify).toBe('https://open.spotify.com/artist/beach-house');
  });

  it('lists every artist and album for the lookup', () => {
    const { artists, albums } = getArtworkQueries();
    expect(artists).toContain('Beach House');
    expect(albums).toContainEqual({ artist: 'Beach House', album: 'Depression Cherry' });
  });
});
