import { describe, it, expect } from 'vitest';
import {
  classifyGenre,
  calculateGenreVACRSScore,
  calculateWeightedVACRSScore,
  calculateVACRSScoreDistance,
  calculateVACRSScoreMatch,
} from './musicClassification';
import { GenreStats, VACRSScore } from '@/types';

describe('classifyGenre', () => {
  it('returns neutral score for unrecognized genre', () => {
    const result = classifyGenre('unknown-exotic-genre');
    
    expect(result.valence).toBe(0.5);
    expect(result.arousal).toBe(0.5);
    expect(result.complexity).toBe(0.5);
    expect(result.rawness).toBe(0.5);
    expect(result.socialPresence).toBe(0.5);
  });

  it('returns neutral score for empty genre string', () => {
    const result = classifyGenre('');
    
    expect(result.valence).toBe(0.5);
    expect(result.arousal).toBe(0.5);
    expect(result.complexity).toBe(0.5);
    expect(result.rawness).toBe(0.5);
    expect(result.socialPresence).toBe(0.5);
  });

  it('classifies pop genre with expected high valence and social presence', () => {
    const result = classifyGenre('pop');
    
    expect(result.valence).toBeGreaterThan(0.6);
    expect(result.socialPresence).toBeGreaterThan(0.6);
    expect(result.rawness).toBeLessThan(0.4);
  });

  it('classifies metal genre with high arousal and rawness', () => {
    const result = classifyGenre('metal');
    
    expect(result.arousal).toBeGreaterThan(0.7);
    expect(result.rawness).toBeGreaterThan(0.7);
    expect(result.valence).toBeLessThan(0.5);
  });

  it('classifies ambient genre with low arousal and social presence', () => {
    const result = classifyGenre('ambient');
    
    expect(result.arousal).toBeLessThan(0.3);
    expect(result.socialPresence).toBeLessThan(0.3);
  });

  it('classifies classical genre with high complexity', () => {
    const result = classifyGenre('classical');
    
    expect(result.complexity).toBeGreaterThan(0.7);
    expect(result.rawness).toBeLessThan(0.3);
  });

  it('handles comma-separated multiple genres by averaging', () => {
    const result = classifyGenre('pop, rock');
    
    // Should be an average of pop and rock profiles
    expect(result.valence).toBeGreaterThan(0);
    expect(result.valence).toBeLessThan(1);
  });

  it('normalizes values to 0-1 range', () => {
    const result = classifyGenre('jazz, folk, rock');
    
    expect(result.valence).toBeGreaterThanOrEqual(0);
    expect(result.valence).toBeLessThanOrEqual(1);
    expect(result.arousal).toBeGreaterThanOrEqual(0);
    expect(result.arousal).toBeLessThanOrEqual(1);
    expect(result.complexity).toBeGreaterThanOrEqual(0);
    expect(result.complexity).toBeLessThanOrEqual(1);
    expect(result.rawness).toBeGreaterThanOrEqual(0);
    expect(result.rawness).toBeLessThanOrEqual(1);
    expect(result.socialPresence).toBeGreaterThanOrEqual(0);
    expect(result.socialPresence).toBeLessThanOrEqual(1);
  });

  it('handles genre with "and" separator', () => {
    const result = classifyGenre('rock and roll');
    
    expect(result).toBeDefined();
    // Should match rock profile
    expect(result.arousal).toBeGreaterThan(0.5);
  });
});

describe('calculateGenreVACRSScore', () => {
  it('returns default neutral score for empty genre', () => {
    const result = calculateGenreVACRSScore('');
    
    expect(result.valence).toBe(0.5);
    expect(result.arousal).toBe(0.5);
    expect(result.complexity).toBe(0.5);
    expect(result.rawness).toBe(0.5);
    expect(result.socialPresence).toBe(0.5);
  });

  it('returns default score for null/undefined genre', () => {
    const result1 = calculateGenreVACRSScore(null as unknown as string);
    const result2 = calculateGenreVACRSScore(undefined as unknown as string);
    
    expect(result1.valence).toBe(0.5);
    expect(result2.valence).toBe(0.5);
  });

  it('normalizes genre to lowercase', () => {
    const lower = calculateGenreVACRSScore('pop');
    const upper = calculateGenreVACRSScore('POP');
    const mixed = calculateGenreVACRSScore('PoP');
    
    expect(lower).toEqual(upper);
    expect(lower).toEqual(mixed);
  });

  it('returns consistent scores for same genre', () => {
    const result1 = calculateGenreVACRSScore('rock');
    const result2 = calculateGenreVACRSScore('rock');
    
    expect(result1).toEqual(result2);
  });

  it('all dimension scores are within 0-1 range', () => {
    const genres = ['pop', 'metal', 'jazz', 'ambient', 'punk', 'edm'];
    
    genres.forEach(genre => {
      const result = calculateGenreVACRSScore(genre);
      
      expect(result.valence).toBeGreaterThanOrEqual(0);
      expect(result.valence).toBeLessThanOrEqual(1);
      expect(result.arousal).toBeGreaterThanOrEqual(0);
      expect(result.arousal).toBeLessThanOrEqual(1);
      expect(result.complexity).toBeGreaterThanOrEqual(0);
      expect(result.complexity).toBeLessThanOrEqual(1);
      expect(result.rawness).toBeGreaterThanOrEqual(0);
      expect(result.rawness).toBeLessThanOrEqual(1);
      expect(result.socialPresence).toBeGreaterThanOrEqual(0);
      expect(result.socialPresence).toBeLessThanOrEqual(1);
    });
  });
});

describe('calculateWeightedVACRSScore', () => {
  it('returns neutral score for empty genre stats', () => {
    const result = calculateWeightedVACRSScore([]);
    
    expect(result.valence).toBe(0.5);
    expect(result.arousal).toBe(0.5);
    expect(result.complexity).toBe(0.5);
    expect(result.rawness).toBe(0.5);
    expect(result.socialPresence).toBe(0.5);
  });

  it('returns neutral score for null genre stats', () => {
    const result = calculateWeightedVACRSScore(null as unknown as GenreStats[]);
    
    expect(result.valence).toBe(0.5);
  });

  it('returns genre score for single genre', () => {
    const genreStats: GenreStats[] = [
      { genre: 'pop', playCount: 10, uniqueTracks: 5, uniqueArtists: 3, totalDuration: 1000 }
    ];
    
    const result = calculateWeightedVACRSScore(genreStats);
    
    // Should be close to pop's VACRS score
    expect(result.valence).toBeGreaterThan(0.5);
    expect(result).toBeDefined();
  });

  it('calculates weighted average based on play counts', () => {
    const genreStats: GenreStats[] = [
      { genre: 'pop', playCount: 90, uniqueTracks: 5, uniqueArtists: 3, totalDuration: 1000 },
      { genre: 'metal', playCount: 10, uniqueTracks: 2, uniqueArtists: 1, totalDuration: 200 }
    ];
    
    const result = calculateWeightedVACRSScore(genreStats);
    
    // Should be heavily weighted toward pop (90% of plays)
    expect(result.valence).toBeGreaterThan(0.5); // Pop has high valence
  });

  it('gives equal weight when all play counts are zero', () => {
    const genreStats: GenreStats[] = [
      { genre: 'pop', playCount: 0, uniqueTracks: 5, uniqueArtists: 3, totalDuration: 0 },
      { genre: 'ambient', playCount: 0, uniqueTracks: 2, uniqueArtists: 1, totalDuration: 0 }
    ];
    
    const result = calculateWeightedVACRSScore(genreStats);
    
    // Should be simple average
    expect(result).toBeDefined();
  });

  it('normalizes all dimensions to 0-1 range', () => {
    const genreStats: GenreStats[] = [
      { genre: 'metal', playCount: 50, uniqueTracks: 10, uniqueArtists: 5, totalDuration: 5000 },
      { genre: 'classical', playCount: 30, uniqueTracks: 8, uniqueArtists: 3, totalDuration: 3000 },
      { genre: 'edm', playCount: 20, uniqueTracks: 5, uniqueArtists: 2, totalDuration: 2000 }
    ];
    
    const result = calculateWeightedVACRSScore(genreStats);
    
    expect(result.valence).toBeGreaterThanOrEqual(0);
    expect(result.valence).toBeLessThanOrEqual(1);
    expect(result.arousal).toBeGreaterThanOrEqual(0);
    expect(result.arousal).toBeLessThanOrEqual(1);
    expect(result.complexity).toBeGreaterThanOrEqual(0);
    expect(result.complexity).toBeLessThanOrEqual(1);
    expect(result.rawness).toBeGreaterThanOrEqual(0);
    expect(result.rawness).toBeLessThanOrEqual(1);
    expect(result.socialPresence).toBeGreaterThanOrEqual(0);
    expect(result.socialPresence).toBeLessThanOrEqual(1);
  });
});

describe('calculateVACRSScoreDistance', () => {
  it('returns 0 for identical scores', () => {
    const score: VACRSScore = {
      valence: 0.5,
      arousal: 0.5,
      complexity: 0.5,
      rawness: 0.5,
      socialPresence: 0.5
    };
    
    const distance = calculateVACRSScoreDistance(score, score);
    
    expect(distance).toBe(0);
  });

  it('calculates correct Euclidean distance', () => {
    const score1: VACRSScore = {
      valence: 0,
      arousal: 0,
      complexity: 0,
      rawness: 0,
      socialPresence: 0
    };
    
    const score2: VACRSScore = {
      valence: 1,
      arousal: 0,
      complexity: 0,
      rawness: 0,
      socialPresence: 0
    };
    
    const distance = calculateVACRSScoreDistance(score1, score2);
    
    // Distance should be 1 (only valence differs by 1)
    expect(distance).toBeCloseTo(1, 5);
  });

  it('calculates maximum possible distance', () => {
    const min: VACRSScore = {
      valence: 0,
      arousal: 0,
      complexity: 0,
      rawness: 0,
      socialPresence: 0
    };
    
    const max: VACRSScore = {
      valence: 1,
      arousal: 1,
      complexity: 1,
      rawness: 1,
      socialPresence: 1
    };
    
    const distance = calculateVACRSScoreDistance(min, max);
    
    // Maximum distance in 5D space is sqrt(5) ≈ 2.236
    expect(distance).toBeCloseTo(Math.sqrt(5), 5);
  });

  it('distance is symmetric', () => {
    const score1: VACRSScore = {
      valence: 0.3,
      arousal: 0.7,
      complexity: 0.5,
      rawness: 0.2,
      socialPresence: 0.8
    };
    
    const score2: VACRSScore = {
      valence: 0.6,
      arousal: 0.4,
      complexity: 0.9,
      rawness: 0.1,
      socialPresence: 0.3
    };
    
    const distance1 = calculateVACRSScoreDistance(score1, score2);
    const distance2 = calculateVACRSScoreDistance(score2, score1);
    
    expect(distance1).toBe(distance2);
  });
});

describe('calculateVACRSScoreMatch', () => {
  it('returns 100% match for identical scores', () => {
    const score: VACRSScore = {
      valence: 0.5,
      arousal: 0.5,
      complexity: 0.5,
      rawness: 0.5,
      socialPresence: 0.5
    };
    
    const match = calculateVACRSScoreMatch(score, score);
    
    expect(match).toBe(100);
  });

  it('returns 0% match for maximum distance', () => {
    const min: VACRSScore = {
      valence: 0,
      arousal: 0,
      complexity: 0,
      rawness: 0,
      socialPresence: 0
    };
    
    const max: VACRSScore = {
      valence: 1,
      arousal: 1,
      complexity: 1,
      rawness: 1,
      socialPresence: 1
    };
    
    const match = calculateVACRSScoreMatch(min, max);
    
    expect(match).toBe(0);
  });

  it('returns values between 0 and 100', () => {
    const score1: VACRSScore = {
      valence: 0.3,
      arousal: 0.7,
      complexity: 0.5,
      rawness: 0.2,
      socialPresence: 0.8
    };
    
    const score2: VACRSScore = {
      valence: 0.4,
      arousal: 0.6,
      complexity: 0.5,
      rawness: 0.3,
      socialPresence: 0.7
    };
    
    const match = calculateVACRSScoreMatch(score1, score2);
    
    expect(match).toBeGreaterThan(0);
    expect(match).toBeLessThan(100);
  });

  it('match is symmetric', () => {
    const score1: VACRSScore = {
      valence: 0.2,
      arousal: 0.8,
      complexity: 0.4,
      rawness: 0.6,
      socialPresence: 0.5
    };
    
    const score2: VACRSScore = {
      valence: 0.7,
      arousal: 0.3,
      complexity: 0.9,
      rawness: 0.1,
      socialPresence: 0.4
    };
    
    const match1 = calculateVACRSScoreMatch(score1, score2);
    const match2 = calculateVACRSScoreMatch(score2, score1);
    
    expect(match1).toBe(match2);
  });

  it('higher match percentage for similar scores', () => {
    const base: VACRSScore = {
      valence: 0.5,
      arousal: 0.5,
      complexity: 0.5,
      rawness: 0.5,
      socialPresence: 0.5
    };
    
    const close: VACRSScore = {
      valence: 0.51,
      arousal: 0.51,
      complexity: 0.51,
      rawness: 0.51,
      socialPresence: 0.51
    };
    
    const far: VACRSScore = {
      valence: 0.8,
      arousal: 0.8,
      complexity: 0.8,
      rawness: 0.8,
      socialPresence: 0.8
    };
    
    const matchClose = calculateVACRSScoreMatch(base, close);
    const matchFar = calculateVACRSScoreMatch(base, far);
    
    expect(matchClose).toBeGreaterThan(matchFar);
  });
});
