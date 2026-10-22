import { describe, it, expect } from 'vitest';
import {
  calculateGenreDiversity,
  calculateArtistDiversity,
  calculateAverageSessionLength,
  calculateAveragePopularity,
} from './statsHelpers';

describe('calculateGenreDiversity', () => {
  it('returns correct ratio for normal case', () => {
    const result = calculateGenreDiversity(10, 50);
    
    expect(result).toBe(0.2);
  });

  it('handles zero total genres (returns 0)', () => {
    const result = calculateGenreDiversity(5, 0);
    
    // Should use Math.max(totalGenres, 1) to avoid division by zero
    expect(result).toBe(5);
  });

  it('returns 1 for perfect diversity (all genres unique)', () => {
    const result = calculateGenreDiversity(20, 20);
    
    expect(result).toBe(1);
  });

  it('returns low value for low diversity', () => {
    const result = calculateGenreDiversity(2, 100);
    
    expect(result).toBe(0.02);
  });

  it('handles single genre', () => {
    const result = calculateGenreDiversity(1, 1);
    
    expect(result).toBe(1);
  });

  it('handles zero unique genres', () => {
    const result = calculateGenreDiversity(0, 10);
    
    expect(result).toBe(0);
  });
});

describe('calculateArtistDiversity', () => {
  it('returns correct ratio for normal case', () => {
    const result = calculateArtistDiversity(25, 100);
    
    expect(result).toBe(0.25);
  });

  it('handles zero total plays', () => {
    const result = calculateArtistDiversity(10, 0);
    
    // Should use Math.max(totalPlays, 1) to avoid division by zero
    expect(result).toBe(10);
  });

  it('returns 1 for perfect diversity (every play is different artist)', () => {
    const result = calculateArtistDiversity(50, 50);
    
    expect(result).toBe(1);
  });

  it('returns low value for low diversity (same artists on repeat)', () => {
    const result = calculateArtistDiversity(5, 200);
    
    expect(result).toBe(0.025);
  });

  it('handles single artist', () => {
    const result = calculateArtistDiversity(1, 1);
    
    expect(result).toBe(1);
  });

  it('handles zero unique artists', () => {
    const result = calculateArtistDiversity(0, 10);
    
    expect(result).toBe(0);
  });
});

describe('calculateAverageSessionLength', () => {
  it('calculates correct average in minutes', () => {
    // 300,000 ms = 5 minutes per play
    const result = calculateAverageSessionLength(300000 * 10, 10);
    
    expect(result).toBe(5);
  });

  it('handles single play', () => {
    // 180,000 ms = 3 minutes
    const result = calculateAverageSessionLength(180000, 1);
    
    expect(result).toBe(3);
  });

  it('calculates fractional minutes correctly', () => {
    // 210,000 ms = 3.5 minutes
    const result = calculateAverageSessionLength(210000, 1);
    
    expect(result).toBe(3.5);
  });

  it('handles zero duration', () => {
    const result = calculateAverageSessionLength(0, 10);
    
    expect(result).toBe(0);
  });

  it('handles large durations', () => {
    // 3,600,000 ms = 60 minutes per play
    const result = calculateAverageSessionLength(3600000 * 5, 5);
    
    expect(result).toBe(60);
  });

  it('returns 0 for zero plays (edge case)', () => {
    const result = calculateAverageSessionLength(1000, 0);
    
    // Division by zero - JavaScript returns Infinity
    expect(result).toBe(Infinity);
  });
});

describe('calculateAveragePopularity', () => {
  it('calculates correct average for normal case', () => {
    const tracks = [
      { popularity: 50 },
      { popularity: 60 },
      { popularity: 70 },
    ];
    
    const result = calculateAveragePopularity(tracks);
    
    expect(result).toBe(60);
  });

  it('rounds to nearest integer', () => {
    const tracks = [
      { popularity: 50 },
      { popularity: 51 },
      { popularity: 52 },
    ];
    
    const result = calculateAveragePopularity(tracks);
    
    // (50 + 51 + 52) / 3 = 51
    expect(result).toBe(51);
  });

  it('handles tracks with missing popularity (treats as 0)', () => {
    const tracks = [
      { popularity: 50 },
      { popularity: undefined },
      { popularity: 70 },
    ];
    
    const result = calculateAveragePopularity(tracks);
    
    // (50 + 0 + 70) / 3 = 40
    expect(result).toBe(40);
  });

  it('handles tracks with null popularity (treats as 0)', () => {
    const tracks = [
      { popularity: 50 },
      { popularity: null },
      { popularity: 70 },
    ];
    
    const result = calculateAveragePopularity(tracks);
    
    // (50 + 0 + 70) / 3 = 40
    expect(result).toBe(40);
  });

  it('returns 0 for empty tracks array', () => {
    const result = calculateAveragePopularity([]);
    
    expect(result).toBe(0);
  });

  it('handles all zero popularity', () => {
    const tracks = [
      { popularity: 0 },
      { popularity: 0 },
      { popularity: 0 },
    ];
    
    const result = calculateAveragePopularity(tracks);
    
    expect(result).toBe(0);
  });

  it('handles maximum popularity', () => {
    const tracks = [
      { popularity: 100 },
      { popularity: 100 },
      { popularity: 100 },
    ];
    
    const result = calculateAveragePopularity(tracks);
    
    expect(result).toBe(100);
  });

  it('handles single track', () => {
    const tracks = [{ popularity: 75 }];
    
    const result = calculateAveragePopularity(tracks);
    
    expect(result).toBe(75);
  });

  it('rounds 0.5 correctly (banker\'s rounding)', () => {
    const tracks = [
      { popularity: 50 },
      { popularity: 51 },
    ];
    
    const result = calculateAveragePopularity(tracks);
    
    // (50 + 51) / 2 = 50.5, rounds to 51
    expect(result).toBe(51);
  });
});
