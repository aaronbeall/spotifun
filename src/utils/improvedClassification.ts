/**
 * Improved Genre Classification System
 * 
 * This module provides enhanced genre classification using:
 * - Hierarchical genre taxonomy with parent fallback
 * - Whole-word matching to avoid false positives
 * - Preference for most specific (longest) matches
 * - Unknown genre tracking instead of defaulting to 0.5
 * - Coverage metrics for classification quality
 * - Descriptor-based mood/tag scoring
 */

import { VACRSScore } from '@/types';
import { GENRE_TAXONOMY, GenreTaxonomyEntry } from './genreTaxonomy';
import { DESCRIPTOR_VOCABULARY } from './descriptorVocabulary';
import { 
  normalizeGenre, 
  splitGenres, 
  getLastWord, 
  containsWholeWord, 
  getLongestMatch 
} from './genreNormalization';

/**
 * Classification result with confidence and coverage metrics
 */
export interface ClassificationResult {
  /** VACRS scores, or null if genre couldn't be classified */
  scores: VACRSScore | null;
  /** The matched genre key from taxonomy, or null */
  matchedGenre: string | null;
  /** How the match was made: 'exact', 'parent', 'keyword', 'unknown' */
  matchType: 'exact' | 'parent' | 'keyword' | 'unknown';
  /** Original input genre string */
  originalGenre: string;
}

/**
 * Weighted classification result for multiple genres
 */
export interface WeightedClassificationResult {
  /** Weighted VACRS scores */
  scores: VACRSScore;
  /** Coverage: proportion of weight that was successfully classified (0-1) */
  coverage: number;
  /** Individual classification results */
  classifications: ClassificationResult[];
  /** Total weight used */
  totalWeight: number;
}

/**
 * Get the full VACRS scores for a genre, including parent inheritance
 * 
 * @param genreKey - The genre key in the taxonomy
 * @returns Complete VACRS scores, or null if not found
 */
function getGenreScores(genreKey: string): VACRSScore | null {
  const entry = GENRE_TAXONOMY[genreKey];
  if (!entry) {
    return null;
  }
  
  // If entry has scores, return them
  if (entry.scores) {
    return { ...entry.scores };
  }
  
  // If entry has a parent, inherit from parent
  if (entry.parent) {
    return getGenreScores(entry.parent);
  }
  
  // No scores and no parent - shouldn't happen with valid taxonomy
  return null;
}

/**
 * Find a genre in the taxonomy by matching against aliases
 * 
 * @param normalizedGenre - Normalized genre string
 * @returns Matched genre key and entry, or null
 */
function findGenreInTaxonomy(normalizedGenre: string): { key: string; entry: GenreTaxonomyEntry } | null {
  // First pass: exact match on any alias
  for (const [key, entry] of Object.entries(GENRE_TAXONOMY)) {
    if (entry.aliases.some(alias => alias === normalizedGenre)) {
      return { key, entry };
    }
  }
  
  // Second pass: whole-word match, prefer longest
  const candidates: Array<{ key: string; entry: GenreTaxonomyEntry; alias: string }> = [];
  
  for (const [key, entry] of Object.entries(GENRE_TAXONOMY)) {
    for (const alias of entry.aliases) {
      if (containsWholeWord(normalizedGenre, alias)) {
        candidates.push({ key, entry, alias });
      }
    }
  }
  
  if (candidates.length === 0) {
    return null;
  }
  
  // Prefer the longest (most specific) match
  candidates.sort((a, b) => b.alias.length - a.alias.length);
  const best = candidates[0];
  return { key: best.key, entry: best.entry };
}

/**
 * Classify a single genre string
 * 
 * Matching strategy:
 * 1. Exact match on normalized genre
 * 2. Whole-word match, prefer longest
 * 3. Fallback to parent genre via keyword
 * 4. Fallback to last word (e.g., "uk drill" -> "drill")
 * 5. Return UNKNOWN if no match
 * 
 * @param genreString - The genre string to classify
 * @returns Classification result
 */
export function classifySingleGenre(genreString: string): ClassificationResult {
  const normalized = normalizeGenre(genreString);
  
  if (!normalized) {
    return {
      scores: null,
      matchedGenre: null,
      matchType: 'unknown',
      originalGenre: genreString
    };
  }
  
  // Try to find in taxonomy
  const match = findGenreInTaxonomy(normalized);
  
  if (match) {
    const scores = getGenreScores(match.key);
    return {
      scores,
      matchedGenre: match.key,
      matchType: 'exact',
      originalGenre: genreString
    };
  }
  
  // Fallback: try last word (e.g., "uk drill" -> "drill")
  const lastWord = getLastWord(normalized);
  if (lastWord && lastWord !== normalized) {
    const lastWordMatch = findGenreInTaxonomy(lastWord);
    if (lastWordMatch) {
      const scores = getGenreScores(lastWordMatch.key);
      return {
        scores,
        matchedGenre: lastWordMatch.key,
        matchType: 'keyword',
        originalGenre: genreString
      };
    }
  }
  
  // No match found
  return {
    scores: null,
    matchedGenre: null,
    matchType: 'unknown',
    originalGenre: genreString
  };
}

/**
 * Classify a genre string (may contain multiple genres)
 * This is the main classification function that replaces the old classifyGenre
 * 
 * @param genreString - The genre string (can be comma-separated, etc.)
 * @returns Weighted classification result
 */
export function classifyGenre(genreString: string): WeightedClassificationResult {
  const genres = splitGenres(genreString);
  
  if (genres.length === 0) {
    return {
      scores: { valence: 0.5, arousal: 0.5, complexity: 0.5, rawness: 0.5, socialPresence: 0.5 },
      coverage: 0,
      classifications: [],
      totalWeight: 0
    };
  }
  
  // Classify each genre with equal weight
  const classifications = genres.map(g => classifySingleGenre(g));
  
  // Calculate weighted average, excluding unknowns
  const classified = classifications.filter(c => c.scores !== null);
  
  if (classified.length === 0) {
    // All genres unknown
    return {
      scores: { valence: 0.5, arousal: 0.5, complexity: 0.5, rawness: 0.5, socialPresence: 0.5 },
      coverage: 0,
      classifications,
      totalWeight: genres.length
    };
  }
  
  // Calculate weighted average
  const weightedScores: VACRSScore = {
    valence: 0,
    arousal: 0,
    complexity: 0,
    rawness: 0,
    socialPresence: 0
  };
  
  for (const c of classified) {
    if (c.scores) {
      weightedScores.valence += c.scores.valence;
      weightedScores.arousal += c.scores.arousal;
      weightedScores.complexity += c.scores.complexity;
      weightedScores.rawness += c.scores.rawness;
      weightedScores.socialPresence += c.scores.socialPresence;
    }
  }
  
  const count = classified.length;
  weightedScores.valence /= count;
  weightedScores.arousal /= count;
  weightedScores.complexity /= count;
  weightedScores.rawness /= count;
  weightedScores.socialPresence /= count;
  
  // Calculate coverage
  const coverage = classified.length / genres.length;
  
  return {
    scores: weightedScores,
    coverage,
    classifications,
    totalWeight: genres.length
  };
}

/**
 * Calculate VACRS score for a single genre (backwards compatible)
 * This replaces the old calculateGenreVACRSScore
 * 
 * @param genreString - The genre string
 * @returns VACRS scores
 */
export function calculateGenreVACRSScore(genreString: string): VACRSScore {
  const result = classifyGenre(genreString);
  return result.scores;
}

/**
 * Score a descriptor/tag against the descriptor vocabulary
 * Used for scoring Last.fm tags and other textual descriptors
 * 
 * @param descriptor - The descriptor/tag to score
 * @returns VACRS scores, or null if not recognized
 */
export function scoreDescriptor(descriptor: string): VACRSScore | null {
  const normalized = descriptor.toLowerCase().trim();
  
  if (!normalized) {
    return null;
  }
  
  // Initialize score accumulators
  const scoreSums: VACRSScore = {
    valence: 0,
    arousal: 0,
    complexity: 0,
    rawness: 0,
    socialPresence: 0
  };
  
  const matchCounts = {
    valence: 0,
    arousal: 0,
    complexity: 0,
    rawness: 0,
    socialPresence: 0
  };
  
  // Check each dimension
  for (const dimension of Object.keys(DESCRIPTOR_VOCABULARY) as Array<keyof VACRSScore>) {
    const buckets = DESCRIPTOR_VOCABULARY[dimension];
    
    for (const bucket of buckets) {
      // Exact match on descriptor
      if (bucket.descriptors.includes(normalized)) {
        scoreSums[dimension] += bucket.score;
        matchCounts[dimension]++;
      }
    }
  }
  
  // If no matches, return null
  const totalMatches = Object.values(matchCounts).reduce((a, b) => a + b, 0);
  if (totalMatches === 0) {
    return null;
  }
  
  // Calculate average for each dimension
  const result: VACRSScore = {
    valence: matchCounts.valence > 0 ? scoreSums.valence / matchCounts.valence : 0.5,
    arousal: matchCounts.arousal > 0 ? scoreSums.arousal / matchCounts.arousal : 0.5,
    complexity: matchCounts.complexity > 0 ? scoreSums.complexity / matchCounts.complexity : 0.5,
    rawness: matchCounts.rawness > 0 ? scoreSums.rawness / matchCounts.rawness : 0.5,
    socialPresence: matchCounts.socialPresence > 0 ? scoreSums.socialPresence / matchCounts.socialPresence : 0.5
  };
  
  return result;
}

/**
 * Score multiple tags/descriptors with weights
 * 
 * @param tags - Array of tags with weights
 * @returns Weighted VACRS scores and coverage
 */
export function scoreWeightedTags(tags: Array<{ tag: string; weight: number }>): WeightedClassificationResult {
  if (tags.length === 0) {
    return {
      scores: { valence: 0.5, arousal: 0.5, complexity: 0.5, rawness: 0.5, socialPresence: 0.5 },
      coverage: 0,
      classifications: [],
      totalWeight: 0
    };
  }
  
  const classifications: ClassificationResult[] = [];
  let totalWeight = 0;
  let classifiedWeight = 0;
  
  const weightedScores: VACRSScore = {
    valence: 0,
    arousal: 0,
    complexity: 0,
    rawness: 0,
    socialPresence: 0
  };
  
  for (const { tag, weight } of tags) {
    totalWeight += weight;
    
    // Try genre classification first
    const genreResult = classifySingleGenre(tag);
    if (genreResult.scores) {
      classifications.push(genreResult);
      classifiedWeight += weight;
      weightedScores.valence += genreResult.scores.valence * weight;
      weightedScores.arousal += genreResult.scores.arousal * weight;
      weightedScores.complexity += genreResult.scores.complexity * weight;
      weightedScores.rawness += genreResult.scores.rawness * weight;
      weightedScores.socialPresence += genreResult.scores.socialPresence * weight;
      continue;
    }
    
    // Try descriptor scoring
    const descriptorScores = scoreDescriptor(tag);
    if (descriptorScores) {
      classifications.push({
        scores: descriptorScores,
        matchedGenre: null,
        matchType: 'exact',
        originalGenre: tag
      });
      classifiedWeight += weight;
      weightedScores.valence += descriptorScores.valence * weight;
      weightedScores.arousal += descriptorScores.arousal * weight;
      weightedScores.complexity += descriptorScores.complexity * weight;
      weightedScores.rawness += descriptorScores.rawness * weight;
      weightedScores.socialPresence += descriptorScores.socialPresence * weight;
      continue;
    }
    
    // Unknown tag
    classifications.push({
      scores: null,
      matchedGenre: null,
      matchType: 'unknown',
      originalGenre: tag
    });
  }
  
  // Normalize by classified weight
  if (classifiedWeight > 0) {
    weightedScores.valence /= classifiedWeight;
    weightedScores.arousal /= classifiedWeight;
    weightedScores.complexity /= classifiedWeight;
    weightedScores.rawness /= classifiedWeight;
    weightedScores.socialPresence /= classifiedWeight;
  } else {
    // All unknown, use neutral
    weightedScores.valence = 0.5;
    weightedScores.arousal = 0.5;
    weightedScores.complexity = 0.5;
    weightedScores.rawness = 0.5;
    weightedScores.socialPresence = 0.5;
  }
  
  return {
    scores: weightedScores,
    coverage: totalWeight > 0 ? classifiedWeight / totalWeight : 0,
    classifications,
    totalWeight
  };
}
