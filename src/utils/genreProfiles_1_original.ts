// Core genre profiles mapped to VACRS dimensions
import { GenreProfile } from "@/types";

export const GENRE_PROFILES: Record<string, GenreProfile> = {
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