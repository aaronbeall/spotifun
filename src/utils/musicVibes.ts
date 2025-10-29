import { Music, Flame, Moon, Sun, Heart, Star, Wind, Droplets, Sparkles } from 'lucide-react';
import { GenreStats } from '@/types';
import { VACRSScore, calculateWeightedVACRSScore, calculateVACRSScoreDistance } from './musicClassification';

export interface MusicVibe {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: {
    light: string;
    dark: string;
  };
  targetScore: VACRSScore;
}

// Define various music vibes with their target VACRS scores
const MUSIC_VIBES: MusicVibe[] = [
  {
    id: 'chill-vibes',
    name: 'Serene Echoes',
    description: 'Relaxed, mellow tunes perfect for unwinding',
    icon: Moon, // Moon icon is correct in lucide-react
    color: {
      light: '#93c5fd',
      dark: '#1e40af',
    },
    targetScore: {
      valence: 0.7,
      arousal: 0.3,
      complexity: 0.4,
      rawness: 0.3,
      socialPresence: 0.3,
    },
  },
  {
    id: 'summer',
    name: 'Golden Hour',
    description: 'Feel-good, sunny tracks for those warm summer days',
    icon: Sun,
    color: {
      light: '#fde68a',
      dark: '#92400e',
    },
    targetScore: {
      valence: 0.9,
      arousal: 0.8,
      complexity: 0.4,
      rawness: 0.3,
      socialPresence: 0.7,
    },
  },
  {
    id: 'indie-dream',
    name: 'Ethereal Reverie',
    description: 'Dreamy, atmospheric indie sounds',
    icon: Star,
    color: {
      light: '#c4b5fd',
      dark: '#5b21b6',
    },
    targetScore: {
      valence: 0.6,
      arousal: 0.5,
      complexity: 0.6,
      rawness: 0.4,
      socialPresence: 0.5,
    },
  },
  {
    id: 'raw-energy',
    name: 'Primal Surge',
    description: 'Powerful, unfiltered musical intensity',
    icon: Wind,
    color: {
      light: '#fca5a5',
      dark: '#7f1d1d',
    },
    targetScore: {
      valence: 0.5,
      arousal: 0.9,
      complexity: 0.7,
      rawness: 0.9,
      socialPresence: 0.7,
    },
  },
  {
    id: 'soothing-waters',
    name: 'Tranquil Tides',
    description: 'Calming, fluid melodies to wash over you',
    icon: Droplets,
    color: {
      light: '#bae6fd',
      dark: '#075985',
    },
    targetScore: {
      valence: 0.7,
      arousal: 0.2,
      complexity: 0.4,
      rawness: 0.2,
      socialPresence: 0.2,
    },
  },
  {
    id: 'cosmic-exploration',
    name: 'Celestial Drift',
    description: 'Ethereal and experimental soundscapes',
    icon: Sparkles,
    color: {
      light: '#c7d2fe',
      dark: '#4c1d95',
    },
    targetScore: {
      valence: 0.5,
      arousal: 0.6,
      complexity: 0.8,
      rawness: 0.5,
      socialPresence: 0.3,
    },
  },
];

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
