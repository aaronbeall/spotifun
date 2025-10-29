import { Music, Flame, Moon, Sun, Heart, Star, Wind, Droplets, Sparkles } from 'lucide-react';
import { VACRSScore } from "@/types";

// Define all 32 possible combinations of VACRS high/low values
const MUSIC_VIBES: MusicVibe[] = [
  // VACRS: V-Low, A-Low, C-Low, R-Low, S-Low
  {
    id: 'v0-a0-c0-r0-s0',
    name: 'Void Whisper',
    description: 'Minimal, ambient soundscapes for deep focus',
    icon: Moon,
    color: { light: '#d1d5db', dark: '#4b5563' },
    targetScore: { valence: 0.2, arousal: 0.2, complexity: 0.2, rawness: 0.2, socialPresence: 0.2 }
  },
  // V-High, A-Low, C-Low, R-Low, S-Low
  {
    id: 'v1-a0-c0-r0-s0',
    name: 'Gentle Glow',
    description: 'Soft, positive melodies for quiet moments',
    icon: Star,
    color: { light: '#fef08a', dark: '#854d0e' },
    targetScore: { valence: 0.8, arousal: 0.2, complexity: 0.2, rawness: 0.2, socialPresence: 0.2 }
  },
  // V-Low, A-High, C-Low, R-Low, S-Low
  {
    id: 'v0-a1-c0-r0-s0',
    name: 'Tense Drift',
    description: 'Energetic yet simple tension-filled instrumentals',
    icon: Flame,
    color: { light: '#fecaca', dark: '#991b1b' },
    targetScore: { valence: 0.2, arousal: 0.8, complexity: 0.2, rawness: 0.2, socialPresence: 0.2 }
  },
  // V-High, A-High, C-Low, R-Low, S-Low
  {
    id: 'v1-a1-c0-r0-s0',
    name: 'Radiant Pulse',
    description: 'Energetic and uplifting simple tunes',
    icon: Sun,
    color: { light: '#fde68a', dark: '#92400e' },
    targetScore: { valence: 0.8, arousal: 0.8, complexity: 0.2, rawness: 0.2, socialPresence: 0.2 }
  },
  // V-Low, A-Low, C-High, R-Low, S-Low
  {
    id: 'v0-a0-c1-r0-s0',
    name: 'Labyrinth Echo',
    description: 'Complex, melancholic compositions for the thoughtful mind',
    icon: Music,
    color: { light: '#bfdbfe', dark: '#1e40af' },
    targetScore: { valence: 0.2, arousal: 0.2, complexity: 0.8, rawness: 0.2, socialPresence: 0.2 }
  },
  // V-High, A-Low, C-High, R-Low, S-Low
  {
    id: 'v1-a0-c1-r0-s0',
    name: 'Harmonic Tapestry',
    description: 'Rich, layered melodies that uplift the soul',
    icon: Sparkles,
    color: { light: '#c7d2fe', dark: '#3730a3' },
    targetScore: { valence: 0.8, arousal: 0.2, complexity: 0.8, rawness: 0.2, socialPresence: 0.2 }
  },
  // V-Low, A-High, C-High, R-Low, S-Low
  {
    id: 'v0-a1-c1-r0-s0',
    name: 'Chaos Theory',
    description: 'Intense, complex soundscapes for deep immersion',
    icon: Wind,
    color: { light: '#fbcfe8', dark: '#831843' },
    targetScore: { valence: 0.2, arousal: 0.8, complexity: 0.8, rawness: 0.2, socialPresence: 0.2 }
  },
  // V-High, A-High, C-High, R-Low, S-Low
  {
    id: 'v1-a1-c1-r0-s0',
    name: 'Cosmic Dance',
    description: 'Energetic, complex, and joyful compositions',
    icon: Star,
    color: { light: '#a5f3fc', dark: '#155e75' },
    targetScore: { valence: 0.8, arousal: 0.8, complexity: 0.8, rawness: 0.2, socialPresence: 0.2 }
  },
  // V-Low, A-Low, C-Low, R-High, S-Low
  {
    id: 'v0-a0-c0-r1-s0',
    name: 'Rustic Silence',
    description: 'Raw, minimal acoustic expressions',
    icon: Music,
    color: { light: '#d4d4d4', dark: '#525252' },
    targetScore: { valence: 0.2, arousal: 0.2, complexity: 0.2, rawness: 0.8, socialPresence: 0.2 }
  },
  // V-High, A-Low, C-Low, R-High, S-Low
  {
    id: 'v1-a0-c0-r1-s0',
    name: 'Hearthside',
    description: 'Warm, raw, and intimate acoustic moments',
    icon: Heart,
    color: { light: '#fecaca', dark: '#7f1d1d' },
    targetScore: { valence: 0.8, arousal: 0.2, complexity: 0.2, rawness: 0.8, socialPresence: 0.2 }
  },
  // V-Low, A-High, C-Low, R-High, S-Low
  {
    id: 'v0-a1-c0-r1-s0',
    name: 'Feral Storm',
    description: 'Raw, aggressive energy in its simplest form',
    icon: Flame,
    color: { light: '#fca5a5', dark: '#7f1d1d' },
    targetScore: { valence: 0.2, arousal: 0.8, complexity: 0.2, rawness: 0.8, socialPresence: 0.2 }
  },
  // V-High, A-High, C-Low, R-High, S-Low
  {
    id: 'v1-a1-c0-r1-s0',
    name: 'Wildfire',
    description: 'Energetic and raw, untamed musical expression',
    icon: Flame,
    color: { light: '#fdba74', dark: '#9a3412' },
    targetScore: { valence: 0.8, arousal: 0.8, complexity: 0.2, rawness: 0.8, socialPresence: 0.2 }
  },
  // V-Low, A-Low, C-High, R-High, S-Low
  {
    id: 'v0-a0-c1-r1-s0',
    name: 'Forgotten Archives',
    description: 'Complex, raw, and deeply introspective',
    icon: Music,
    color: { light: '#a3a3a3', dark: '#404040' },
    targetScore: { valence: 0.2, arousal: 0.2, complexity: 0.8, rawness: 0.8, socialPresence: 0.2 }
  },
  // V-High, A-Low, C-High, R-High, S-Low
  {
    id: 'v1-a0-c1-r1-s0',
    name: 'Artisan Soul',
    description: 'Complex, raw, and emotionally rich',
    icon: Star,
    color: { light: '#f0abfc', dark: '#86198f' },
    targetScore: { valence: 0.8, arousal: 0.2, complexity: 0.8, rawness: 0.8, socialPresence: 0.2 }
  },
  // V-Low, A-High, C-High, R-High, S-Low
  {
    id: 'v0-a1-c1-r1-s0',
    name: 'Chaos Manifest',
    description: 'Intense, complex, and unrefined power',
    icon: Flame,
    color: { light: '#f87171', dark: '#991b1b' },
    targetScore: { valence: 0.2, arousal: 0.8, complexity: 0.8, rawness: 0.8, socialPresence: 0.2 }
  },
  // V-High, A-High, C-High, R-High, S-Low
  {
    id: 'v1-a1-c1-r1-s0',
    name: 'Primordial Force',
    description: 'Powerful, complex, and untamed energy',
    icon: Flame,
    color: { light: '#f97316', dark: '#9a3412' },
    targetScore: { valence: 0.8, arousal: 0.8, complexity: 0.8, rawness: 0.8, socialPresence: 0.2 }
  },
  // First 16 combinations with Social Presence High (S=1)
  // V-Low, A-Low, C-Low, R-Low, S-High
  {
    id: 'v0-a0-c0-r0-s1',
    name: 'Whispered Gathering',
    description: 'Soft, social background music for intimate settings',
    icon: Music,
    color: { light: '#e5e7eb', dark: '#6b7280' },
    targetScore: { valence: 0.2, arousal: 0.2, complexity: 0.2, rawness: 0.2, socialPresence: 0.8 }
  },
  // V-High, A-Low, C-Low, R-Low, S-High
  {
    id: 'v1-a0-c0-r0-s1',
    name: 'Social Serenade',
    description: 'Light, positive music for social gatherings',
    icon: Heart,
    color: { light: '#fef3c7', dark: '#92400e' },
    targetScore: { valence: 0.8, arousal: 0.2, complexity: 0.2, rawness: 0.2, socialPresence: 0.8 }
  },
  // V-Low, A-High, C-Low, R-Low, S-High
  {
    id: 'v0-a1-c0-r0-s1',
    name: 'Crowded Pulse',
    description: 'Energetic music for social excitement',
    icon: Flame,
    color: { light: '#fecaca', dark: '#b91c1c' },
    targetScore: { valence: 0.2, arousal: 0.8, complexity: 0.2, rawness: 0.2, socialPresence: 0.8 }
  },
  // V-High, A-High, C-Low, R-Low, S-High
  {
    id: 'v1-a1-c0-r0-s1',
    name: 'Party Starter',
    description: 'Energetic and fun music for celebrations',
    icon: Sun,
    color: { light: '#fde68a', dark: '#92400e' },
    targetScore: { valence: 0.8, arousal: 0.8, complexity: 0.2, rawness: 0.2, socialPresence: 0.8 }
  },
  // V-Low, A-Low, C-High, R-Low, S-High
  {
    id: 'v0-a0-c1-r0-s1',
    name: 'Intellectual Soirée',
    description: 'Complex, thought-provoking music for engaged listening',
    icon: Music,
    color: { light: '#dbeafe', dark: '#1e40af' },
    targetScore: { valence: 0.2, arousal: 0.2, complexity: 0.8, rawness: 0.2, socialPresence: 0.8 }
  },
  // V-High, A-Low, C-High, R-Low, S-High
  {
    id: 'v1-a0-c1-r0-s1',
    name: 'Social Symphony',
    description: 'Rich, engaging music for sophisticated gatherings',
    icon: Star,
    color: { light: '#e0e7ff', dark: '#3730a3' },
    targetScore: { valence: 0.8, arousal: 0.2, complexity: 0.8, rawness: 0.2, socialPresence: 0.8 }
  },
  // V-Low, A-High, C-High, R-Low, S-High
  {
    id: 'v0-a1-c1-r0-s1',
    name: 'Collective Frenzy',
    description: 'Intense, complex music for shared experiences',
    icon: Flame,
    color: { light: '#fce7f3', dark: '#831843' },
    targetScore: { valence: 0.2, arousal: 0.8, complexity: 0.8, rawness: 0.2, socialPresence: 0.8 }
  },
  // V-High, A-High, C-High, R-Low, S-High
  {
    id: 'v1-a1-c1-r0-s1',
    name: 'Celebration Suite',
    description: 'Complex, energetic music for grand social events',
    icon: Star,
    color: { light: '#cffafe', dark: '#155e75' },
    targetScore: { valence: 0.8, arousal: 0.8, complexity: 0.8, rawness: 0.2, socialPresence: 0.8 }
  },
  // V-Low, A-Low, C-Low, R-High, S-High
  {
    id: 'v0-a0-c0-r1-s1',
    name: 'Campfire Whispers',
    description: 'Raw, intimate music for close gatherings',
    icon: Music,
    color: { light: '#e5e7eb', dark: '#4b5563' },
    targetScore: { valence: 0.2, arousal: 0.2, complexity: 0.2, rawness: 0.8, socialPresence: 0.8 }
  },
  // V-High, A-Low, C-Low, R-High, S-High
  {
    id: 'v1-a0-c0-r1-s1',
    name: 'Fireside Chats',
    description: 'Warm, raw music for friendly gatherings',
    icon: Heart,
    color: { light: '#fee2e2', dark: '#b91c1c' },
    targetScore: { valence: 0.8, arousal: 0.2, complexity: 0.2, rawness: 0.8, socialPresence: 0.8 }
  },
  // V-Low, A-High, C-Low, R-High, S-High
  {
    id: 'v0-a1-c0-r1-s1',
    name: 'Mosh Pit',
    description: 'Raw, high-energy music for intense social experiences',
    icon: Flame,
    color: { light: '#fecaca', dark: '#991b1b' },
    targetScore: { valence: 0.2, arousal: 0.8, complexity: 0.2, rawness: 0.8, socialPresence: 0.8 }
  },
  // V-High, A-High, C-Low, R-High, S-High
  {
    id: 'v1-a1-c0-r1-s1',
    name: 'Street Party',
    description: 'Energetic, raw music for lively social gatherings',
    icon: Flame,
    color: { light: '#fdba74', dark: '#9a3412' },
    targetScore: { valence: 0.8, arousal: 0.8, complexity: 0.2, rawness: 0.8, socialPresence: 0.8 }
  },
  // V-Low, A-Low, C-High, R-High, S-High
  {
    id: 'v0-a0-c1-r1-s1',
    name: 'Bohemian Circle',
    description: 'Complex, raw music for deep social connections',
    icon: Music,
    color: { light: '#d1d5db', dark: '#4b5563' },
    targetScore: { valence: 0.2, arousal: 0.2, complexity: 0.8, rawness: 0.8, socialPresence: 0.8 }
  },
  // V-High, A-Low, C-High, R-High, S-High
  {
    id: 'v1-a0-c1-r1-s1',
    name: 'Artistic Collective',
    description: 'Rich, raw music for creative social spaces',
    icon: Star,
    color: { light: '#e9d5ff', dark: '#6b21a8' },
    targetScore: { valence: 0.8, arousal: 0.2, complexity: 0.8, rawness: 0.8, socialPresence: 0.8 }
  },
  // V-Low, A-High, C-High, R-High, S-High
  {
    id: 'v0-a1-c1-r1-s1',
    name: 'Ritual Fire',
    description: 'Intense, complex, and raw communal experience',
    icon: Flame,
    color: { light: '#fca5a5', dark: '#991b1b' },
    targetScore: { valence: 0.2, arousal: 0.8, complexity: 0.8, rawness: 0.8, socialPresence: 0.8 }
  },
  // V-High, A-High, C-High, R-High, S-High
  {
    id: 'v1-a1-c1-r1-s1',
    name: 'Cosmic Carnival',
    description: 'The ultimate social musical experience in all dimensions',
    icon: Star,
    color: { light: '#f97316', dark: '#9a3412' },
    targetScore: { valence: 0.8, arousal: 0.8, complexity: 0.8, rawness: 0.8, socialPresence: 0.8 }
  }
];