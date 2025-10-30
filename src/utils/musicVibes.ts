import { Music, Flame, Moon, Sun, Heart, Star, Wind, Droplets, Sparkles } from 'lucide-react';
import { MusicVibe} from '@/types';


// Define various music vibes with their target VACRS scores
export const MUSIC_VIBES: MusicVibe[] = [
  {
    id: 'tranquility',
    name: 'Tranquil Serenity',
    description: 'A peaceful state of calm and inner stillness',
    icon: Moon,
    color: {
      light: '#93c5fd',
      dark: '#1e40af',
    },
    targetScore: {
      valence: 0.7,
      arousal: 0.2,
      complexity: 0.3,
      rawness: 0.2,
      socialPresence: 0.2,
    },
  },
  {
    id: 'euphoria',
    name: 'Pure Euphoria',
    description: 'Overflowing with joy and elation',
    icon: Sun,
    color: {
      light: '#fde68a',
      dark: '#92400e',
    },
    targetScore: {
      valence: 0.95,
      arousal: 0.8,
      complexity: 0.4,
      rawness: 0.3,
      socialPresence: 0.7,
    },
  },
  {
    id: 'melancholy',
    name: 'Melancholic Reflection',
    description: 'A bittersweet embrace of deep emotions',
    icon: Droplets,
    color: {
      light: '#a5b4fc',
      dark: '#3730a3',
    },
    targetScore: {
      valence: 0.3,
      arousal: 0.4,
      complexity: 0.6,
      rawness: 0.5,
      socialPresence: 0.3,
    },
  },
  {
    id: 'intensity',
    name: 'Raw Intensity',
    description: 'Unfiltered emotional power and passion',
    icon: Flame,
    color: {
      light: '#fca5a5',
      dark: '#7f1d1d',
    },
    targetScore: {
      valence: 0.5,
      arousal: 0.9,
      complexity: 0.7,
      rawness: 0.95,
      socialPresence: 0.6,
    },
  },
  {
    id: 'wonder',
    name: 'Childlike Wonder',
    description: 'A sense of awe and innocent curiosity',
    icon: Sparkles,
    color: {
      light: '#86efac', // green-300
      dark: '#166534',  // green-800
    },
    targetScore: {
      valence: 0.8,
      arousal: 0.6,
      complexity: 0.7,
      rawness: 0.4,
      socialPresence: 0.3,
    },
  },
  {
    id: 'vulnerability',
    name: 'Naked Vulnerability',
    description: 'Stripped-down emotional honesty and exposure',
    icon: Heart,
    color: {
      light: '#fecdd3',
      dark: '#9f1239',
    },
    targetScore: {
      valence: 0.4,
      arousal: 0.3,
      complexity: 0.3,
      rawness: 0.9,
      socialPresence: 0.1,
    },
  },
  {
    id: 'nostalgia',
    name: 'Wistful Nostalgia',
    description: 'Bittersweet longing for the past',
    icon: Star,
    color: {
      light: '#d8b4fe',
      dark: '#6b21a8',
    },
    targetScore: {
      valence: 0.5,
      arousal: 0.4,
      complexity: 0.5,
      rawness: 0.3,
      socialPresence: 0.2,
    },
  },
  {
    id: 'triumph',
    name: 'Triumphant Resolve',
    description: 'Empowered determination and victory',
    icon: Flame,
    color: {
      light: '#fdba74',
      dark: '#9a3412',
    },
    targetScore: {
      valence: 0.8,
      arousal: 0.9,
      complexity: 0.6,
      rawness: 0.7,
      socialPresence: 0.8,
    },
  },
  {
    id: 'solitude',
    name: 'Peaceful Solitude',
    description: 'Comfortable aloneness and self-reflection',
    icon: Moon,
    color: {
      light: '#bbf7d0', // green-200
      dark: '#065f46',  // green-900
    },
    targetScore: {
      valence: 0.6,
      arousal: 0.2,
      complexity: 0.5,
      rawness: 0.3,
      socialPresence: 0.1,
    },
  },
  {
    id: 'ecstasy',
    name: 'Ecstatic Release',
    description: 'Overwhelming joy and liberation',
    icon: Sparkles,
    color: {
      light: '#f0abfc',
      dark: '#86198f',
    },
    targetScore: {
      valence: 0.95,
      arousal: 0.9,
      complexity: 0.7,
      rawness: 0.5,
      socialPresence: 0.8,
    },
  },
  {
    id: 'mystical-reverie',
    name: 'Mystical Reverie',
    description: 'Dreamy, otherworldly, and ethereal atmosphere',
    icon: Sparkles,
    color: {
      light: '#c084fc',
      dark: '#6b21a8',
    },
    targetScore: {
      valence: 0.6,
      arousal: 0.3,
      complexity: 0.8,
      rawness: 0.2,
      socialPresence: 0.2,
    },
  },
  {
    id: 'fierce-determination',
    name: 'Fierce Determination',
    description: 'Focused intensity and relentless drive',
    icon: Flame,
    color: {
      light: '#f97316',
      dark: '#9a3412',
    },
    targetScore: {
      valence: 0.7,
      arousal: 0.85,
      complexity: 0.5,
      rawness: 0.8,
      socialPresence: 0.4,
    },
  },
  {
    id: 'playful-whimsy',
    name: 'Playful Whimsy',
    description: 'Lighthearted, fun, and carefree spirit',
    icon: Sparkles,
    color: {
      light: '#f0abfc',
      dark: '#a855f7',
    },
    targetScore: {
      valence: 0.9,
      arousal: 0.7,
      complexity: 0.3,
      rawness: 0.4,
      socialPresence: 0.6,
    },
  },
  {
    id: 'solemn-majesty',
    name: 'Solemn Majesty',
    description: 'Grand, awe-inspiring, and reverent',
    icon: Star,
    color: {
      light: '#a5b4fc',
      dark: '#4338ca',
    },
    targetScore: {
      valence: 0.5,
      arousal: 0.4,
      complexity: 0.8,
      rawness: 0.3,
      socialPresence: 0.3,
    },
  },
  {
    id: 'rebellious-defiance',
    name: 'Rebellious Defiance',
    description: 'Defiant energy and anti-establishment spirit',
    icon: Flame,
    color: {
      light: '#f87171',
      dark: '#b91c1c',
    },
    targetScore: {
      valence: 0.4,
      arousal: 0.95,
      complexity: 0.4,
      rawness: 0.9,
      socialPresence: 0.7,
    },
  },
];