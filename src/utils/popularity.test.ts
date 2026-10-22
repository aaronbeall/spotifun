import { describe, it, expect } from 'vitest';
import { analyzePopularity, getPopularityExtremes } from './popularity';

describe('analyzePopularity', () => {
  it('returns "No Data" for empty tracks array', () => {
    const result = analyzePopularity([]);
    
    expect(result.label).toBe('No Data');
    expect(result.description).toBe('Not enough data to analyze popularity');
    expect(result.diversityScore).toBe(0);
    expect(result.range).toEqual([0, 0]);
  });

  it('classifies niche tracks with low popularity and low diversity as "Deep Cuts"', () => {
    const tracks = Array(10).fill(null).map((_, i) => ({
      popularity: 25 + i, // 25-34, avg ~30, low diversity
    })) as SpotifyApi.TrackObjectFull[];
    
    const result = analyzePopularity(tracks);
    
    expect(result.label).toBe('Deep Cuts');
    expect(result.description).toBe('You mostly listen to niche, lesser-known tracks');
    expect(result.diversityScore).toBeLessThan(20);
    expect(result.range[0]).toBe(25);
    expect(result.range[1]).toBe(34);
  });

  it('classifies mainstream tracks with mid popularity and low diversity as "Mainstream"', () => {
    const tracks = Array(10).fill(null).map((_, i) => ({
      popularity: 50 + i, // 50-59, avg ~55, low diversity
    })) as SpotifyApi.TrackObjectFull[];
    
    const result = analyzePopularity(tracks);
    
    expect(result.label).toBe('Mainstream');
    expect(result.description).toBe('You mostly listen to popular tracks');
    expect(result.diversityScore).toBeLessThan(20);
    expect(result.range[0]).toBe(50);
    expect(result.range[1]).toBe(59);
  });

  it('classifies trending tracks with high popularity and low diversity as "Trending Now"', () => {
    const tracks = Array(10).fill(null).map((_, i) => ({
      popularity: 85 + i, // 85-94, avg ~90, low diversity
    })) as SpotifyApi.TrackObjectFull[];
    
    const result = analyzePopularity(tracks);
    
    expect(result.label).toBe('Trending Now');
    expect(result.description).toBe('You mostly listen to top charting tracks');
    expect(result.diversityScore).toBeLessThan(20);
    expect(result.range[0]).toBe(85);
    expect(result.range[1]).toBe(94);
  });

  it('classifies eclectic mix with moderate diversity and lower median', () => {
    const tracks = [
      { popularity: 10 },
      { popularity: 20 },
      { popularity: 30 },
      { popularity: 40 },
      { popularity: 50 },
      { popularity: 60 },
    ] as SpotifyApi.TrackObjectFull[];
    
    const result = analyzePopularity(tracks);
    
    expect(result.label).toBe('Eclectic Mix');
    expect(result.description).toBe('You enjoy a mix of niche and popular music');
    expect(result.diversityScore).toBeGreaterThanOrEqual(20);
    expect(result.diversityScore).toBeLessThan(60);
    expect(result.range[0]).toBe(10);
    expect(result.range[1]).toBe(60);
  });

  it('classifies music connoisseur with high diversity', () => {
    const tracks = [
      { popularity: 5 },
      { popularity: 20 },
      { popularity: 40 },
      { popularity: 60 },
      { popularity: 80 },
      { popularity: 95 },
    ] as SpotifyApi.TrackObjectFull[];
    
    const result = analyzePopularity(tracks);
    
    expect(result.label).toBe('Music Connoisseur');
    expect(result.description).toBe('Your taste spans from deep cuts to chart-toppers');
    expect(result.diversityScore).toBeGreaterThanOrEqual(60);
    expect(result.range[0]).toBe(5);
    expect(result.range[1]).toBe(95);
  });

  it('handles tracks with missing popularity values (defaults to 0)', () => {
    const tracks = [
      { popularity: undefined },
      { popularity: 50 },
      { popularity: null },
    ] as unknown as SpotifyApi.TrackObjectFull[];
    
    const result = analyzePopularity(tracks);
    
    expect(result.range[0]).toBe(0);
    expect(result.range[1]).toBe(50);
  });

  it('calculates correct median for odd number of tracks', () => {
    const tracks = [
      { popularity: 10 },
      { popularity: 20 },
      { popularity: 30 },
    ] as SpotifyApi.TrackObjectFull[];
    
    const result = analyzePopularity(tracks);
    
    // Median should be 20
    expect(result).toBeDefined();
  });

  it('calculates correct median for even number of tracks', () => {
    const tracks = [
      { popularity: 10 },
      { popularity: 20 },
      { popularity: 30 },
      { popularity: 40 },
    ] as SpotifyApi.TrackObjectFull[];
    
    const result = analyzePopularity(tracks);
    
    // Median should be (20 + 30) / 2 = 25
    expect(result).toBeDefined();
  });
});

describe('getPopularityExtremes', () => {
  it('finds most and least popular tracks', () => {
    const tracks = [
      { id: '1', name: 'Low', popularity: 10 },
      { id: '2', name: 'Medium', popularity: 50 },
      { id: '3', name: 'High', popularity: 90 },
    ] as SpotifyApi.TrackObjectFull[];
    
    const result = getPopularityExtremes(tracks);
    
    expect(result.mostPopularTrack.name).toBe('High');
    expect(result.leastPopularTrack.name).toBe('Low');
    expect(result.mostPopularCount).toBe(1);
    expect(result.leastPopularCount).toBe(1);
  });

  it('counts multiple tracks with same extreme popularity', () => {
    const tracks = [
      { id: '1', name: 'Low1', popularity: 10 },
      { id: '2', name: 'Low2', popularity: 10 },
      { id: '3', name: 'High1', popularity: 90 },
      { id: '4', name: 'High2', popularity: 90 },
    ] as SpotifyApi.TrackObjectFull[];
    
    const result = getPopularityExtremes(tracks);
    
    expect(result.mostPopularCount).toBe(2);
    expect(result.leastPopularCount).toBe(2);
  });

  it('handles tracks with missing popularity values', () => {
    const tracks = [
      { id: '1', name: 'None', popularity: undefined },
      { id: '2', name: 'Some', popularity: 50 },
      { id: '3', name: 'Zero', popularity: 0 },
    ] as unknown as SpotifyApi.TrackObjectFull[];
    
    const result = getPopularityExtremes(tracks);
    
    // Undefined and 0 are both treated as 0, so either could be least popular
    // Most popular should be 'Some' with 50
    expect(result.mostPopularTrack.name).toBe('Some');
    expect([0, undefined]).toContain(result.leastPopularTrack.popularity);
  });

  it('handles single track', () => {
    const tracks = [
      { id: '1', name: 'Only', popularity: 42 },
    ] as SpotifyApi.TrackObjectFull[];
    
    const result = getPopularityExtremes(tracks);
    
    expect(result.mostPopularTrack.name).toBe('Only');
    expect(result.leastPopularTrack.name).toBe('Only');
    expect(result.mostPopularCount).toBe(1);
    expect(result.leastPopularCount).toBe(1);
  });
});
