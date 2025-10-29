// Music Classification System based on VACRS model
// (Valence, Arousal, Complexity, Rawness, Social Presence)

import { GenreStats } from '@/types';

export interface VACRSScore {
  valence: number;      // 0 (unpleasant) to 1 (pleasant)
  arousal: number;      // 0 (calm) to 1 (energetic)
  complexity: number;   // 0 (simple) to 1 (complex)
  rawness: number;      // 0 (polished) to 1 (raw)
  socialPresence: number; // 0 (solitary) to 1 (communal)
}

interface GenreProfile extends VACRSScore {
  aliases: string[];
  description: string;
}

// Core genre profiles mapped to VACRS dimensions
const GENRE_PROFILES: Record<string, GenreProfile> = {
  // Pop
  pop: {
    valence: 0.8,
    arousal: 0.7,
    complexity: 0.3,
    rawness: 0.2,
    socialPresence: 0.8,
    aliases: ['pop'],
    description: 'Catchy, mainstream music with broad appeal'
  },

  // Rock
  rock: {
    valence: 0.6,
    arousal: 0.8,
    complexity: 0.5,
    rawness: 0.6,
    socialPresence: 0.7,
    aliases: ['rock', 'rock and roll'],
    description: 'Guitar-driven music with a strong backbeat'
  },

  // Classical
  classical: {
    valence: 0.6,
    arousal: 0.4,
    complexity: 0.9,
    rawness: 0.1,
    socialPresence: 0.2,
    aliases: ['classical', 'orchestral', 'symphonic'],
    description: 'Complex, orchestral compositions'
  },

  // Jazz
  jazz: {
    valence: 0.7,
    arousal: 0.5,
    complexity: 0.8,
    rawness: 0.3,
    socialPresence: 0.4,
    aliases: ['jazz', 'bebop', 'swing', 'fusion'],
    description: 'Improvisational music with complex harmonies'
  },

  // Electronic/Dance
  electronic: {
    valence: 0.8,
    arousal: 0.9,
    complexity: 0.4,
    rawness: 0.5,
    socialPresence: 0.9,
    aliases: ['edm', 'electronic', 'dance', 'house', 'techno', 'trance'],
    description: 'Synthesized music designed for dancing'
  },

  // Hip-Hop/Rap
  hiphop: {
    valence: 0.6,
    arousal: 0.7,
    complexity: 0.6,
    rawness: 0.7,
    socialPresence: 0.8,
    aliases: ['hip hop', 'rap', 'trap', 'drill'],
    description: 'Rhythmic vocal style over beats'
  },

  // Metal
  metal: {
    valence: 0.3,
    arousal: 0.9,
    complexity: 0.7,
    rawness: 0.9,
    socialPresence: 0.6,
    aliases: ['metal', 'heavy metal', 'death metal', 'black metal', 'metalcore'],
    description: 'Heavy, amplified music with aggressive vocals'
  },

  // Punk
  punk: {
    valence: 0.4,
    arousal: 0.9,
    complexity: 0.2,
    rawness: 1.0,
    socialPresence: 0.8,
    aliases: ['punk', 'hardcore', 'pop punk'],
    description: 'Raw, energetic music with a rebellious attitude'
  },

  // Ambient
  ambient: {
    valence: 0.7,
    arousal: 0.1,
    complexity: 0.3,
    rawness: 0.3,
    socialPresence: 0.1,
    aliases: ['ambient', 'drone', 'atmospheric'],
    description: 'Atmospheric, background music'
  },

  // Folk
  folk: {
    valence: 0.7,
    arousal: 0.3,
    complexity: 0.4,
    rawness: 0.6,
    socialPresence: 0.5,
    aliases: ['folk', 'acoustic', 'singer-songwriter'],
    description: 'Traditional and contemporary acoustic music'
  },

  // R&B/Soul
  rnb: {
    valence: 0.7,
    arousal: 0.6,
    complexity: 0.5,
    rawness: 0.3,
    socialPresence: 0.6,
    aliases: ['r&b', 'soul', 'neo soul'],
    description: 'Rhythmic music with soulful vocals'
  },

  // Country
  country: {
    valence: 0.7,
    arousal: 0.5,
    complexity: 0.3,
    rawness: 0.4,
    socialPresence: 0.7,
    aliases: ['country', 'bluegrass', 'americana'],
    description: 'Music rooted in rural American traditions'
  },

  // Blues
  blues: {
    valence: 0.4,
    arousal: 0.5,
    complexity: 0.5,
    rawness: 0.7,
    socialPresence: 0.5,
    aliases: ['blues', 'delta blues', 'chicago blues'],
    description: 'Expressive music often about hardship'
  },

  // Reggae
  reggae: {
    valence: 0.8,
    arousal: 0.6,
    complexity: 0.4,
    rawness: 0.5,
    socialPresence: 0.8,
    aliases: ['reggae', 'dub', 'dancehall'],
    description: 'Jamaican music with a distinctive rhythm'
  },

  // Experimental
  experimental: {
    valence: 0.4,
    arousal: 0.5,
    complexity: 0.9,
    rawness: 0.7,
    socialPresence: 0.2,
    aliases: ['experimental', 'avant-garde', 'noise'],
    description: 'Innovative, boundary-pushing music'
  },

  // Indie
  indie: {
    valence: 0.6,
    arousal: 0.6,
    complexity: 0.6,
    rawness: 0.6,
    socialPresence: 0.5,
    aliases: ['indie', 'alternative', 'indie rock', 'indie pop'],
    description: 'Independent music outside the mainstream'
  }
};

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
      const score = classifyGenre(stat.genre);
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
    const score = classifyGenre(stat.genre);

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