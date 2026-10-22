/**
 * Last.fm API Integration
 * 
 * Fetches artist tags from Last.fm to supplement Spotify genres.
 * Uses Next.js/Vercel fetch caching for performance.
 */

import { scoreWeightedTags, WeightedClassificationResult } from './improvedClassification';

/**
 * Last.fm artist tag with count
 */
export interface LastFmTag {
  name: string;
  count: number;
}

/**
 * Last.fm API response for artist.getTopTags
 */
interface LastFmTopTagsResponse {
  toptags?: {
    tag?: LastFmTag[];
  };
  error?: number;
  message?: string;
}

/**
 * Junk tags to filter out (non-musical metadata)
 */
const JUNK_TAGS = new Set([
  // Location/nationality
  'american', 'british', 'uk', 'english', 'french', 'german', 'canadian', 'australian',
  'swedish', 'norwegian', 'danish', 'finnish', 'icelandic', 'irish', 'scottish', 'welsh',
  'japanese', 'korean', 'chinese', 'taiwanese', 'indian', 'brazilian', 'mexican',
  'spanish', 'italian', 'dutch', 'belgian', 'swiss', 'austrian', 'polish', 'russian',
  'usa', 'europe', 'asia', 'africa', 'america', 'uk', 'england', 'london', 'new york',
  
  // Decades/years
  '60s', '70s', '80s', '90s', '00s', '10s', '20s', 'sixties', 'seventies', 'eighties', 'nineties',
  '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s',
  
  // Activity tags
  'seen live', 'favorite', 'favorites', 'favourite', 'favourites', 'love', 'loved',
  'owned', 'own', 'have', 'want', 'need', 'buy', 'bought', 'concert', 'live',
  'tour', 'festival', 'gig', 'show', 'performance', 'setlist',
  
  // Platforms/labels
  'spotify', 'youtube', 'soundcloud', 'bandcamp', 'itunes', 'apple music',
  'record label', 'indie label', 'major label', 'independent', 'unsigned',
  
  // Generic/vague
  'music', 'songs', 'artist', 'artists', 'band', 'bands', 'group', 'singer',
  'musician', 'musicians', 'album', 'albums', 'track', 'tracks', 'ep', 'lp',
  'good', 'bad', 'great', 'awesome', 'amazing', 'cool', 'nice', 'best',
  'top', 'popular', 'famous', 'unknown', 'new', 'old', 'classic', 'modern',
  
  // Gender
  'male', 'female', 'male vocalists', 'female vocalists', 'male vocalist', 'female vocalist',
  'male fronted', 'female fronted', 'male singer', 'female singer',
  
  // Format
  'mp3', 'flac', 'vinyl', 'cd', 'cassette', 'digital', 'physical',
  
  // Playlist/mood contexts that are too generic
  'chill', 'chillout', 'relax', 'relaxing', 'study', 'sleep', 'workout', 'party',
  'driving', 'road trip', 'summer', 'winter', 'spring', 'fall', 'autumn',
  'morning', 'night', 'evening', 'afternoon', 'late night',
  
  // Too specific/personal
  'under 2000 listeners', 'recommended', 'to listen', 'check out', 'discover',
]);

/**
 * Check if a tag should be filtered out
 */
function isJunkTag(tag: string): boolean {
  const normalized = tag.toLowerCase().trim();
  
  // Check against junk set
  if (JUNK_TAGS.has(normalized)) {
    return true;
  }
  
  // Filter year patterns (1900-2099)
  if (/^(19|20)\d{2}$/.test(normalized)) {
    return true;
  }
  
  // Filter single letters
  if (/^[a-z]$/.test(normalized)) {
    return true;
  }
  
  // Filter very short tags (likely abbreviations or noise)
  if (normalized.length <= 2) {
    return true;
  }
  
  return false;
}

/**
 * Normalize a Last.fm tag
 */
function normalizeLastFmTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Fetch artist tags from Last.fm
 * 
 * Uses Next.js fetch caching with long revalidation period.
 * Can be upgraded to KV store (e.g., Upstash Redis) for better persistence.
 * 
 * @param artistName - The artist name to fetch tags for
 * @param apiKey - Last.fm API key (optional, degrades gracefully if missing)
 * @returns Array of tags with counts, or null on error
 */
export async function fetchLastFmArtistTags(
  artistName: string,
  apiKey?: string
): Promise<LastFmTag[] | null> {
  // If no API key, degrade gracefully
  if (!apiKey) {
    console.warn('Last.fm API key not configured (LASTFM_API_KEY). Skipping external tag fetch.');
    return null;
  }
  
  if (!artistName || artistName.trim().length === 0) {
    return null;
  }
  
  try {
    const url = new URL('https://ws.audioscrobbler.com/2.0/');
    url.searchParams.set('method', 'artist.getTopTags');
    url.searchParams.set('artist', artistName);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('format', 'json');
    
    // Use Next.js fetch caching with long revalidation (7 days)
    // Genres rarely change, so this is safe
    const response = await fetch(url.toString(), {
      next: { 
        revalidate: 60 * 60 * 24 * 7, // 7 days
        tags: [`lastfm-tags-${artistName.toLowerCase()}`]
      }
    });
    
    if (!response.ok) {
      console.warn(`Last.fm API error for artist "${artistName}": ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data: LastFmTopTagsResponse = await response.json();
    
    if (data.error) {
      console.warn(`Last.fm API error for artist "${artistName}": ${data.message}`);
      return null;
    }
    
    if (!data.toptags?.tag || !Array.isArray(data.toptags.tag)) {
      return [];
    }
    
    // Filter and normalize tags
    const tags = data.toptags.tag
      .filter(tag => {
        if (!tag.name || typeof tag.count !== 'number') {
          return false;
        }
        if (isJunkTag(tag.name)) {
          return false;
        }
        return true;
      })
      .map(tag => ({
        name: normalizeLastFmTag(tag.name),
        count: tag.count
      }))
      .filter(tag => tag.count > 0); // Filter zero-count tags
    
    return tags;
  } catch (error) {
    console.error(`Error fetching Last.fm tags for artist "${artistName}":`, error);
    return null;
  }
}

/**
 * Classify an artist using Last.fm tags
 * 
 * @param artistName - The artist name
 * @param apiKey - Last.fm API key (optional)
 * @returns Classification result with coverage, or null on error
 */
export async function classifyArtistWithLastFm(
  artistName: string,
  apiKey?: string
): Promise<WeightedClassificationResult | null> {
  const tags = await fetchLastFmArtistTags(artistName, apiKey);
  
  if (!tags || tags.length === 0) {
    return null;
  }
  
  // Score tags using the weighted tag scorer
  const weightedTags = tags.map(tag => ({
    tag: tag.name,
    weight: tag.count
  }));
  
  return scoreWeightedTags(weightedTags);
}

/**
 * Supplement Spotify genres with Last.fm tags
 * 
 * Strategy:
 * - If Spotify has 3+ genres with good coverage, use Spotify
 * - If Spotify has 0-2 genres or poor coverage, supplement with Last.fm
 * - Blend Spotify and Last.fm results weighted by their coverage
 * 
 * @param spotifyGenres - Array of Spotify genre strings
 * @param artistName - Artist name for Last.fm lookup
 * @param apiKey - Last.fm API key (optional)
 * @returns Enhanced classification result
 */
export async function supplementGenresWithLastFm(
  spotifyGenres: string[],
  artistName: string,
  apiKey?: string
): Promise<WeightedClassificationResult> {
  // Default result (neutral scores, zero coverage)
  const defaultResult: WeightedClassificationResult = {
    scores: { valence: 0.5, arousal: 0.5, complexity: 0.5, rawness: 0.5, socialPresence: 0.5 },
    coverage: 0,
    classifications: [],
    totalWeight: 0
  };
  
  // Classify Spotify genres first
  const spotifyResult = await import('./improvedClassification').then(mod => {
    if (!spotifyGenres || spotifyGenres.length === 0) {
      return defaultResult;
    }
    const genreString = spotifyGenres.join(', ');
    return mod.classifyGenre(genreString);
  });
  
  // If Spotify has good coverage (80%+) and multiple genres, use it
  if (spotifyGenres.length >= 3 && spotifyResult.coverage >= 0.8) {
    return spotifyResult;
  }
  
  // Try to supplement with Last.fm
  const lastFmResult = await classifyArtistWithLastFm(artistName, apiKey);
  
  // If Last.fm fails, return Spotify result (even if poor)
  if (!lastFmResult) {
    return spotifyResult;
  }
  
  // If Spotify is empty, use Last.fm
  if (spotifyGenres.length === 0 || spotifyResult.coverage === 0) {
    return lastFmResult;
  }
  
  // Blend Spotify and Last.fm, weighted by coverage
  const spotifyWeight = spotifyResult.coverage;
  const lastFmWeight = lastFmResult.coverage;
  const totalWeight = spotifyWeight + lastFmWeight;
  
  if (totalWeight === 0) {
    return defaultResult;
  }
  
  const blendedScores = {
    valence: (spotifyResult.scores.valence * spotifyWeight + lastFmResult.scores.valence * lastFmWeight) / totalWeight,
    arousal: (spotifyResult.scores.arousal * spotifyWeight + lastFmResult.scores.arousal * lastFmWeight) / totalWeight,
    complexity: (spotifyResult.scores.complexity * spotifyWeight + lastFmResult.scores.complexity * lastFmWeight) / totalWeight,
    rawness: (spotifyResult.scores.rawness * spotifyWeight + lastFmResult.scores.rawness * lastFmWeight) / totalWeight,
    socialPresence: (spotifyResult.scores.socialPresence * spotifyWeight + lastFmResult.scores.socialPresence * lastFmWeight) / totalWeight
  };
  
  return {
    scores: blendedScores,
    coverage: (spotifyResult.coverage + lastFmResult.coverage) / 2,
    classifications: [...spotifyResult.classifications, ...lastFmResult.classifications],
    totalWeight: spotifyResult.totalWeight + lastFmResult.totalWeight
  };
}

/**
 * Rate limit tracker for Last.fm API
 * Last.fm allows ~5 requests per second
 */
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequestsPerSecond = 5;
  
  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    
    // Remove requests older than 1 second
    this.requests = this.requests.filter(time => now - time < 1000);
    
    // If we're at the limit, wait
    if (this.requests.length >= this.maxRequestsPerSecond) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = 1000 - (now - oldestRequest) + 50; // Add 50ms buffer
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    // Track this request
    this.requests.push(Date.now());
  }
}

export const lastFmRateLimiter = new RateLimiter();

/**
 * Batch classify artists with Last.fm, respecting rate limits
 * 
 * @param artistNames - Array of artist names
 * @param apiKey - Last.fm API key
 * @param concurrency - Max concurrent requests (default 3)
 * @returns Map of artist name to classification result
 */
export async function batchClassifyWithLastFm(
  artistNames: string[],
  apiKey: string,
  concurrency = 3
): Promise<Map<string, WeightedClassificationResult>> {
  const results = new Map<string, WeightedClassificationResult>();
  
  // Process in batches with concurrency limit
  for (let i = 0; i < artistNames.length; i += concurrency) {
    const batch = artistNames.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async (artistName) => {
      await lastFmRateLimiter.waitIfNeeded();
      const result = await classifyArtistWithLastFm(artistName, apiKey);
      if (result) {
        results.set(artistName, result);
      }
    });
    
    await Promise.all(batchPromises);
  }
  
  return results;
}
