# Genre Classification Examples

This document shows real examples of how the improved classification system works.

## Sample Classifications

### Well-Known Genres

```typescript
classifyGenre('pop')
// → valence: 0.8, arousal: 0.7, complexity: 0.3, rawness: 0.2, socialPresence: 0.8
// → coverage: 100%, matched: 'pop', type: 'exact'

classifyGenre('rock')
// → valence: 0.6, arousal: 0.8, complexity: 0.5, rawness: 0.6, socialPresence: 0.7
// → coverage: 100%, matched: 'rock', type: 'exact'

classifyGenre('hip hop')
// → valence: 0.6, arousal: 0.7, complexity: 0.6, rawness: 0.7, socialPresence: 0.8
// → coverage: 100%, matched: 'hiphop', type: 'exact'
```

### Compound Genres (with Parent Fallback)

```typescript
classifyGenre('uk drill')
// → Inherits from: drill → trap → hiphop
// → valence: 0.3, arousal: 0.8, complexity: 0.4, rawness: 0.8, socialPresence: 0.7
// → coverage: 100%, matched: 'uk drill', type: 'exact'

classifyGenre('atmospheric black metal')
// → Falls back to: black metal → metal
// → valence: 0.1, arousal: 0.9, complexity: 0.6, rawness: 0.95, socialPresence: 0.4
// → coverage: 100%, matched: 'black metal', type: 'keyword'

classifyGenre('indie dream pop')
// → Matches: indie, dream pop
// → Blended scores from both genres
// → coverage: 100%, multiple matches
```

### Normalization Examples

```typescript
// Case insensitive
classifyGenre('R&B') === classifyGenre('r&b') === classifyGenre('r and b')
// → All return same rnb classification

// Hyphen/space variations
classifyGenre('hip-hop') === classifyGenre('hip hop') === classifyGenre('hiphop')
// → All return same hiphop classification

// Diacritics removed
classifyGenre('reggaetón') === classifyGenre('reggaeton')
// → Both return same reggaeton classification

// Abbreviations
classifyGenre('dnb') === classifyGenre('d&b') === classifyGenre('drum and bass')
// → All return same drum and bass classification
```

### Unknown Genres

```typescript
classifyGenre('some-unknown-genre')
// → scores: { valence: 0.5, arousal: 0.5, ... } (neutral fallback)
// → coverage: 0% (clearly shows no data)
// → matched: null, type: 'unknown'

// Multiple genres with some unknown
classifyGenre('indie rock, some-unknown-genre, pop')
// → Averages indie rock + pop, excludes unknown
// → coverage: 66.7% (2 out of 3 classified)
```

### Multi-Genre Strings

```typescript
classifyGenre('indie rock, shoegaze, post-punk')
// → Classifies all three individually
// → Returns weighted average
// → coverage: 100% (all matched)

classifyGenre('electronic, house, techno, trance')
// → All four classified
// → Weighted average emphasizes electronic dance characteristics
// → coverage: 100%
```

## Last.fm Tag Scoring Examples

### Genre Tags
```typescript
scoreWeightedTags([
  { tag: 'electronic', weight: 100 },
  { tag: 'dance', weight: 80 },
  { tag: 'house', weight: 60 }
])
// → Scores against genre taxonomy
// → High arousal (energetic), high socialPresence (dance/club)
```

### Mood Tags
```typescript
scoreWeightedTags([
  { tag: 'melancholic', weight: 90 },
  { tag: 'dreamy', weight: 70 },
  { tag: 'atmospheric', weight: 65 }
])
// → Scores against descriptor vocabulary
// → Low valence (sad), low arousal (calm), medium complexity
```

### Mixed Tags (Genres + Moods)
```typescript
scoreWeightedTags([
  { tag: 'indie rock', weight: 100 },
  { tag: 'melancholic', weight: 85 },
  { tag: 'introspective', weight: 70 },
  { tag: 'atmospheric', weight: 60 }
])
// → Scores 'indie rock' against taxonomy
// → Scores mood tags against vocabulary
// → Blends results weighted by tag counts
```

## Comparison: Before vs After

### Example 1: "trap" Problem

**Before:**
```typescript
classifyGenre('trap')
// Also matched: "rap" (substring match)
// Diluted scores between trap and rap
// No way to know it was wrong
```

**After:**
```typescript
classifyGenre('trap')
// → Exact whole-word match on 'trap' only
// → valence: 0.5, arousal: 0.8, rawness: 0.7
// → No contamination from 'rap'
// → coverage: 100%
```

### Example 2: Unknown Genre Handling

**Before:**
```typescript
classifyGenre('unknown-genre')
// → Returns { valence: 0.5, arousal: 0.5, ... }
// → Looks like valid data
// → Pollutes weighted averages with fake 0.5s
```

**After:**
```typescript
classifyGenre('unknown-genre')
// → Returns { valence: 0.5, arousal: 0.5, ... } (same fallback)
// → BUT coverage: 0% (clearly shows no data)
// → Can be excluded from weighted averages
// → UI can show "classification uncertain"
```

### Example 3: Artist with No Spotify Genres

**Before:**
```typescript
// Artist.genres = []
calculateWeightedVACRSScore([])
// → Returns neutral 0.5 for everything
// → No way to improve
```

**After:**
```typescript
// Artist.genres = []
await supplementGenresWithLastFm([], 'Artist Name', apiKey)
// → Fetches Last.fm tags
// → Scores tags: ["electronic", "dance", "energetic", "upbeat"]
// → Returns: { valence: 0.8, arousal: 0.85, ... }
// → coverage: 85% (good data!)
```

## Real Spotify Genre Strings

These are examples from actual Spotify data that are now properly classified:

```typescript
// Simple
'pop', 'rock', 'jazz', 'classical', 'metal', 'punk'

// Electronic
'house', 'techno', 'trance', 'dubstep', 'drum and bass', 'edm'

// Hip-hop variants
'hip hop', 'trap', 'drill', 'uk drill', 'cloud rap', 'emo rap'

// Rock variants
'indie rock', 'alternative rock', 'garage rock', 'post-rock', 'post-punk'

// Metal variants
'death metal', 'black metal', 'doom metal', 'thrash metal', 'metalcore'

// Pop variants
'indie pop', 'dream pop', 'synth-pop', 'electropop', 'k-pop', 'j-pop'

// R&B/Soul
'r&b', 'neo soul', 'funk', 'soul'

// Electronic variants
'deep house', 'tech house', 'progressive house', 'tropical house'

// Indie
'indie', 'indie folk', 'bedroom pop', 'singer-songwriter'

// Other
'reggae', 'dub', 'dancehall', 'blues', 'country', 'folk'
```

All of these now classify correctly with appropriate VACRS scores and 100% coverage.

## Testing Your Classification

To test the system with your own genres:

```typescript
import { classifyGenreExtended } from '@/utils/musicClassification';

const result = classifyGenreExtended('your genre here');

console.log('Scores:', result.scores);
console.log('Coverage:', (result.coverage * 100).toFixed(1) + '%');
console.log('Matched genres:', result.classifications
  .filter(c => c.matchedGenre)
  .map(c => `${c.originalGenre} → ${c.matchedGenre} (${c.matchType})`)
);
```

## Key Improvements Summary

✅ **Whole-word matching** - "trap" doesn't match "rap"  
✅ **Hierarchical fallback** - "uk drill" → "drill" → "trap"  
✅ **Coverage metrics** - Know when classification is uncertain  
✅ **Last.fm supplement** - Fill gaps in Spotify data  
✅ **Normalization** - "R&B", "r&b", "r and b" all work  
✅ **Unknown tracking** - Excludes unknowns from averages  
✅ **Longest match** - Prefers specific over general  
