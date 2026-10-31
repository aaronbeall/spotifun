/**
 * Descriptor Vocabulary for Mood and Tag Scoring
 * 
 * This vocabulary maps mood descriptors (adjectives, tags) to VACRS scores.
 * Used for scoring Last.fm tags and other textual mood descriptors.
 * 
 * Separate from genre taxonomy to allow scoring non-genre tags like
 * "melancholic", "energetic", "complex", etc.
 */

import { VACRSScore } from '@/types';

export interface DescriptorBucket {
  /** The VACRS score for this bucket */
  score: number;
  /** Descriptors (adjectives, moods, tags) that fit this bucket */
  descriptors: string[];
}

export type DimensionDescriptors = Record<keyof VACRSScore, DescriptorBucket[]>;

/**
 * Descriptor vocabulary organized by VACRS dimension
 * Each dimension has multiple buckets with scores and associated descriptors
 */
export const DESCRIPTOR_VOCABULARY: DimensionDescriptors = {
  // Valence: emotional tone (0 = sad/negative, 1 = happy/positive)
  valence: [
    {
      score: 0.1,
      descriptors: [
        'despairing', 'bleak', 'harrowing', 'tortured', 'angst-ridden', 'nihilistic',
        'funereal', 'mournful', 'desolate', 'abyssal', 'chilling', 'unsettling', 'sinister',
        'dark', 'gloomy', 'depressing', 'somber', 'grave', 'tragic'
      ]
    },
    {
      score: 0.3,
      descriptors: [
        'melancholic', 'wistful', 'nostalgic', 'brooding', 'pensive', 'yearning',
        'haunting', 'atmospheric', 'ethereal', 'dreamy', 'introspective', 'contemplative',
        'sad', 'sorrowful', 'moody', 'blue', 'downbeat'
      ]
    },
    {
      score: 0.5,
      descriptors: [
        'balanced', 'neutral', 'reflective', 'thoughtful', 'mellow', 'smooth',
        'soothing', 'hypnotic', 'textured', 'layered', 'evocative', 'ambient',
        'calm', 'peaceful', 'serene', 'tranquil'
      ]
    },
    {
      score: 0.7,
      descriptors: [
        'upbeat', 'warm', 'positive', 'chill', 'groovy', 'smooth', 'lively',
        'vibrant', 'sunny', 'carefree', 'playful', 'sensual', 'romantic',
        'happy', 'content', 'pleased', 'cheerful', 'bright'
      ]
    },
    {
      score: 0.9,
      descriptors: [
        'euphoric', 'joyful', 'cheerful', 'upbeat', 'happy', 'ecstatic', 'exuberant',
        'energetic', 'vibrant', 'playful', 'whimsical', 'kawaii', 'sparkling', 'radiant',
        'jubilant', 'elated', 'blissful', 'delighted', 'gleeful'
      ]
    }
  ],

  // Arousal: energy level (0 = calm, 1 = energetic)
  arousal: [
    {
      score: 0.1,
      descriptors: [
        'calm', 'soothing', 'meditative', 'peaceful', 'tranquil', 'serene', 'still',
        'floating', 'ethereal', 'hypnotic', 'minimal', 'sparse', 'expansive',
        'sleepy', 'drowsy', 'lethargic', 'quiet', 'hushed', 'silent'
      ]
    },
    {
      score: 0.3,
      descriptors: [
        'relaxed', 'laid-back', 'gentle', 'smooth', 'mellow', 'leisurely', 'unhurried',
        'easygoing', 'comfortable', 'cozy', 'intimate', 'warm', 'inviting',
        'soft', 'tender', 'subdued', 'low-key'
      ]
    },
    {
      score: 0.5,
      descriptors: [
        'moderate', 'steady', 'balanced', 'groovy', 'rhythmic', 'engaging', 'involving',
        'accessible', 'approachable', 'familiar', 'comfortable', 'reassuring',
        'neutral', 'even', 'stable'
      ]
    },
    {
      score: 0.7,
      descriptors: [
        'energetic', 'lively', 'upbeat', 'vibrant', 'dynamic', 'pulsing', 'driving',
        'rhythmic', 'danceable', 'groovy', 'funky', 'soulful', 'infectious',
        'active', 'animated', 'spirited', 'bouncy'
      ]
    },
    {
      score: 0.9,
      descriptors: [
        'intense', 'frantic', 'explosive', 'hyper', 'ferocious', 'relentless', 'driving',
        'pounding', 'pulsing', 'energetic', 'adrenaline-fueled', 'high-octane', 'frenetic',
        'wild', 'crazy', 'manic', 'chaotic', 'aggressive', 'powerful', 'fierce'
      ]
    }
  ],

  // Complexity: musical complexity (0 = simple, 1 = complex)
  complexity: [
    {
      score: 0.1,
      descriptors: [
        'minimal', 'repetitive', 'sparse', 'simple', 'stripped-down', 'bare',
        'unadorned', 'elemental', 'essential', 'fundamental', 'basic',
        'plain', 'straightforward', 'uncomplicated'
      ]
    },
    {
      score: 0.3,
      descriptors: [
        'simple', 'catchy', 'accessible', 'direct', 'immediate', 'hooky', 'memorable',
        'earworm', 'singable', 'danceable', 'groovy', 'rhythmic', 'pulsing',
        'easy', 'effortless', 'flowing'
      ]
    },
    {
      score: 0.5,
      descriptors: [
        'balanced', 'traditional', 'standard', 'familiar', 'accessible', 'engaging',
        'well-crafted', 'well-structured', 'cohesive', 'harmonious', 'melodic', 'rhythmic',
        'moderate', 'conventional'
      ]
    },
    {
      score: 0.7,
      descriptors: [
        'complex', 'intricate', 'detailed', 'sophisticated', 'nuanced', 'layered',
        'textured', 'orchestrated', 'arranged', 'composed', 'structured', 'developed',
        'technical', 'elaborate', 'ornate'
      ]
    },
    {
      score: 0.9,
      descriptors: [
        'dense', 'challenging', 'experimental', 'avant-garde', 'unconventional',
        'unorthodox', 'unpredictable', 'unsettling', 'disorienting', 'fragmented',
        'abstract', 'conceptual', 'theoretical', 'intellectual', 'academic',
        'cerebral', 'esoteric', 'abstruse'
      ]
    }
  ],

  // Rawness: production quality (0 = polished, 1 = raw/lo-fi)
  rawness: [
    {
      score: 0.1,
      descriptors: [
        'polished', 'clean', 'shiny', 'pristine', 'sleek', 'smooth', 'glossy', 'slick',
        'refined', 'processed', 'compressed', 'loud', 'bright', 'crisp', 'clear',
        'professional', 'studio', 'hi-fi', 'high-fidelity'
      ]
    },
    {
      score: 0.3,
      descriptors: [
        'slick', 'produced', 'refined', 'professional', 'commercial', 'radio-friendly',
        'accessible', 'mainstream', 'polished', 'smooth', 'shiny', 'bright', 'clear',
        'well-produced', 'studio-quality'
      ]
    },
    {
      score: 0.5,
      descriptors: [
        'balanced', 'natural', 'organic', 'warm', 'analog', 'vintage', 'retro', 'classic',
        'timeless', 'authentic', 'genuine', 'honest', 'sincere', 'heartfelt', 'emotional',
        'live', 'real'
      ]
    },
    {
      score: 0.7,
      descriptors: [
        'raw', 'gritty', 'unpolished', 'rough', 'edgy', 'aggressive', 'intense', 'angry',
        'rebellious', 'defiant', 'confrontational', 'challenging', 'uncompromising', 'honest',
        'dirty', 'fuzzy', 'distorted', 'overdriven'
      ]
    },
    {
      score: 0.9,
      descriptors: [
        'harsh', 'lo-fi', 'unrefined', 'rough', 'primitive', 'primal', 'tribal', 'ritualistic',
        'elemental', 'visceral', 'physical', 'bodily', 'carnal', 'animalistic',
        'noisy', 'abrasive', 'caustic', 'brutal', 'savage'
      ]
    }
  ],

  // Social Presence: context (0 = solitary, 1 = communal)
  socialPresence: [
    {
      score: 0.1,
      descriptors: [
        'solitary', 'introspective', 'personal', 'private', 'intimate', 'meditative',
        'contemplative', 'reflective', 'thoughtful', 'pensive', 'dreamy', 'ethereal',
        'lonely', 'isolated', 'withdrawn', 'reclusive'
      ]
    },
    {
      score: 0.3,
      descriptors: [
        'intimate', 'personal', 'reflective', 'confessional', 'honest', 'sincere',
        'heartfelt', 'emotional', 'vulnerable', 'raw', 'unfiltered', 'unvarnished',
        'quiet', 'subdued', 'understated'
      ]
    },
    {
      score: 0.5,
      descriptors: [
        'balanced', 'versatile', 'adaptable', 'flexible', 'all-purpose', 'all-around',
        'well-rounded', 'well-balanced', 'even-handed', 'fair', 'impartial', 'neutral',
        'moderate', 'middling'
      ]
    },
    {
      score: 0.7,
      descriptors: [
        'social', 'engaging', 'relatable', 'friendly', 'approachable', 'accessible',
        'inclusive', 'welcoming', 'inviting', 'warm', 'hospitable', 'gracious',
        'party', 'fun', 'entertaining', 'uplifting'
      ]
    },
    {
      score: 0.9,
      descriptors: [
        'communal', 'festive', 'celebratory', 'joyous', 'jubilant', 'exuberant',
        'ecstatic', 'euphoric', 'rapturous', 'elated', 'gleeful', 'jovial',
        'party', 'club', 'rave', 'festival', 'crowd', 'anthem'
      ]
    }
  ]
};

/**
 * Get a flattened list of all descriptors for quick lookup
 */
export function getAllDescriptors(): Set<string> {
  const descriptors = new Set<string>();
  
  for (const dimension of Object.values(DESCRIPTOR_VOCABULARY)) {
    for (const bucket of dimension) {
      for (const descriptor of bucket.descriptors) {
        descriptors.add(descriptor);
      }
    }
  }
  
  return descriptors;
}

/**
 * Check if a string is a known descriptor
 */
export function isDescriptor(term: string): boolean {
  const normalized = term.toLowerCase().trim();
  const allDescriptors = getAllDescriptors();
  return allDescriptors.has(normalized);
}
