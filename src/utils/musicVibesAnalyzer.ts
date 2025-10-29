import { Music, Flame, Moon, Sun, Heart, Star, Wind, Droplets, Sparkles } from 'lucide-react';
import { GenreStats, MusicVibe, VACRSScore } from '@/types';
import { calculateWeightedVACRSScore, calculateVACRSScoreDistance } from './musicClassification';
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

  // Find the closest matching vibe
  let bestMatch: MusicVibe | null = null;
  let smallestDistance = Infinity;

  for (const vibe of MUSIC_VIBES) {
    const distance = calculateVACRSScoreDistance(userScore, vibe.targetScore);
    if (distance < smallestDistance) {
      smallestDistance = distance;
      bestMatch = vibe;
    }
  }

  if (!bestMatch) {
    // Fallback to the first vibe if no match found (shouldn't happen)
    bestMatch = MUSIC_VIBES[0];
    smallestDistance = 1;
  }

  // Calculate match percentage (0-100%)
  // The maximum possible distance in 5D space with values 0-1 is sqrt(5) ~= 2.236
  const maxPossibleDistance = Math.sqrt(5);
  const matchPercentage = Math.max(0, 100 * (1 - (smallestDistance / maxPossibleDistance)));

  return {
    vibe: bestMatch,
    score: userScore,
    matchPercentage: Math.round(matchPercentage * 10) / 10, // Round to 1 decimal place
  };
}

/**
 * Gets all available music vibes
 * @returns Array of all defined music vibes
 */
export function getAllMusicVibes(): MusicVibe[] {
  return [...MUSIC_VIBES];
}
