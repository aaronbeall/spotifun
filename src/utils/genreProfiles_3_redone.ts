// Music Classification System based on VACRS model
// (Valence, Arousal, Complexity, Rawness, Social Presence)

import { GenreStats } from '@/types';

// Core genre profiles mapped to VACRS dimensions
const GENRE_PROFILES: Record<string, GenreProfile> = {
  // Pop - High valence, high arousal, low complexity, polished, high social presence
  pop: {
    valence: 0.9,
    arousal: 0.8,
    complexity: 0.2,
    rawness: 0.1,
    socialPresence: 0.9,
    aliases: [
      'pop', 'top 40', 'mainstream pop', 'dance pop', 'electropop', 'synthpop',
      'indie pop', 'pop rock', 'power pop', 'teen pop', 'bubblegum pop',
      'pop r&b', 'k-pop', 'j-pop', 'latin pop', 'dream pop', 'bedroom pop',
      'hyperpop', 'europop'
    ],
    description: 'Catchy, melodic, and broadly appealing modern music emphasizing hooks and accessibility.'
  },

  // Rock - Medium-high valence, high arousal, medium complexity, medium rawness, high social presence
  rock: {
    valence: 0.7,
    arousal: 0.9,
    complexity: 0.6,
    rawness: 0.7,
    socialPresence: 0.8,
    aliases: [
      'rock', 'rock and roll', 'classic rock', 'hard rock', 'alternative rock',
      'indie rock', 'garage rock', 'punk rock', 'post-punk', 'prog rock', 'psychedelic rock',
      'folk rock', 'southern rock', 'blues rock', 'arena rock', 'grunge',
      'post-hardcore', 'emo', 'shoegaze', 'stoner rock', 'surf rock'
    ],
    description: 'Guitar-driven music emphasizing rhythm, melody, and energy, ranging from classic to alternative styles.'
  },

  // Classical - Medium valence, low arousal, very high complexity, very polished, low social presence
  classical: {
    valence: 0.5,
    arousal: 0.3,
    complexity: 1.0,
    rawness: 0.1,
    socialPresence: 0.2,
    aliases: [
      'classical', 'orchestral', 'symphonic', 'chamber music', 'baroque', 'romantic',
      'opera', 'concerto', 'sonata', 'symphony', 'piano', 'violin', 'string quartet',
      'choral', 'early music', 'modern classical', 'minimalism', 'neoclassical'
    ],
    description: 'Formal, orchestrated compositions with structural and emotional depth.'
  },

  // Jazz - Medium-high valence, medium arousal, high complexity, medium rawness, medium social presence
  jazz: {
    valence: 0.7,
    arousal: 0.6,
    complexity: 0.9,
    rawness: 0.5,
    socialPresence: 0.5,
    aliases: [
      'jazz', 'bebop', 'swing', 'fusion', 'smooth jazz', 'latin jazz', 'acid jazz',
      'cool jazz', 'hard bop', 'modal jazz', 'free jazz', 'dixieland', 'ragtime',
      'big band', 'soul jazz', 'gypsy jazz', 'avant-garde jazz', 'nu jazz'
    ],
    description: 'Improvisational, harmonically rich music with rhythmic flexibility and expressive depth.'
  },

  // Electronic/Dance - Very high valence, very high arousal, medium complexity, medium rawness, very high social presence
  electronic: {
    valence: 1.0,
    arousal: 1.0,
    complexity: 0.6,
    rawness: 0.4,
    socialPresence: 1.0,
    aliases: [
      'electronic', 'edm', 'dance', 'house', 'techno', 'trance', 'drum and bass', 'synth',
      'dubstep', 'future bass', 'electro', 'synthwave', 'disco', 'progressive house',
      'deep house', 'tech house', 'hardstyle', 'industrial', 'breakbeat', 'jungle',
      'dnb', 'ambient', 'idm', 'trip hop', 'downtempo', 'trap', 'minimal', 'acid',
      'electro house', 'hardcore', 'uk garage', 'uk bass', 'future house', 'tropical house',
      'melodic house', 'melodic techno', 'electro swing', 'chillwave', 'vaporwave', 'glitch hop'
    ],
    description: 'Synthesized, beat-driven music designed for clubs, festivals, and immersive listening.'
  },

  // Hip-Hop/Rap - Medium-high valence, high arousal, medium complexity, medium-high rawness, high social presence
  hiphop: {
    valence: 0.7,
    arousal: 0.9,
    complexity: 0.6,
    rawness: 0.8,
    socialPresence: 0.9,
    aliases: [
      'hip hop', 'rap', 'trap', 'drill', 'boom bap', 'lofi hip hop',
      'conscious rap', 'gangsta rap', 'east coast rap', 'west coast rap',
      'southern rap', 'alternative hip hop', 'underground rap', 'mumble rap'
    ],
    description: 'Rhythmic vocal delivery over beats, emphasizing wordplay, flow, and cultural expression.'
  },

  // Metal - Low valence, very high arousal, high complexity, very high rawness, medium social presence
  metal: {
    valence: 0.2,
    arousal: 1.0,
    complexity: 0.8,
    rawness: 1.0,
    socialPresence: 0.6,
    aliases: [
      'metal', 'heavy metal', 'thrash metal', 'death metal', 'black metal',
      'doom metal', 'sludge metal', 'progressive metal', 'nu metal', 'metalcore',
      'industrial metal', 'speed metal', 'power metal', 'groove metal', 'post-metal'
    ],
    description: 'Loud, aggressive, and technically demanding music driven by distorted guitars and powerful vocals.'
  },

  // Punk - Medium-low valence, very high arousal, low complexity, very high rawness, high social presence
  punk: {
    valence: 0.3,
    arousal: 1.0,
    complexity: 0.3,
    rawness: 1.0,
    socialPresence: 0.8,
    aliases: [
      'punk', 'punk rock', 'hardcore punk', 'pop punk', 'skate punk',
      'post-punk', 'garage punk', 'anarcho-punk', 'oi!', 'emo punk'
    ],
    description: 'Fast, raw, and rebellious rock-based music emphasizing attitude and simplicity.'
  },

  // Ambient - Medium valence, very low arousal, low complexity, medium rawness, very low social presence
  ambient: {
    valence: 0.5,
    arousal: 0.1,
    complexity: 0.3,
    rawness: 0.4,
    socialPresence: 0.1,
    aliases: [
      'ambient', 'drone', 'atmospheric', 'chillout', 'new age', 'space music',
      'downtempo', 'cinematic ambient', 'dark ambient', 'soundscape'
    ],
    description: 'Atmospheric, often beatless music emphasizing tone, space, and texture.'
  },

  // Folk - Medium-high valence, low-medium arousal, medium complexity, medium-high rawness, medium social presence
  folk: {
    valence: 0.7,
    arousal: 0.3,
    complexity: 0.5,
    rawness: 0.7,
    socialPresence: 0.6,
    aliases: [
      'folk', 'acoustic', 'singer-songwriter', 'traditional', 'indie folk',
      'americana', 'celtic folk', 'country folk', 'neofolk', 'folk rock'
    ],
    description: 'Story-driven, acoustic-based music rooted in traditional and personal expression.'
  },

  // R&B/Soul - High valence, medium-high arousal, medium complexity, medium rawness, medium-high social presence
  rnb: {
    valence: 0.8,
    arousal: 0.7,
    complexity: 0.6,
    rawness: 0.4,
    socialPresence: 0.7,
    aliases: [
      'r&b', 'soul', 'neo soul', 'contemporary r&b', 'motown', 'quiet storm',
      'funk', 'new jack swing', 'alt r&b'
    ],
    description: 'Smooth, groove-oriented music with soulful vocals and emotional depth.'
  },

  // Country - Medium-high valence, medium arousal, medium complexity, medium rawness, medium-high social presence
  country: {
    valence: 0.7,
    arousal: 0.5,
    complexity: 0.4,
    rawness: 0.6,
    socialPresence: 0.8,
    aliases: [
      'country', 'bluegrass', 'americana', 'alt country', 'outlaw country', 'honky tonk',
      'country pop', 'country rock', 'folk country', 'nashville sound'
    ],
    description: 'Rural-rooted, narrative-driven music with acoustic and twangy instrumentation.'
  },

  // Blues - Medium-low valence, medium arousal, medium complexity, high rawness, medium social presence
  blues: {
    valence: 0.4,
    arousal: 0.6,
    complexity: 0.5,
    rawness: 0.8,
    socialPresence: 0.5,
    aliases: [
      'blues', 'delta blues', 'chicago blues', 'electric blues', 'country blues',
      'blues rock', 'soul blues', 'rhythm and blues'
    ],
    description: 'Emotional, expressive music centered on feeling, repetition, and call-and-response.'
  },

  // Reggae - High valence, medium-high arousal, medium complexity, medium rawness, high social presence
  reggae: {
    valence: 0.9,
    arousal: 0.7,
    complexity: 0.4,
    rawness: 0.6,
    socialPresence: 0.9,
    aliases: [
      'reggae', 'dub', 'dancehall', 'ska', 'roots reggae', 'rocksteady', 'ragga'
    ],
    description: 'Jamaican-origin music characterized by off-beat rhythms and social themes.'
  },

  // Experimental - Medium-low valence, medium arousal, very high complexity, high rawness, very low social presence
  experimental: {
    valence: 0.3,
    arousal: 0.5,
    complexity: 1.0,
    rawness: 0.9,
    socialPresence: 0.1,
    aliases: [
      'experimental', 'avant-garde', 'noise', 'glitch', 'industrial', 'sound art',
      'electroacoustic', 'musique concrète', 'minimal', 'freeform'
    ],
    description: 'Unconventional music exploring new sounds, forms, and compositional methods.'
  },

  // Indie - Medium-high valence, medium-high arousal, medium-high complexity, medium-high rawness, medium social presence
  indie: {
    valence: 0.7,
    arousal: 0.7,
    complexity: 0.7,
    rawness: 0.7,
    socialPresence: 0.6,
    aliases: [
      'indie', 'alternative', 'indie rock', 'indie pop', 'indie folk', 'lofi indie',
      'bedroom pop', 'dreampop', 'garage indie', 'alt indie'
    ],
    description: 'Independent or alternative music often defined by DIY ethos and artistic individuality.'
  }
};