import { describe, expect, it } from 'vitest';
import { createDemoDataSource, DEMO_USER, getDemoNowPlaying } from './demoData';
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
