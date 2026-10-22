# Genre Classification Improvements

## Overview

This document describes the improvements made to the genre classification system in Spotifun, addressing issues with thin/missing genres and flat trait scores.

## Problems Addressed

1. **False Positive Matches**: Old substring matching caused issues like "rap" matching "trap"
2. **Diluted Scores**: Multiple bucket hits averaged together, reducing specificity
3. **Unknown Genres Treated as Neutral**: Unmatched genres defaulted to 0.5, polluting weighted averages
4. **No Coverage Metrics**: No way to know how much of the classification was based on real data vs defaults
5. **Thin Spotify Genres**: Many artists have empty or sparse genre data

## Solution Architecture

### 1. Genre Taxonomy (`src/utils/genreTaxonomy.ts`)

Unified hierarchical genre taxonomy merging data from `genreProfiles.ts` and `genreScores.ts`:

- **150+ genres** with VACRS scores and aliases
- **Hierarchical structure** with parent fallback (e.g., "uk drill" → "drill" → "trap" → "hiphop")
- **Top-level genres** must have complete VACRS scores
- **Sub-genres** inherit from parents or override specific traits
- **Aliases** for alternate spellings and common variations

```typescript
export const GENRE_TAXONOMY: GenreTaxonomy = {
  drill: {
    scores: { valence: 0.3, arousal: 0.8, complexity: 0.4, rawness: 0.8, socialPresence: 0.7 },
    aliases: ['drill'],
    parent: 'trap',
    description: 'Dark, aggressive hip-hop style'
  },
  'uk drill': {
    aliases: ['uk drill', 'ukdrill'],
    parent: 'drill',  // Inherits scores from drill
    description: 'UK variant of drill music'
  }
}
```

### 2. Descriptor Vocabulary (`src/utils/descriptorVocabulary.ts`)

Separate mood/tag vocabulary extracted from old `genreScores.ts`:

- **200+ descriptors** organized by VACRS dimension
- Used for scoring Last.fm tags and mood adjectives
- Each dimension has 5 buckets with specific scores
- Examples: "melancholic" (valence: 0.3), "energetic" (arousal: 0.7), "complex" (complexity: 0.7)

### 3. Genre Normalization (`src/utils/genreNormalization.ts`)

Robust string normalization and matching:

```typescript
normalizeGenre("R&B") → "r and b"
normalizeGenre("Hip-Hop") → "hip hop"
normalizeGenre("Lo-Fi Hip Hop") → "lo-fi"
```

Features:
- Case normalization
- Diacritic removal (café → cafe)
- '&' → 'and' conversion
- Hyphen/space normalization
- 100+ alias mappings
- Whole-word matching to avoid false positives

### 4. Improved Classification (`src/utils/improvedClassification.ts`)

Enhanced classification algorithm:

**Matching Strategy:**
1. Exact match on normalized genre + aliases
2. Whole-word match, prefer longest (most specific)
3. Fallback to parent via keyword
4. Fallback to last word (e.g., "uk drill" → "drill")
5. Return UNKNOWN if no match (not 0.5)

**Results Include:**
- `scores`: VACRS scores or null
- `matchedGenre`: Which genre was matched
- `matchType`: 'exact', 'parent', 'keyword', or 'unknown'
- `coverage`: Proportion of weight successfully classified (0-1)

```typescript
const result = classifyGenre("uk drill, atmospheric black metal");
// result.coverage = 1.0 (100% classified)
// result.scores = weighted average of matched genres
// result.classifications = details for each genre
```

### 5. Last.fm Integration (`src/utils/lastfm.ts`)

External API integration for artists with sparse Spotify genres:

**Features:**
- Fetches artist.getTopTags from Last.fm API
- Filters junk tags (nationalities, years, "seen live", etc.)
- Weights tags by count
- Scores against both genre taxonomy and descriptor vocabulary
- Next.js fetch caching (7-day revalidation)
- Rate limiting (5 requests/second)
- Graceful degradation if API key missing

**Strategy:**
- If Spotify has 3+ genres with 80%+ coverage → use Spotify
- If Spotify has 0-2 genres or poor coverage → supplement with Last.fm
- Blend results weighted by coverage

```typescript
const result = await supplementGenresWithLastFm(
  ['indie', 'alternative'],  // Sparse Spotify genres
  'Artist Name',
  process.env.LASTFM_API_KEY
);
// Fetches Last.fm tags, scores them, blends with Spotify
```

### 6. Validation (`src/utils/genreValidation.ts`)

Comprehensive taxonomy and classification testing:

**Taxonomy Checks:**
- Every top-level genre has complete VACRS scores
- All parent references exist
- No circular parent chains
- All genres can resolve to scores

**Classification Tests:**
- 70+ real Spotify genre strings
- Reports classification coverage
- Identifies unknown genres

## Usage

### Basic Classification (Backwards Compatible)

```typescript
import { calculateGenreVACRSScore } from '@/utils/musicClassification';

const scores = calculateGenreVACRSScore('uk drill');
// Returns: VACRSScore with inherited values from drill → trap → hiphop
```

### Extended Classification (with Coverage)

```typescript
import { classifyGenreExtended } from '@/utils/musicClassification';

const result = classifyGenreExtended('indie rock, shoegaze, post-punk');
console.log(`Coverage: ${(result.coverage * 100).toFixed(1)}%`);
// Shows what percentage of genres were successfully classified
```

### With Last.fm Supplementation

```typescript
import { supplementGenresWithLastFm } from '@/utils/lastfm';

const result = await supplementGenresWithLastFm(
  artist.genres,  // Spotify genres
  artist.name,    // Artist name
  process.env.LASTFM_API_KEY
);

// Returns blended scores with improved coverage
```

## Environment Variables

```env
# Optional but recommended
LASTFM_API_KEY=your_api_key_here
```

Get your key at: https://www.last.fm/api/account/create

## Caching Strategy

### Current: Next.js Fetch Cache
- Last.fm responses cached 7 days
- Artist genres rarely change
- Automatic revalidation
- No database required

### Future: KV Store (Upstash Redis)
The code is designed to easily upgrade to a KV store:
```typescript
// Check KV store first
const cached = await kv.get(`artist:${artistName}:tags`);
if (cached) return cached;

// Fetch from Last.fm
const tags = await fetchLastFmArtistTags(artistName, apiKey);

// Store in KV with 7-day TTL
await kv.set(`artist:${artistName}:tags`, tags, { ex: 60 * 60 * 24 * 7 });
```

## Before/After Comparison

### Before (Old System)

**Example: "uk drill"**
- Matched "rap" via substring in "drill" → WRONG
- Multiple diluted matches averaged together
- Coverage: Unknown (could be 0% but returns 0.5)

**Example: Artist with 0 Spotify genres**
- Returns neutral 0.5 for all traits
- No way to improve via external data

### After (New System)

**Example: "uk drill"**
- Exact match: "uk drill" → inherits from "drill" → "trap" → "hiphop"
- Valence: 0.3, Arousal: 0.8, Rawness: 0.8 (correctly dark & aggressive)
- Coverage: 100%

**Example: Artist with 0 Spotify genres**
- Fetches Last.fm tags: ["electronic", "dance", "house", "energetic", "upbeat"]
- Scores tags against taxonomy + descriptors
- Returns blended VACRS with 85% coverage
- If Last.fm fails, coverage: 0% (not mistaken for 0.5)

## Performance Considerations

1. **Classification**: O(n) where n = number of genres in taxonomy (~150)
   - Negligible overhead, runs client-side
   
2. **Last.fm API**: 
   - Cached 7 days, so typically 0 extra requests
   - Rate limited to 5/second
   - Batch processing available
   - Failures degrade gracefully

3. **Memory**: Taxonomy + vocabulary ~50KB (negligible)

## Attribution

Last.fm API usage requires attribution. Add to your UI footer:

```tsx
<a href="https://www.last.fm" target="_blank">
  Powered by Last.fm
</a>
```

## Testing

To validate taxonomy and test classification:

```typescript
import { printValidationResults } from '@/utils/genreValidation';

printValidationResults();
// Prints:
// - Taxonomy validation results
// - Classification coverage on 70+ test genres
// - Unknown genres that need taxonomy entries
```

## Future Enhancements

1. **MusicBrainz Integration** (optional)
   - Additional fallback for genres
   - Only as background task (1 req/sec limit)
   - Never on critical path

2. **KV Store Upgrade**
   - Better persistence than fetch cache
   - Shared across deployments
   - Easy to add (code already structured for it)

3. **Coverage UI Display**
   - Show classification confidence to users
   - "Based on X% genre data" badge
   - Highlight artists that would benefit from Last.fm

4. **Machine Learning** (future)
   - Train on classified artists → predict unknown genres
   - Use audio features if genre coverage poor
   - Keep current system as baseline

## Files Changed/Added

**New Files:**
- `src/utils/genreTaxonomy.ts` - Unified genre hierarchy
- `src/utils/descriptorVocabulary.ts` - Mood/tag vocabulary
- `src/utils/genreNormalization.ts` - String normalization
- `src/utils/improvedClassification.ts` - Enhanced classification
- `src/utils/lastfm.ts` - Last.fm integration
- `src/utils/genreValidation.ts` - Validation & testing
- `.env.example` - Environment variable template

**Modified Files:**
- `src/utils/musicClassification.ts` - Updated to use new system
- `SETUP.md` - Added Last.fm setup instructions
- `TODO.md` - Updated with completed items

**Preserved (for reference):**
- `src/utils/genreProfiles.ts` - Original profiles (can be removed)
- `src/utils/genreScores.ts` - Original scores (can be removed)

## Backward Compatibility

All existing function signatures are preserved:

```typescript
// Old code continues to work
const scores = calculateGenreVACRSScore('indie rock');
const weighted = calculateWeightedVACRSScore(genreStats);
```

New functions added:
```typescript
const result = classifyGenreExtended('indie rock'); // With coverage
const lastfm = await classifyArtistWithLastFm(name, apiKey);
```

## Summary

The improved genre classification system provides:

✅ **Accuracy**: Whole-word matching prevents false positives  
✅ **Specificity**: Hierarchical taxonomy preserves specific genre characteristics  
✅ **Transparency**: Coverage metrics show classification confidence  
✅ **Completeness**: Last.fm integration fills gaps in Spotify data  
✅ **Performance**: Efficient caching, minimal overhead  
✅ **Maintainability**: Clear structure, comprehensive validation  
✅ **Backward Compatible**: Existing code works unchanged  
