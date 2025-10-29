import { Music, Flame, Moon, Sun, Heart, Star, Wind, Droplets, Sparkles } from 'lucide-react';
import { GenreStats, MusicVibe, VACRSScore } from '@/types';
import { calculateWeightedVACRSScore, calculateVACRSScoreMatch } from './musicClassification';
import { MUSIC_VIBES } from "@/utils/musicVibes";

export interface VibeMatch {
  vibe: MusicVibe;
  score: VACRSScore;
  matchPercentage: number;
}

/**
 * Finds the closest matching music vibe based on genre statistics
 * @param genreStats - Array of genre statistics with play counts
 * @returns The best matching music vibe with additional info
 */
export function findBestMatchingVibe(genreStats: GenreStats[]): VibeMatch {
  // Calculate the weighted VACRS score for the provided genres
  const userScore = calculateWeightedVACRSScore(genreStats);

  // Find the best matching vibe
  let bestMatch: MusicVibe | null = null;
  let bestMatchPercentage = -1;

  for (const vibe of MUSIC_VIBES) {
    const matchPercentage = calculateVACRSScoreMatch(userScore, vibe.targetScore);
    if (matchPercentage > bestMatchPercentage) {
      bestMatchPercentage = matchPercentage;
      bestMatch = vibe;
    }
  }

  if (!bestMatch) {
    // Fallback to the first vibe if no match found (shouldn't happen)
    bestMatch = MUSIC_VIBES[0];
    bestMatchPercentage = calculateVACRSScoreMatch(userScore, MUSIC_VIBES[0].targetScore);
  }

  return {
    vibe: bestMatch,
    score: userScore,
    matchPercentage: Math.round(bestMatchPercentage * 10) / 10, // Round to 1 decimal place
  };
}

/**
 * Gets all available music vibes
 * @returns Array of all defined music vibes
 */
export function getAllMusicVibes(): MusicVibe[] {
  return [...MUSIC_VIBES];
}
