// Music Classification System based on VACRS model
// (Valence, Arousal, Complexity, Rawness, Social Presence)

import { GenreStats, VACRSScore, GenreProfile } from '@/types';
import { GENRE_PROFILES } from "@/utils/genreProfiles";
import { GENRE_SCORES } from "./genreScores";

/**
 * Classifies a genre string into VACRS dimensions
 * @param genreString - The genre string to classify (can be comma-separated)
 * @returns A VACRSScore object with normalized values between 0 and 1
 */
export function classifyGenre(genreString: string): VACRSScore {
  const inputGenres = genreString.toLowerCase().split(/[,\/&]|\s+and\s+/).map(g => g.trim());
  const matches: GenreProfile[] = [];

  // Find all matching genre profiles
  inputGenres.forEach(genre => {
    if (!genre) return;

    for (const [key, profile] of Object.entries(GENRE_PROFILES)) {
      if (profile.aliases.some(alias => genre.includes(alias))) {
        matches.push(profile);
      }
    }
  });

  // If no matches found, return a neutral score
  if (matches.length === 0) {
    return {
      valence: 0.5,
      arousal: 0.5,
      complexity: 0.5,
      rawness: 0.5,
      socialPresence: 0.5
    };
  }

  // Calculate weighted average of all matches
  const result: VACRSScore = {
    valence: 0,
    arousal: 0,
    complexity: 0,
    rawness: 0,
    socialPresence: 0
  };

  const totalWeight = matches.length;

  for (const match of matches) {
    result.valence += match.valence;
    result.arousal += match.arousal;
    result.complexity += match.complexity;
    result.rawness += match.rawness;
    result.socialPresence += match.socialPresence;
  }

  // Normalize the results
  result.valence = Math.min(1, Math.max(0, result.valence / totalWeight));
  result.arousal = Math.min(1, Math.max(0, result.arousal / totalWeight));
  result.complexity = Math.min(1, Math.max(0, result.complexity / totalWeight));
  result.rawness = Math.min(1, Math.max(0, result.rawness / totalWeight));
  result.socialPresence = Math.min(1, Math.max(0, result.socialPresence / totalWeight));

  return result;
}

/**
 * Classifies a genre string into VACRS dimensions using the expanded genre scores
 * @param genreString - The genre string to classify (single genre, will be normalized)
 * @returns A VACRSScore object with normalized values between 0 and 1
 */
export function calculateGenreVACRSScore(genreString: string): VACRSScore {
  // Default score if no match is found
  const defaultScore: VACRSScore = {
    valence: 0.5,
    arousal: 0.5,
    complexity: 0.5,
    rawness: 0.5,
    socialPresence: 0.5
  };

  if (!genreString?.trim()) {
    return defaultScore;
  }

  // Normalize the input genre
  const genre = genreString.trim().toLowerCase();

  // Initialize score accumulators and match counters
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

  // Check each VACRS dimension
  for (const dimension of Object.keys(GENRE_SCORES) as Array<keyof VACRSScore>) {
    const buckets = GENRE_SCORES[dimension];

    // Check each bucket in this dimension
    for (const bucket of buckets) {
      if (bucket.genres.some(g => genre.includes(g))) {
        scoreSums[dimension] += bucket.score;
        matchCounts[dimension]++;
      }
    }
  }

  // Calculate final scores, using default for dimensions with no matches
  return {
    valence: matchCounts.valence > 0 ? scoreSums.valence / matchCounts.valence : defaultScore.valence,
    arousal: matchCounts.arousal > 0 ? scoreSums.arousal / matchCounts.arousal : defaultScore.arousal,
    complexity: matchCounts.complexity > 0 ? scoreSums.complexity / matchCounts.complexity : defaultScore.complexity,
    rawness: matchCounts.rawness > 0 ? scoreSums.rawness / matchCounts.rawness : defaultScore.rawness,
    socialPresence: matchCounts.socialPresence > 0 ? scoreSums.socialPresence / matchCounts.socialPresence : defaultScore.socialPresence
  };
}

/**
 * Gets a description for a VACRS score
 * @param score - The VACRS score to describe
 * @returns A human-readable description of the music's characteristics
 */
export function describeVACRSScore(score: VACRSScore): string {
  const descriptions: string[] = [];

  // Valence description
  if (score.valence > 0.7) descriptions.push("very positive");
  else if (score.valence > 0.4) descriptions.push("moderately positive");
  else if (score.valence > 0.2) descriptions.push("slightly negative");
  else descriptions.push("very negative");

  // Arousal description
  if (score.arousal > 0.7) descriptions.push("high energy");
  else if (score.arousal > 0.4) descriptions.push("moderate energy");
  else descriptions.push("low energy");

  // Complexity description
  if (score.complexity > 0.7) descriptions.push("complex");
  else if (score.complexity > 0.4) descriptions.push("moderately complex");
  else descriptions.push("simple");

  // Rawness description
  if (score.rawness > 0.7) descriptions.push("raw");
  else if (score.rawness > 0.4) descriptions.push("moderately raw");
  else descriptions.push("polished");

  // Social presence description
  if (score.socialPresence > 0.7) descriptions.push("highly social");
  else if (score.socialPresence > 0.4) descriptions.push("moderately social");
  else descriptions.push("more solitary");

  return descriptions.join(", ");
}

/**
 * Calculates a weighted VACRSScore based on a list of GenreStats
 * @param genreStats - Array of genre statistics with play counts
 * @returns A VACRSScore that is the weighted average of all genres based on play counts
 */
export function calculateWeightedVACRSScore(genreStats: GenreStats[]): VACRSScore {
  if (!genreStats || genreStats.length === 0) {
    // Return a neutral score if no genres are provided
    return {
      valence: 0.5,
      arousal: 0.5,
      complexity: 0.5,
      rawness: 0.5,
      socialPresence: 0.5
    };
  }

  let totalWeight = 0;
  const weightedScores = {
    valence: 0,
    arousal: 0,
    complexity: 0,
    rawness: 0,
    socialPresence: 0
  };

  // Calculate total weight (sum of all play counts)
  for (const stat of genreStats) {
    totalWeight += stat.playCount;
  }

  // If no play counts, give equal weight to all genres
  if (totalWeight === 0) {
    for (const stat of genreStats) {
      const score = calculateGenreVACRSScore(stat.genre);
      weightedScores.valence += score.valence;
      weightedScores.arousal += score.arousal;
      weightedScores.complexity += score.complexity;
      weightedScores.rawness += score.rawness;
      weightedScores.socialPresence += score.socialPresence;
    }

    const count = genreStats.length;
    return {
      valence: weightedScores.valence / count,
      arousal: weightedScores.arousal / count,
      complexity: weightedScores.complexity / count,
      rawness: weightedScores.rawness / count,
      socialPresence: weightedScores.socialPresence / count
    };
  }

  // Calculate weighted scores
  for (const stat of genreStats) {
    const weight = stat.playCount / totalWeight;
    const score = calculateGenreVACRSScore(stat.genre);

    weightedScores.valence += score.valence * weight;
    weightedScores.arousal += score.arousal * weight;
    weightedScores.complexity += score.complexity * weight;
    weightedScores.rawness += score.rawness * weight;
    weightedScores.socialPresence += score.socialPresence * weight;
  }

  return {
    valence: Math.min(1, Math.max(0, weightedScores.valence)),
    arousal: Math.min(1, Math.max(0, weightedScores.arousal)),
    complexity: Math.min(1, Math.max(0, weightedScores.complexity)),
    rawness: Math.min(1, Math.max(0, weightedScores.rawness)),
    socialPresence: Math.min(1, Math.max(0, weightedScores.socialPresence))
  };
}

/**
 * Calculates the Euclidean distance between two VACRS scores
 * Lower distance means more similar vibes
 */
export function calculateVACRSScoreDistance(score1: VACRSScore, score2: VACRSScore): number {
  const v = Math.pow(score1.valence - score2.valence, 2);
  const a = Math.pow(score1.arousal - score2.arousal, 2);
  const c = Math.pow(score1.complexity - score2.complexity, 2);
  const r = Math.pow(score1.rawness - score2.rawness, 2);
  const s = Math.pow(score1.socialPresence - score2.socialPresence, 2);

  return Math.sqrt(v + a + c + r + s);
}

/**
 * Calculates a match percentage (0-100) between two VACRS scores
 * @param score1 - First VACRS score
 * @param score2 - Second VACRS score to compare against
 * @returns A match percentage between 0 and 100, where higher is a better match
 */
export function calculateVACRSScoreMatch(score1: VACRSScore, score2: VACRSScore): number {
  const distance = calculateVACRSScoreDistance(score1, score2);
  // The maximum possible distance in 5D space with values 0-1 is sqrt(5) ~= 2.236
  const maxPossibleDistance = Math.sqrt(5);
  // Convert to percentage (0-100) where 0 distance = 100% match
  return Math.max(0, 100 * (1 - (distance / maxPossibleDistance)));
}