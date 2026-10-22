/**
 * Genre Taxonomy with Hierarchical Classification
 * 
 * This unified taxonomy merges genre profiles and genre scores into a single
 * hierarchical structure. Each genre can have:
 * - VACRS scores (required at top level, inherited from parent if missing)
 * - Aliases (alternative names/spellings)
 * - Parent genre (for fallback classification)
 * - Description
 */

import { VACRSScore } from '@/types';

export interface GenreTaxonomyEntry {
  /** Full VACRS scores - required at top level, optional if parent exists */
  scores?: VACRSScore;
  /** Alternative names for this genre */
  aliases: string[];
  /** Parent genre for fallback classification */
  parent?: string;
  /** Human-readable description */
  description?: string;
}

export type GenreTaxonomy = Record<string, GenreTaxonomyEntry>;

/**
 * Unified genre taxonomy - hierarchical genre classification system
 * 
 * Top-level genres MUST have complete VACRS scores.
 * Sub-genres can inherit from parent or override specific traits.
 */
export const GENRE_TAXONOMY: GenreTaxonomy = {
  // ========== TOP LEVEL GENRES (with full VACRS scores) ==========
  
  pop: {
    scores: { valence: 0.8, arousal: 0.7, complexity: 0.3, rawness: 0.2, socialPresence: 0.8 },
    aliases: ['pop', 'pop music'],
    description: 'Catchy, mainstream music with broad appeal'
  },
  
  rock: {
    scores: { valence: 0.6, arousal: 0.8, complexity: 0.5, rawness: 0.6, socialPresence: 0.7 },
    aliases: ['rock', 'rock music', 'rock and roll', 'rock n roll'],
    description: 'Guitar-driven music with a strong backbeat'
  },
  
  metal: {
    scores: { valence: 0.3, arousal: 0.9, complexity: 0.7, rawness: 0.9, socialPresence: 0.6 },
    aliases: ['metal', 'heavy metal'],
    description: 'Heavy, amplified music with aggressive vocals'
  },
  
  punk: {
    scores: { valence: 0.4, arousal: 0.9, complexity: 0.2, rawness: 1.0, socialPresence: 0.8 },
    aliases: ['punk', 'punk rock'],
    description: 'Raw, energetic music with a rebellious attitude'
  },
  
  electronic: {
    scores: { valence: 0.8, arousal: 0.9, complexity: 0.4, rawness: 0.5, socialPresence: 0.9 },
    aliases: ['electronic', 'electronic music', 'edm', 'electronic dance music'],
    description: 'Synthesized music designed for dancing'
  },
  
  hiphop: {
    scores: { valence: 0.6, arousal: 0.7, complexity: 0.6, rawness: 0.7, socialPresence: 0.8 },
    aliases: ['hip hop', 'hip-hop', 'hiphop'],
    description: 'Rhythmic vocal style over beats'
  },
  
  jazz: {
    scores: { valence: 0.7, arousal: 0.5, complexity: 0.8, rawness: 0.3, socialPresence: 0.4 },
    aliases: ['jazz'],
    description: 'Improvisational music with complex harmonies'
  },
  
  classical: {
    scores: { valence: 0.6, arousal: 0.4, complexity: 0.9, rawness: 0.1, socialPresence: 0.2 },
    aliases: ['classical', 'classical music'],
    description: 'Complex, orchestral compositions'
  },
  
  ambient: {
    scores: { valence: 0.7, arousal: 0.1, complexity: 0.3, rawness: 0.3, socialPresence: 0.1 },
    aliases: ['ambient'],
    description: 'Atmospheric, background music'
  },
  
  folk: {
    scores: { valence: 0.7, arousal: 0.3, complexity: 0.4, rawness: 0.6, socialPresence: 0.5 },
    aliases: ['folk', 'folk music'],
    description: 'Traditional and contemporary acoustic music'
  },
  
  blues: {
    scores: { valence: 0.4, arousal: 0.5, complexity: 0.5, rawness: 0.7, socialPresence: 0.5 },
    aliases: ['blues'],
    description: 'Expressive music often about hardship'
  },
  
  country: {
    scores: { valence: 0.7, arousal: 0.5, complexity: 0.3, rawness: 0.4, socialPresence: 0.7 },
    aliases: ['country', 'country music'],
    description: 'Music rooted in rural American traditions'
  },
  
  rnb: {
    scores: { valence: 0.7, arousal: 0.6, complexity: 0.5, rawness: 0.3, socialPresence: 0.6 },
    aliases: ['r&b', 'r and b', 'rnb', 'rhythm and blues'],
    description: 'Rhythmic music with soulful vocals'
  },
  
  soul: {
    scores: { valence: 0.7, arousal: 0.6, complexity: 0.5, rawness: 0.4, socialPresence: 0.7 },
    aliases: ['soul', 'soul music'],
    description: 'Emotional, gospel-influenced vocal music'
  },
  
  reggae: {
    scores: { valence: 0.8, arousal: 0.6, complexity: 0.4, rawness: 0.5, socialPresence: 0.8 },
    aliases: ['reggae'],
    description: 'Jamaican music with a distinctive rhythm'
  },
  
  experimental: {
    scores: { valence: 0.4, arousal: 0.5, complexity: 0.9, rawness: 0.7, socialPresence: 0.2 },
    aliases: ['experimental', 'avant-garde', 'avant garde'],
    description: 'Innovative, boundary-pushing music'
  },
  
  indie: {
    scores: { valence: 0.6, arousal: 0.6, complexity: 0.6, rawness: 0.6, socialPresence: 0.5 },
    aliases: ['indie', 'independent'],
    description: 'Independent music outside the mainstream'
  },
  
  // ========== ELECTRONIC SUB-GENRES ==========
  
  house: {
    scores: { valence: 0.8, arousal: 0.8, complexity: 0.3, rawness: 0.4, socialPresence: 0.9 },
    aliases: ['house', 'house music'],
    parent: 'electronic',
    description: '4/4 beat electronic dance music'
  },
  
  techno: {
    scores: { valence: 0.6, arousal: 0.9, complexity: 0.4, rawness: 0.5, socialPresence: 0.8 },
    aliases: ['techno'],
    parent: 'electronic',
    description: 'Repetitive, driving electronic music'
  },
  
  trance: {
    scores: { valence: 0.8, arousal: 0.85, complexity: 0.5, rawness: 0.3, socialPresence: 0.9 },
    aliases: ['trance'],
    parent: 'electronic',
    description: 'Euphoric, melodic electronic dance music'
  },
  
  'drum and bass': {
    scores: { valence: 0.6, arousal: 0.95, complexity: 0.6, rawness: 0.6, socialPresence: 0.7 },
    aliases: ['drum and bass', 'drum n bass', 'dnb', 'd&b', 'jungle'],
    parent: 'electronic',
    description: 'Fast breakbeat electronic music'
  },
  
  dubstep: {
    scores: { valence: 0.5, arousal: 0.85, complexity: 0.5, rawness: 0.7, socialPresence: 0.7 },
    aliases: ['dubstep'],
    parent: 'electronic',
    description: 'Heavy bass electronic music with wobbles'
  },
  
  'deep house': {
    aliases: ['deep house'],
    parent: 'house',
    description: 'Soulful, jazzy house music'
  },
  
  'tech house': {
    aliases: ['tech house'],
    parent: 'house',
    description: 'Techno-influenced house music'
  },
  
  'tropical house': {
    scores: { valence: 0.9, arousal: 0.7, complexity: 0.3, rawness: 0.2, socialPresence: 0.85 },
    aliases: ['tropical house'],
    parent: 'house',
    description: 'Relaxed, Caribbean-influenced house'
  },
  
  'future bass': {
    scores: { valence: 0.85, arousal: 0.8, complexity: 0.5, rawness: 0.4, socialPresence: 0.8 },
    aliases: ['future bass'],
    parent: 'electronic',
    description: 'Melodic bass-heavy electronic music'
  },
  
  disco: {
    scores: { valence: 0.9, arousal: 0.8, complexity: 0.3, rawness: 0.2, socialPresence: 0.95 },
    aliases: ['disco'],
    parent: 'electronic',
    description: 'Upbeat 70s dance music'
  },
  
  'electro house': {
    aliases: ['electro house'],
    parent: 'house',
    description: 'Aggressive, distorted house music'
  },
  
  'progressive house': {
    scores: { valence: 0.75, arousal: 0.8, complexity: 0.5, rawness: 0.3, socialPresence: 0.85 },
    aliases: ['progressive house', 'prog house'],
    parent: 'house',
    description: 'Melodic, building house music'
  },
  
  downtempo: {
    scores: { valence: 0.6, arousal: 0.3, complexity: 0.5, rawness: 0.4, socialPresence: 0.3 },
    aliases: ['downtempo', 'chillout', 'chill out'],
    parent: 'electronic',
    description: 'Slow, relaxed electronic music'
  },
  
  'trip hop': {
    scores: { valence: 0.4, arousal: 0.3, complexity: 0.6, rawness: 0.5, socialPresence: 0.3 },
    aliases: ['trip hop', 'trip-hop', 'triphop'],
    parent: 'downtempo',
    description: 'Dark, moody electronic with hip-hop influence'
  },
  
  'lo-fi': {
    scores: { valence: 0.6, arousal: 0.2, complexity: 0.3, rawness: 0.6, socialPresence: 0.2 },
    aliases: ['lo-fi', 'lofi', 'lo fi', 'chillhop', 'lo-fi hip hop', 'lofi hip hop'],
    parent: 'downtempo',
    description: 'Relaxed, intentionally low-fidelity beats'
  },
  
  vaporwave: {
    scores: { valence: 0.6, arousal: 0.3, complexity: 0.4, rawness: 0.5, socialPresence: 0.3 },
    aliases: ['vaporwave'],
    parent: 'electronic',
    description: 'Nostalgic, surreal electronic music'
  },
  
  synthwave: {
    scores: { valence: 0.7, arousal: 0.7, complexity: 0.4, rawness: 0.3, socialPresence: 0.6 },
    aliases: ['synthwave', 'synth wave', 'retrowave'],
    parent: 'electronic',
    description: '80s-inspired synthesizer music'
  },
  
  // ========== HIP-HOP SUB-GENRES ==========
  
  rap: {
    aliases: ['rap', 'rapping'],
    parent: 'hiphop',
    description: 'Rhythmic spoken or chanted vocals'
  },
  
  trap: {
    scores: { valence: 0.5, arousal: 0.8, complexity: 0.4, rawness: 0.7, socialPresence: 0.8 },
    aliases: ['trap'],
    parent: 'hiphop',
    description: 'Hard-hitting hip-hop with 808s'
  },
  
  drill: {
    scores: { valence: 0.3, arousal: 0.8, complexity: 0.4, rawness: 0.8, socialPresence: 0.7 },
    aliases: ['drill'],
    parent: 'trap',
    description: 'Dark, aggressive hip-hop style'
  },
  
  'uk drill': {
    aliases: ['uk drill', 'ukdrill'],
    parent: 'drill',
    description: 'UK variant of drill music'
  },
  
  'cloud rap': {
    scores: { valence: 0.5, arousal: 0.4, complexity: 0.4, rawness: 0.6, socialPresence: 0.5 },
    aliases: ['cloud rap'],
    parent: 'hiphop',
    description: 'Atmospheric, dreamlike hip-hop'
  },
  
  'emo rap': {
    scores: { valence: 0.3, arousal: 0.5, complexity: 0.4, rawness: 0.7, socialPresence: 0.6 },
    aliases: ['emo rap'],
    parent: 'hiphop',
    description: 'Emotional, confessional hip-hop'
  },
  
  // ========== ROCK SUB-GENRES ==========
  
  'alternative rock': {
    scores: { valence: 0.5, arousal: 0.7, complexity: 0.6, rawness: 0.6, socialPresence: 0.6 },
    aliases: ['alternative rock', 'alternative', 'alt rock', 'alt-rock'],
    parent: 'rock',
    description: 'Non-mainstream rock music'
  },
  
  'indie rock': {
    aliases: ['indie rock'],
    parent: 'indie',
    description: 'Independent rock music'
  },
  
  'indie pop': {
    scores: { valence: 0.7, arousal: 0.6, complexity: 0.4, rawness: 0.5, socialPresence: 0.6 },
    aliases: ['indie pop', 'indiepop'],
    parent: 'indie',
    description: 'Melodic independent pop music'
  },
  
  grunge: {
    scores: { valence: 0.3, arousal: 0.7, complexity: 0.4, rawness: 0.9, socialPresence: 0.5 },
    aliases: ['grunge'],
    parent: 'alternative rock',
    description: 'Raw, distorted alternative rock'
  },
  
  'post-punk': {
    scores: { valence: 0.4, arousal: 0.6, complexity: 0.6, rawness: 0.7, socialPresence: 0.5 },
    aliases: ['post-punk', 'post punk', 'postpunk'],
    parent: 'punk',
    description: 'Experimental punk-derived music'
  },
  
  'post-rock': {
    scores: { valence: 0.6, arousal: 0.4, complexity: 0.7, rawness: 0.5, socialPresence: 0.3 },
    aliases: ['post-rock', 'post rock', 'postrock'],
    parent: 'rock',
    description: 'Instrumental rock with ambient textures'
  },
  
  shoegaze: {
    scores: { valence: 0.5, arousal: 0.5, complexity: 0.6, rawness: 0.6, socialPresence: 0.3 },
    aliases: ['shoegaze', 'shoegazing'],
    parent: 'alternative rock',
    description: 'Ethereal, effects-heavy rock'
  },
  
  'dream pop': {
    scores: { valence: 0.7, arousal: 0.4, complexity: 0.5, rawness: 0.4, socialPresence: 0.4 },
    aliases: ['dream pop', 'dreampop'],
    parent: 'alternative rock',
    description: 'Atmospheric, ethereal pop'
  },
  
  'garage rock': {
    scores: { valence: 0.6, arousal: 0.8, complexity: 0.3, rawness: 0.8, socialPresence: 0.7 },
    aliases: ['garage rock', 'garage'],
    parent: 'rock',
    description: 'Raw, energetic rock'
  },
  
  'prog rock': {
    scores: { valence: 0.6, arousal: 0.6, complexity: 0.9, rawness: 0.4, socialPresence: 0.4 },
    aliases: ['prog rock', 'progressive rock', 'prog'],
    parent: 'rock',
    description: 'Complex, experimental rock'
  },
  
  'hard rock': {
    scores: { valence: 0.6, arousal: 0.85, complexity: 0.4, rawness: 0.7, socialPresence: 0.7 },
    aliases: ['hard rock', 'hardrock'],
    parent: 'rock',
    description: 'Heavy, aggressive rock'
  },
  
  'soft rock': {
    scores: { valence: 0.75, arousal: 0.4, complexity: 0.3, rawness: 0.3, socialPresence: 0.6 },
    aliases: ['soft rock', 'softrock'],
    parent: 'rock',
    description: 'Mellow, radio-friendly rock'
  },
  
  'pop rock': {
    scores: { valence: 0.75, arousal: 0.7, complexity: 0.3, rawness: 0.4, socialPresence: 0.75 },
    aliases: ['pop rock', 'pop-rock'],
    parent: 'rock',
    description: 'Accessible rock with pop sensibilities'
  },
  
  britpop: {
    scores: { valence: 0.7, arousal: 0.7, complexity: 0.4, rawness: 0.5, socialPresence: 0.7 },
    aliases: ['britpop', 'brit pop'],
    parent: 'alternative rock',
    description: '90s British guitar pop'
  },
  
  // ========== METAL SUB-GENRES ==========
  
  'death metal': {
    scores: { valence: 0.2, arousal: 0.95, complexity: 0.7, rawness: 0.95, socialPresence: 0.5 },
    aliases: ['death metal', 'deathmetal'],
    parent: 'metal',
    description: 'Extreme, brutal metal'
  },
  
  'black metal': {
    scores: { valence: 0.1, arousal: 0.9, complexity: 0.6, rawness: 0.95, socialPresence: 0.4 },
    aliases: ['black metal', 'blackmetal'],
    parent: 'metal',
    description: 'Dark, atmospheric extreme metal'
  },
  
  'doom metal': {
    scores: { valence: 0.2, arousal: 0.4, complexity: 0.6, rawness: 0.8, socialPresence: 0.3 },
    aliases: ['doom metal', 'doom'],
    parent: 'metal',
    description: 'Slow, heavy, crushing metal'
  },
  
  metalcore: {
    scores: { valence: 0.3, arousal: 0.9, complexity: 0.6, rawness: 0.85, socialPresence: 0.7 },
    aliases: ['metalcore'],
    parent: 'metal',
    description: 'Metal with hardcore punk influence'
  },
  
  'progressive metal': {
    scores: { valence: 0.5, arousal: 0.8, complexity: 0.9, rawness: 0.6, socialPresence: 0.5 },
    aliases: ['progressive metal', 'prog metal'],
    parent: 'metal',
    description: 'Technical, complex metal'
  },
  
  'power metal': {
    scores: { valence: 0.7, arousal: 0.9, complexity: 0.6, rawness: 0.5, socialPresence: 0.7 },
    aliases: ['power metal'],
    parent: 'metal',
    description: 'Fast, melodic fantasy-themed metal'
  },
  
  'thrash metal': {
    scores: { valence: 0.4, arousal: 0.95, complexity: 0.6, rawness: 0.8, socialPresence: 0.6 },
    aliases: ['thrash metal', 'thrash'],
    parent: 'metal',
    description: 'Fast, aggressive metal'
  },
  
  // ========== JAZZ SUB-GENRES ==========
  
  bebop: {
    aliases: ['bebop', 'be-bop'],
    parent: 'jazz',
    description: 'Fast, complex jazz'
  },
  
  swing: {
    scores: { valence: 0.8, arousal: 0.6, complexity: 0.6, rawness: 0.3, socialPresence: 0.8 },
    aliases: ['swing'],
    parent: 'jazz',
    description: 'Big band dance jazz'
  },
  
  fusion: {
    scores: { valence: 0.65, arousal: 0.7, complexity: 0.8, rawness: 0.4, socialPresence: 0.5 },
    aliases: ['fusion', 'jazz fusion', 'jazz-fusion'],
    parent: 'jazz',
    description: 'Jazz mixed with rock or funk'
  },
  
  'smooth jazz': {
    scores: { valence: 0.75, arousal: 0.3, complexity: 0.4, rawness: 0.2, socialPresence: 0.4 },
    aliases: ['smooth jazz'],
    parent: 'jazz',
    description: 'Mellow, radio-friendly jazz'
  },
  
  'free jazz': {
    scores: { valence: 0.4, arousal: 0.6, complexity: 0.95, rawness: 0.8, socialPresence: 0.2 },
    aliases: ['free jazz'],
    parent: 'jazz',
    description: 'Avant-garde, improvised jazz'
  },
  
  // ========== POP SUB-GENRES ==========
  
  synthpop: {
    scores: { valence: 0.8, arousal: 0.7, complexity: 0.3, rawness: 0.2, socialPresence: 0.7 },
    aliases: ['synthpop', 'synth-pop', 'synth pop'],
    parent: 'pop',
    description: 'Synthesizer-based pop music'
  },
  
  electropop: {
    scores: { valence: 0.85, arousal: 0.75, complexity: 0.3, rawness: 0.2, socialPresence: 0.8 },
    aliases: ['electropop', 'electro-pop', 'electro pop'],
    parent: 'pop',
    description: 'Electronic pop music'
  },
  
  'dance-pop': {
    scores: { valence: 0.85, arousal: 0.8, complexity: 0.3, rawness: 0.2, socialPresence: 0.9 },
    aliases: ['dance-pop', 'dance pop', 'dancepop'],
    parent: 'pop',
    description: 'Upbeat pop designed for dancing'
  },
  
  'art pop': {
    scores: { valence: 0.6, arousal: 0.6, complexity: 0.7, rawness: 0.4, socialPresence: 0.5 },
    aliases: ['art pop', 'art-pop'],
    parent: 'pop',
    description: 'Experimental, artistic pop'
  },
  
  'chamber pop': {
    scores: { valence: 0.65, arousal: 0.4, complexity: 0.7, rawness: 0.3, socialPresence: 0.4 },
    aliases: ['chamber pop'],
    parent: 'art pop',
    description: 'Orchestral, baroque-influenced pop'
  },
  
  'k-pop': {
    scores: { valence: 0.85, arousal: 0.8, complexity: 0.4, rawness: 0.1, socialPresence: 0.9 },
    aliases: ['k-pop', 'kpop', 'korean pop'],
    parent: 'pop',
    description: 'Korean pop music'
  },
  
  'j-pop': {
    scores: { valence: 0.85, arousal: 0.75, complexity: 0.4, rawness: 0.2, socialPresence: 0.85 },
    aliases: ['j-pop', 'jpop', 'japanese pop'],
    parent: 'pop',
    description: 'Japanese pop music'
  },
  
  // ========== REGGAE / CARIBBEAN ==========
  
  dub: {
    scores: { valence: 0.7, arousal: 0.5, complexity: 0.5, rawness: 0.6, socialPresence: 0.6 },
    aliases: ['dub'],
    parent: 'reggae',
    description: 'Instrumental reggae with heavy effects'
  },
  
  dancehall: {
    scores: { valence: 0.8, arousal: 0.8, complexity: 0.3, rawness: 0.6, socialPresence: 0.9 },
    aliases: ['dancehall'],
    parent: 'reggae',
    description: 'Uptempo Jamaican dance music'
  },
  
  reggaeton: {
    scores: { valence: 0.75, arousal: 0.8, complexity: 0.3, rawness: 0.5, socialPresence: 0.9 },
    aliases: ['reggaeton', 'reggaetón'],
    parent: 'reggae',
    description: 'Latin urban music with reggae influence'
  },
  
  // ========== R&B / SOUL SUB-GENRES ==========
  
  'neo soul': {
    scores: { valence: 0.7, arousal: 0.5, complexity: 0.6, rawness: 0.4, socialPresence: 0.6 },
    aliases: ['neo soul', 'neo-soul', 'neosoul'],
    parent: 'soul',
    description: 'Modern soul with jazz and hip-hop influence'
  },
  
  'contemporary r&b': {
    aliases: ['contemporary r&b', 'contemporary rnb'],
    parent: 'rnb',
    description: 'Modern R&B with electronic production'
  },
  
  funk: {
    scores: { valence: 0.8, arousal: 0.75, complexity: 0.5, rawness: 0.4, socialPresence: 0.85 },
    aliases: ['funk'],
    parent: 'soul',
    description: 'Groovy, syncopated dance music'
  },
  
  // ========== FOLK / ACOUSTIC ==========
  
  'singer-songwriter': {
    scores: { valence: 0.6, arousal: 0.3, complexity: 0.5, rawness: 0.5, socialPresence: 0.3 },
    aliases: ['singer-songwriter', 'singer songwriter'],
    parent: 'folk',
    description: 'Confessional, acoustic songwriting'
  },
  
  'indie folk': {
    aliases: ['indie folk'],
    parent: 'folk',
    description: 'Independent folk music'
  },
  
  americana: {
    aliases: ['americana'],
    parent: 'country',
    description: 'Roots American music blend'
  },
  
  bluegrass: {
    scores: { valence: 0.7, arousal: 0.6, complexity: 0.6, rawness: 0.6, socialPresence: 0.7 },
    aliases: ['bluegrass'],
    parent: 'country',
    description: 'Acoustic string band music'
  },
  
  // ========== CLASSICAL SUB-GENRES ==========
  
  orchestral: {
    aliases: ['orchestral', 'symphonic'],
    parent: 'classical',
    description: 'Large ensemble classical music'
  },
  
  'modern classical': {
    scores: { valence: 0.5, arousal: 0.4, complexity: 0.9, rawness: 0.2, socialPresence: 0.2 },
    aliases: ['modern classical', 'contemporary classical', 'neoclassical'],
    parent: 'classical',
    description: 'Contemporary classical composition'
  },
  
  // ========== OTHER GENRES ==========
  
  'bedroom pop': {
    scores: { valence: 0.6, arousal: 0.4, complexity: 0.4, rawness: 0.7, socialPresence: 0.2 },
    aliases: ['bedroom pop'],
    parent: 'indie',
    description: 'Lo-fi home-recorded pop'
  },
  
  emo: {
    scores: { valence: 0.3, arousal: 0.6, complexity: 0.5, rawness: 0.7, socialPresence: 0.6 },
    aliases: ['emo', 'emo rock'],
    parent: 'punk',
    description: 'Emotional hardcore punk'
  },
  
  hardcore: {
    scores: { valence: 0.3, arousal: 0.95, complexity: 0.3, rawness: 0.95, socialPresence: 0.8 },
    aliases: ['hardcore', 'hardcore punk'],
    parent: 'punk',
    description: 'Fast, aggressive punk'
  },
  
  'pop punk': {
    scores: { valence: 0.6, arousal: 0.8, complexity: 0.3, rawness: 0.6, socialPresence: 0.8 },
    aliases: ['pop punk', 'pop-punk', 'poppunk'],
    parent: 'punk',
    description: 'Melodic punk with pop hooks'
  },
  
  'dark ambient': {
    scores: { valence: 0.2, arousal: 0.2, complexity: 0.5, rawness: 0.5, socialPresence: 0.1 },
    aliases: ['dark ambient'],
    parent: 'ambient',
    description: 'Ominous, atmospheric music'
  },
  
  drone: {
    scores: { valence: 0.5, arousal: 0.1, complexity: 0.4, rawness: 0.5, socialPresence: 0.1 },
    aliases: ['drone', 'drone music'],
    parent: 'ambient',
    description: 'Sustained tones and textures'
  },
  
  noise: {
    scores: { valence: 0.2, arousal: 0.7, complexity: 0.8, rawness: 0.95, socialPresence: 0.2 },
    aliases: ['noise', 'noise music'],
    parent: 'experimental',
    description: 'Atonal, dissonant experimental music'
  },
  
  psychedelic: {
    scores: { valence: 0.6, arousal: 0.6, complexity: 0.7, rawness: 0.5, socialPresence: 0.5 },
    aliases: ['psychedelic', 'psychedelia', 'psych'],
    parent: 'rock',
    description: 'Mind-altering, experimental rock'
  },
  
  industrial: {
    scores: { valence: 0.3, arousal: 0.8, complexity: 0.6, rawness: 0.9, socialPresence: 0.4 },
    aliases: ['industrial'],
    parent: 'electronic',
    description: 'Harsh, mechanical electronic music'
  },
  
  goth: {
    scores: { valence: 0.3, arousal: 0.5, complexity: 0.5, rawness: 0.6, socialPresence: 0.5 },
    aliases: ['goth', 'gothic', 'gothic rock'],
    parent: 'post-punk',
    description: 'Dark, atmospheric rock'
  },
  
  afrobeats: {
    scores: { valence: 0.8, arousal: 0.8, complexity: 0.4, rawness: 0.5, socialPresence: 0.9 },
    aliases: ['afrobeats', 'afrobeat', 'afro beats'],
    parent: 'electronic',
    description: 'African pop with electronic production'
  },
  
  'latin pop': {
    scores: { valence: 0.8, arousal: 0.75, complexity: 0.4, rawness: 0.3, socialPresence: 0.85 },
    aliases: ['latin pop', 'latin', 'latino'],
    parent: 'pop',
    description: 'Latin American pop music'
  },
  
  salsa: {
    scores: { valence: 0.85, arousal: 0.8, complexity: 0.5, rawness: 0.4, socialPresence: 0.9 },
    aliases: ['salsa'],
    parent: 'latin pop',
    description: 'Energetic Latin dance music'
  },
  
  'bossa nova': {
    scores: { valence: 0.8, arousal: 0.3, complexity: 0.6, rawness: 0.3, socialPresence: 0.5 },
    aliases: ['bossa nova', 'bossanova'],
    parent: 'jazz',
    description: 'Brazilian jazz-influenced music'
  },
  
  samba: {
    scores: { valence: 0.9, arousal: 0.8, complexity: 0.5, rawness: 0.5, socialPresence: 0.95 },
    aliases: ['samba'],
    parent: 'latin pop',
    description: 'Brazilian percussion-driven music'
  },
};
