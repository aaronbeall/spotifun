# Unit Tests for spotify.ts

## Test Coverage Needed

The following functions in `src/lib/spotify.ts` should have unit tests:

### 1. `calculateTopTracksStats(topTracks, artistsById)`
- **Test**: Rank-based weight calculation using exponential decay formula (`Math.pow(0.95, index) * 100`)
  - Verify first track gets weight 100, second gets 95, third gets 90.25, etc.
- **Test**: Genre aggregation from multiple artists
  - Track with artist having ["rock", "alternative"] should contribute both genres
- **Test**: Empty input handling
  - Should return empty arrays and 0 totals
- **Test**: Missing artist data handling
  - Should still process track even if artist not in artistsById map

### 2. `calculateTopArtistsStats(topArtists, topTracks)`
- **Test**: Track matching by artist ID
  - Should only include tracks where track.artists includes the top artist's ID
  - Should not use all top tracks, only those by top artists
- **Test**: Artist rank-based weighting
  - First artist gets weight 100, second gets 95, etc.
- **Test**: Handle artists with no matching tracks
  - Should still include artist in artistStats with correct weight
  - trackStats may be empty or have fewer tracks than artists

### 3. `calculateTrackStats(recentlyPlayed, artistsById)`
- **Test**: Play count aggregation
  - Same track played twice should have playCount = 2
- **Test**: Artist assignment
  - Track artists should be looked up in artistsById map

### 4. `calculateArtistStats(recentlyPlayed, artistsById)`
- **Test**: Play count per artist
  - Multiple tracks by same artist should sum play counts

### 5. `calculateGenreStats(recentlyPlayed, artistsById)`
- **Test**: Genre aggregation
  - Same genre from multiple artists should sum play counts
- **Test**: Empty genres handling
  - Artists with empty genres array should not break calculation

## Test Setup Requirements

To implement these tests, the project needs:

1. **Test Framework**: Install Jest or Vitest
   ```bash
   npm install --save-dev vitest @vitest/ui
   ```

2. **Test Script**: Add to package.json
   ```json
   "scripts": {
     "test": "vitest",
     "test:ui": "vitest --ui"
   }
   ```

3. **Vitest Config**: Create `vitest.config.ts`
   ```typescript
   import { defineConfig } from 'vitest/config';
   import path from 'path';

   export default defineConfig({
     test: {
       globals: true,
       environment: 'node',
     },
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
   });
   ```

4. **TypeScript Config**: Update tsconfig.json to include vitest globals
   ```json
   {
     "compilerOptions": {
       "types": ["vitest/globals"]
     }
   }
   ```

## Example Test Structure

```typescript
// src/lib/__tests__/spotify.test.ts
import { describe, it, expect } from 'vitest';
import { calculateTopTracksStats } from '../spotify';

describe('calculateTopTracksStats', () => {
  it('applies exponential decay weights', () => {
    const mockTracks = [/* ... */];
    const mockArtistsById = {/* ... */};
    
    const result = calculateTopTracksStats(mockTracks, mockArtistsById);
    
    expect(result.trackStats[0].playCount).toBe(100);
    expect(result.trackStats[1].playCount).toBeCloseTo(95, 2);
  });
});
```

## Why These Tests Matter

1. **Rank Weight Formula**: Easy to break when refactoring, tests ensure the exponential decay is correctly applied
2. **Track Matching Logic**: The Top Artists mode's track matching by artist ID is critical and non-obvious
3. **Genre Aggregation**: Genre stats aggregation across multiple artists and tracks needs verification
4. **Edge Cases**: Empty data, missing artists, etc. should be handled gracefully

## Next Steps

1. Install test framework (Vitest recommended for Next.js projects)
2. Write tests for the core calculation functions
3. Run tests in CI pipeline
4. Add test coverage reporting
