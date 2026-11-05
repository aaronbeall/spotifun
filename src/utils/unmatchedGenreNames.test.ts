import { describe, expect, it } from 'vitest';
import { unmatchedGenreNames } from './improvedClassification';

describe('unmatchedGenreNames', () => {
  it('keeps labels that match nothing and drops known genres and mood words', () => {
    expect(unmatchedGenreNames(['pop', 'sad', 'hyper-specific microgenre', 'pop', '  '])).toEqual([
      'hyper-specific microgenre',
    ]);
  });
});
