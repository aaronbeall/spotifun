# Genre Classification Research

## Current Implementation

### Genre-to-Trait Mapping System

Spotifun uses a VACRS (Valence, Arousal, Complexity, Rawness, Social Presence) model to map genres to personality traits. The implementation consists of two main files:

1. **`src/utils/genreProfiles.ts`** - 16 core genre profiles with aliases
   - Pop, Rock, Classical, Jazz, Electronic, Hip-Hop, Metal, Punk, Ambient, Folk, R&B, Country, Blues, Reggae, Experimental, Indie
   - Each profile maps to VACRS dimensions (0-1 scale)
   - Uses simple alias matching (e.g., "rock and roll" → rock)

2. **`src/utils/genreScores.ts`** - Comprehensive genre bucketing (360 lines)
   - 5 buckets per VACRS dimension, each with score and genre lists
   - Covers hundreds of genres and subgenres
   - Examples: funeral doom (valence: 0.1), happy hardcore (valence: 0.9)
   - Includes descriptors for each bucket

### Classification Logic

**`calculateGenreVACRSScore()` in `musicClassification.ts`:**
- Normalizes genre string to lowercase
- Checks each VACRS dimension's buckets
- Uses substring matching: `genre.includes(g)`
- Averages scores when multiple matches found
- **Falls back to neutral (0.5) when no match found**

**Coverage gaps identified:**
- **"No genre" handling**: Falls back to 0.5 (neutral) on all dimensions
- **Substring matching limitations**: Catches variants but may miss misspellings
- **No fuzzy matching**: "electrohouse" won't match "electro house"

---

## Problem: Missing Artist Genres

### Root Cause
Spotify's Artist Objects API returns an empty `genres` array for many artists, especially since late-2024 API changes. When artists have no genres:
- `GenreStats` becomes empty or sparse
- VACRS dimensions default to neutral (0.5)
- Visualizations show "No genre" badges
- Personality insights lack specificity

### Impact
- **Vibe matching**: Cannot match users to music vibes without genre data
- **Flow charts**: Genre flow shows gaps
- **Spectrum analysis**: Less meaningful trait distribution
- **Persona detection**: Harder to classify listening behavior

---

## Research: Genre Classification Improvements

### Option A: Last.fm Tags API

**What it provides:**
- Community-tagged genres/tags per artist and track
- More granular than Spotify (e.g., "shoegaze", "dream pop")
- Historical data (less affected by recent API changes)

**Implementation:**
```javascript
// Example: Last.fm artist.getTopTags
GET http://ws.audioscrobbler.com/2.0/?method=artist.gettoptags
    &artist=Radiohead
    &api_key=YOUR_API_KEY
    &format=json

Response:
{
  "toptags": {
    "tag": [
      {"name": "alternative rock", "count": 100},
      {"name": "indie", "count": 75},
      ...
    ]
  }
}
```

**Considerations:**
- **API Key**: Free tier available (registered but not secret)
- **Rate Limits**: 5 calls/sec, consider caching
- **Cost**: Free for non-commercial
- **Terms**: Must display "Powered by Last.fm" attribution
- **Coverage**: Very good for popular artists, sparse for niche/new artists
- **Caching strategy**: Cache by artist ID in localStorage or database

**Recommendation weight: HIGH** - Best balance of coverage, cost, and ease of integration.

---

### Option B: MusicBrainz Genres and Tags

**What it provides:**
- Crowd-sourced, open-source music database
- Artist and release-level genres and tags
- Relationships between artists (similar artists)

**Implementation:**
```javascript
// Example: MusicBrainz artist lookup
GET https://musicbrainz.org/ws/2/artist/{mbid}?fmt=json&inc=tags+genres

Response:
{
  "tags": [
    {"count": 5, "name": "rock"},
    {"count": 3, "name": "alternative"}
  ],
  "genres": [
    {"count": 4, "name": "indie rock"}
  ]
}
```

**Considerations:**
- **API Key**: None required
- **Rate Limits**: 1 call/sec (stricter than Last.fm)
- **Cost**: Free and open-source
- **Terms**: CC0 license (very permissive)
- **MBID Mapping**: Need to map Spotify artist ID → MusicBrainz ID first (adds latency)
- **Coverage**: Excellent for established artists, sparse for new/regional artists

**Recommendation weight: MEDIUM** - Good fallback, but rate limits and MBID mapping add complexity.

---

### Option C: Discogs Styles API

**What it provides:**
- Detailed "styles" field (more specific than genres)
- Release-level metadata
- Good for electronic, hip-hop, metal subgenres

**Implementation:**
```javascript
// Example: Discogs artist search
GET https://api.discogs.com/database/search?q={artist_name}&type=artist

Response:
{
  "results": [{
    "style": ["Techno", "Minimal"]
  }]
}
```

**Considerations:**
- **API Key**: Required (free tier: 60 calls/min)
- **Rate Limits**: 60/min authenticated, 25/min unauthenticated
- **Cost**: Free
- **Terms**: Must attribute Discogs
- **Coverage**: Best for electronic and physical releases, less for streaming-only artists
- **Artist Name Matching**: Requires fuzzy matching (no direct Spotify ID link)

**Recommendation weight: LOW** - Good for specific genres, but limited coverage and requires artist name matching.

---

### Option D: Infer from Co-Listened Artists (Spotify's Related Artists)

**What it provides:**
- Spotify's own "related artists" endpoint returns similar artists
- Can infer genres from artists the user also listens to

**Implementation:**
```javascript
// Example: Spotify Related Artists
GET https://api.spotify.com/v1/artists/{id}/related-artists

Response:
{
  "artists": [
    {"name": "Artist B", "genres": ["indie", "alternative"]}
  ]
}
```

**Considerations:**
- **API Key**: Already have (Spotify API)
- **Rate Limits**: Same as existing Spotify calls
- **Cost**: Free (within existing Spotify quota)
- **Terms**: Already compliant
- **Coverage**: Good for popular artists, less accurate for niche artists
- **Logic**: Take intersection of related artists' genres, weight by number of related artists with that genre

**Recommendation weight: MEDIUM** - No new dependencies, but adds Spotify API calls and may not always be accurate.

---

### Option E: Playlist Name Mining (User's Own Playlists)

**What it provides:**
- Infer genres from playlist names containing the artist
- E.g., if artist appears in "Chill Indie Vibes" → infer "indie", "chill"

**Implementation:**
```javascript
// Example: Spotify User Playlists
GET https://api.spotify.com/v1/me/playlists

// For each playlist, check tracks and extract keywords from playlist name
// Match keywords against genre taxonomy
```

**Considerations:**
- **API Key**: Already have (Spotify API)
- **Rate Limits**: Same as existing Spotify calls
- **Cost**: Free
- **Terms**: Already compliant
- **Coverage**: Only works for artists in user's playlists; very user-specific
- **Accuracy**: Low (playlist names are arbitrary and noisy)

**Recommendation weight: LOW** - Too noisy and user-specific to be reliable.

---

### Option F: LLM-Based Genre Classifier

**What it provides:**
- Use an LLM (OpenAI, Anthropic, or local model) to classify artist based on name and context
- Can handle misspellings, variants, and novel artists

**Implementation:**
```javascript
// Example: OpenAI API
POST https://api.openai.com/v1/chat/completions

Prompt:
"Classify the following artist into genres (max 3): {artist_name}
Return ONLY a comma-separated list of genres from this taxonomy: {GENRE_TAXONOMY}"

Response:
"indie rock, dream pop, shoegaze"
```

**Considerations:**
- **API Key**: Required (OpenAI, Anthropic, etc.)
- **Rate Limits**: Varies by provider (OpenAI: ~3000 RPM for GPT-3.5)
- **Cost**: **~$0.002 per classification** (GPT-3.5-turbo)
- **Terms**: Check provider terms for user data usage
- **Latency**: 200-500ms per call
- **Accuracy**: Very high for known artists, good for novel/misspelled artists
- **Caching**: CRITICAL - cache by artist name to avoid repeated costs

**Recommendation weight: LOW-MEDIUM** - Powerful but costly; only viable with aggressive caching.

---

## Genre Mapping Improvements

### Current Mapping Coverage

**`genreScores.ts` analysis:**
- 5 buckets per dimension × 5 dimensions = 25 total buckets
- Hundreds of genres covered (estimated 300-500 unique strings)
- Good coverage for major genres and subgenres
- Substring matching helps catch variants

**Identified gaps:**
1. **Misspellings**: "electrohouse" vs "electro house"
2. **Regional variants**: "UK drill" vs "drill" (may map differently)
3. **Emerging genres**: TikTok trends, micro-genres
4. **Multi-genre strings**: "indie rock/pop" → should split and average

### Improvement Option 1: Normalized Genre Taxonomy

**Approach:**
- Create a canonical genre name mapping
- Normalize input before classification
- Handle common misspellings and variants

**Implementation:**
```typescript
const GENRE_NORMALIZATION: Record<string, string> = {
  "electrohouse": "electro house",
  "deep-house": "deep house",
  "trap/hip hop": "trap",
  "r&b": "r and b",
  "uk drill": "drill",
  // ... hundreds more
};

function normalizeGenre(genre: string): string {
  const lower = genre.toLowerCase().trim();
  return GENRE_NORMALIZATION[lower] || lower;
}
```

**Pros:**
- No API calls, no cost
- Instant classification
- Deterministic results

**Cons:**
- Manual curation required
- Doesn't scale to new genres automatically
- Still relies on exact matches

**Recommendation weight: HIGH** - Low-hanging fruit; implement alongside external APIs.

---

### Improvement Option 2: Fuzzy Matching with Levenshtein Distance

**Approach:**
- Use string similarity to match close variants
- Threshold (e.g., distance ≤ 2) for accepting matches

**Implementation:**
```typescript
import levenshtein from 'fast-levenshtein';

function findClosestGenre(input: string, genres: string[], threshold = 2): string | null {
  let closest = null;
  let minDist = Infinity;
  
  for (const genre of genres) {
    const dist = levenshtein.get(input, genre);
    if (dist < minDist && dist <= threshold) {
      minDist = dist;
      closest = genre;
    }
  }
  
  return closest;
}
```

**Pros:**
- Handles typos and close variants
- No external dependencies
- Fast (< 1ms per classification)

**Cons:**
- May match incorrectly ("trap" and "trance" have distance 2)
- Requires tuning threshold per genre
- Doesn't help with completely new genres

**Recommendation weight: MEDIUM** - Useful addition, but not a complete solution.

---

### Improvement Option 3: Parent Genre Fallback

**Approach:**
- Build a genre hierarchy (subgenre → parent genre)
- When exact match fails, fall back to parent genre

**Implementation:**
```typescript
const GENRE_HIERARCHY: Record<string, string> = {
  // Electronic subgenres → electronic
  "deep house": "electronic",
  "tech house": "electronic",
  "minimal techno": "electronic",
  
  // Metal subgenres → metal
  "death metal": "metal",
  "black metal": "metal",
  "doom metal": "metal",
  
  // ... etc
};

function classifyWithFallback(genre: string): VACRSScore {
  let score = calculateGenreVACRSScore(genre);
  
  // If no match (all 0.5), try parent genre
  if (isNeutralScore(score) && GENRE_HIERARCHY[genre]) {
    score = calculateGenreVACRSScore(GENRE_HIERARCHY[genre]);
  }
  
  return score;
}
```

**Pros:**
- Graceful degradation (specific → general)
- No API calls
- Improves coverage without external data

**Cons:**
- Manual curation of hierarchy
- Parent genre may be too broad (loses nuance)
- Doesn't help with completely unknown genres

**Recommendation weight: HIGH** - Excellent fallback; should implement.

---

## Recommended Implementation Plan

### Phase 1: Quick Wins (No External Dependencies)
1. **Genre normalization mapping** - Handle common misspellings and variants
2. **Parent genre fallback** - Map subgenres to parent genres
3. **Multi-genre splitting** - Split "genre1/genre2" and average scores
4. **Improved logging** - Track which genres fall back to neutral (0.5) to identify gaps

**Estimated effort:** 1-2 days  
**Cost:** $0  
**Impact:** 20-30% reduction in "No genre" cases

---

### Phase 2: External Data Integration (Last.fm Primary)
1. **Last.fm API integration** - Primary genre source for artists with empty Spotify genres
2. **Caching layer** - Cache Last.fm results by Spotify artist ID (localStorage or database)
3. **Fallback chain:** Spotify genres → Last.fm tags → Neutral (0.5)
4. **Rate limiting** - Respect 5 calls/sec limit (queue requests)
5. **Attribution** - Add "Genre data powered by Last.fm" in settings/about page

**Estimated effort:** 3-5 days  
**Cost:** $0 (free tier)  
**Impact:** 60-80% reduction in "No genre" cases

---

### Phase 3: Alternative Fallbacks (Optional)
1. **MusicBrainz integration** - Secondary fallback for artists not in Last.fm
2. **Spotify Related Artists** - Tertiary fallback (infer from similar artists)
3. **Fuzzy matching** - Last resort for typos/variants

**Estimated effort:** 3-5 days per integration  
**Cost:** $0  
**Impact:** Additional 10-15% coverage improvement

---

## Implementation Considerations

### Caching Strategy
**Critical for cost and performance:**
- Cache by Spotify artist ID (not name, to avoid duplicates)
- Store: `{ artistId: { genres: string[], source: 'spotify' | 'lastfm' | 'musicbrainz', timestamp: Date } }`
- TTL: 30 days (genres rarely change)
- Storage: localStorage for client-side caching, or database for server-side

### Privacy & Terms of Service
- **Last.fm**: Requires API key (not secret), must attribute
- **MusicBrainz**: CC0 license (very permissive), no API key
- **Spotify**: Already compliant; no additional terms
- **User data**: Genre data is public; no privacy concerns

### Rate Limiting
- **Last.fm**: 5 calls/sec → queue requests, batch if possible
- **MusicBrainz**: 1 call/sec → queue with delays
- **Spotify**: Existing rate limits apply
- **Strategy**: Fetch genres lazily (on-demand), not all at once

### Handling Unknown Genres (Post-Lookup)
Even after external APIs, some genres may be unmapped (e.g., "abstractextratone"):
1. **Log to analytics** - Track frequency of unknown genres to prioritize manual mapping
2. **Fuzzy match** - Try to match to closest known genre
3. **Parent genre heuristics** - Extract root word ("extratone" → "trance"?)
4. **Ultimate fallback** - Neutral (0.5) with user feedback option ("Is this [genre]? Help us improve!")

---

## Conclusion

**Recommended approach:**
1. **Phase 1 (immediate)**: Implement normalization, parent fallback, and logging
2. **Phase 2 (next sprint)**: Integrate Last.fm API with caching
3. **Phase 3 (future)**: Add MusicBrainz or Spotify Related Artists as secondary fallbacks

**Expected outcome:**
- 80-90% reduction in "No genre" / neutral fallback cases
- More accurate personality insights and visualizations
- Minimal cost ($0) and acceptable latency (< 100ms with caching)

**Risks:**
- Last.fm API stability (mitigate with MusicBrainz fallback)
- Rate limiting (mitigate with caching and queuing)
- Maintenance burden (additional API dependencies)

**Alternatives not recommended:**
- LLM classification (too costly without aggressive caching)
- Playlist mining (too noisy and user-specific)
- Discogs (limited coverage, requires name matching)
