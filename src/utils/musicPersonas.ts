import { Stats } from '@/types';
import { calculateWeightedVACRSScore } from './musicClassification';
import type { ArtProfile } from './generativeArt';

export type Level = 'high' | 'low';
export type Era = 'new' | 'old';
export type Valence = 'positive' | 'negative';
export type Arousal = 'energetic' | 'calm';

/** Cutoffs computePersonaInput uses. The coverage report snapshots these on every run. */
export const PERSONA_THRESHOLDS = {
  /** High when more than this share of tagged artists sit outside the biggest family. */
  genreDiversityHighAbove: 0.25,
  popularityHighAbove: 50,
  artistConsistencyWhenTopShareAbove: 0.5,
  newEraWithinYears: 10,
  valencePositiveAbove: 0.5,
  arousalEnergeticAbove: 0.5,
} as const;

export interface PersonaDimensions {
  genreDiversity: Level;
  trackPopularity: Level;
  artistConsistency: Level;
  era: Era;
  valence: Valence;
  arousal: Arousal;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  color: string;
  dimensions: PersonaDimensions;
  /**
   * 0–1 rarity from the 12 Nov 2026 coverage sample.
   * 0 is the persona that appeared on the most playlists. 1 was not observed.
   */
  rarity: number;
}

function persona(
  name: string,
  description: string,
  color: string,
  genreDiversity: Level,
  trackPopularity: Level,
  artistConsistency: Level,
  era: Era,
  valence: Valence,
  arousal: Arousal,
  rarity: number
): Persona {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    name,
    description,
    color,
    dimensions: { genreDiversity, trackPopularity, artistConsistency, era, valence, arousal },
    rarity,
  };
}

// Complete truth table: every combination of the 6 binary/ternary dimensions
// (2 x 2 x 2 x 2 x 2 x 2 = 64) maps to exactly one named persona.
export const MUSIC_PERSONAS: Persona[] = [
  persona('The Trend Voyager', 'Explores modern hits across genres but sticks to favorite stars. Loves energy and discovery.', '#22d3ee', 'high', 'high', 'high', 'new', 'positive', 'energetic', 0.80),
  persona('The Chill Curator', 'Enjoys diverse modern hits but prefers smooth, relaxed sounds.', '#86efac', 'high', 'high', 'high', 'new', 'positive', 'calm', 1.00),
  persona('The Electric Escapist', 'Channels emotion through upbeat new tracks across many genres.', '#d6336c', 'high', 'high', 'high', 'new', 'negative', 'energetic', 0.80),
  persona('The Reflective Dreamer', 'Listens to melancholy modern hits with genre variety but emotional depth.', '#93c5fd', 'high', 'high', 'high', 'new', 'negative', 'calm', 1.00),
  persona('The Golden Revivalist', 'Reignites classic hits from many eras, full of nostalgia and rhythm.', '#eab308', 'high', 'high', 'high', 'old', 'positive', 'energetic', 1.00),
  persona('The Vintage Enthusiast', 'Savors diverse old classics in a mellow, reflective mood.', '#f5e6c8', 'high', 'high', 'high', 'old', 'positive', 'calm', 1.00),
  persona('The Restless Romantic', 'Draws passion from the drama and energy of timeless tracks.', '#7f1d1d', 'high', 'high', 'high', 'old', 'negative', 'energetic', 1.00),
  persona('The Sentimental Archivist', 'Immersed in melancholic golden-age hits, finding comfort in the past.', '#7c5a3a', 'high', 'high', 'high', 'old', 'negative', 'calm', 1.00),
  persona('The Playlist Hopper', "Constantly jumps through upbeat, popular new music—always chasing the next vibe.", '#ec4899', 'high', 'high', 'low', 'new', 'positive', 'energetic', 0.40),
  persona('The Easy Explorer', 'Samples fresh chart-toppers lightly; easygoing and mood-driven.', '#ffcba4', 'high', 'high', 'low', 'new', 'positive', 'calm', 1.00),
  persona('The Chaos Seeker', 'Finds catharsis in energetic, emotionally charged new hits.', '#dc2626', 'high', 'high', 'low', 'new', 'negative', 'energetic', 1.00),
  persona('The Moody Mixer', 'A quiet drifter between sad, modern playlists and chill genres.', '#6a5acd', 'high', 'high', 'low', 'new', 'negative', 'calm', 1.00),
  persona('The Retro Nomad', 'Dances between upbeat golden tracks of every genre.', '#c2410c', 'high', 'high', 'low', 'old', 'positive', 'energetic', 0.40),
  persona('The Gentle Nostalgic', 'Enjoys soft classic hits from varied genres with easy warmth.', '#e0c9a6', 'high', 'high', 'low', 'old', 'positive', 'calm', 1.00),
  persona('The Haunted DJ', 'Replays intense, emotional classics to relive the fire of the past.', '#5c1a35', 'high', 'high', 'low', 'old', 'negative', 'energetic', 0.80),
  persona('The Fading Wanderer', 'Wanders through wistful old tunes, lost in gentle melancholy.', '#9ca3af', 'high', 'high', 'low', 'old', 'negative', 'calm', 0.80),
  persona('The Indie Devotee', 'Loyal to select modern indie artists with high energy and spirit.', '#8b5cf6', 'high', 'low', 'high', 'new', 'positive', 'energetic', 1.00),
  persona('The Ambient Collector', 'Focused on calm, experimental modern sounds and sonic craftsmanship.', '#5eead4', 'high', 'low', 'high', 'new', 'positive', 'calm', 0.80),
  persona('The Subculture Rebel', 'Loyal to raw, underground acts that vent emotion and truth.', '#991b1b', 'high', 'low', 'high', 'new', 'negative', 'energetic', 1.00),
  persona('The Shadow Curator', 'Devoted to mellow, somber modern soundscapes from niche artists.', '#24344d', 'high', 'low', 'high', 'new', 'negative', 'calm', 1.00),
  persona('The Vintage Explorer', 'Travels through upbeat forgotten gems of old music.', '#b87333', 'high', 'low', 'high', 'old', 'positive', 'energetic', 1.00),
  persona('The Gentle Historian', 'Studies obscure classics for serenity and craft.', '#c9a227', 'high', 'low', 'high', 'old', 'positive', 'calm', 1.00),
  persona('The Underground Romantic', 'Channels emotion through rare, passionate old songs.', '#b7410e', 'high', 'low', 'high', 'old', 'negative', 'energetic', 1.00),
  persona('The Obscure Archivist', 'Carefully collects somber, forgotten treasures of the past.', '#4b2e1f', 'high', 'low', 'high', 'old', 'negative', 'calm', 1.00),
  persona('The Sonic Wanderer', 'Skims new underground energy scenes for fun and freedom.', '#2dd4bf', 'high', 'low', 'low', 'new', 'positive', 'energetic', 1.00),
  persona('The Modern Daydreamer', 'Casual listener drifting through niche calm sounds.', '#38bdf8', 'high', 'low', 'low', 'new', 'positive', 'calm', 0.80),
  persona('The Noise Nomad', 'Energetic seeker of emotional chaos in experimental new sounds.', '#ff1744', 'high', 'low', 'low', 'new', 'negative', 'energetic', 1.00),
  persona('The Fadeaway Listener', 'Soft, sad traveler through underground mellow genres.', '#d1d5db', 'high', 'low', 'low', 'new', 'negative', 'calm', 1.00),
  persona('The Eclectic Retrohead', 'Mixes lively, underappreciated old tracks across scenes.', '#f59e0b', 'high', 'low', 'low', 'old', 'positive', 'energetic', 0.60),
  persona('The Vinyl Drifter', 'Plays gentle, obscure classics for peaceful reflection.', '#fdf6e3', 'high', 'low', 'low', 'old', 'positive', 'calm', 1.00),
  persona('The Obscure Punk', 'Intense dive into forgotten, emotional old underground.', '#7f1d3d', 'high', 'low', 'low', 'old', 'negative', 'energetic', 0.80),
  persona('The Lost Listener', 'Softly nostalgic and withdrawn, cherishing emotional old sounds.', '#a1a1aa', 'high', 'low', 'low', 'old', 'negative', 'calm', 1.00),
  persona('The Pop Loyalist', 'Faithful to upbeat, mainstream modern icons.', '#ec4899', 'low', 'high', 'high', 'new', 'positive', 'energetic', 0.80),
  persona('The Chart Regular', 'Listens loyally to smooth new pop favorites for relaxation.', '#fda4af', 'low', 'high', 'high', 'new', 'positive', 'calm', 0.60),
  persona('The Modern Melancholic', 'Draws emotional fire from popular yet dark-tinged modern music.', '#d6336c', 'low', 'high', 'high', 'new', 'negative', 'energetic', 0.80),
  persona('The Brooding Fan', 'Listens to emotional, reflective pop favorites quietly.', '#6d5a8c', 'low', 'high', 'high', 'new', 'negative', 'calm', 0.80),
  persona('The Classic Loyalist', 'Passionate about golden-age hits, played with joy and devotion.', '#facc15', 'low', 'high', 'high', 'old', 'positive', 'energetic', 0.80),
  persona('The Vintage Devotee', 'Finds comfort in familiar old classics from a few beloved artists.', '#e8d5b7', 'low', 'high', 'high', 'old', 'positive', 'calm', 1.00),
  persona('The Dramatic Traditionalist', 'Relives the emotional power of intense, old hits.', '#5c1027', 'low', 'high', 'high', 'old', 'negative', 'energetic', 0.60),
  persona('The Melancholy Purist', 'Listens to soft, sorrowful classics on repeat.', '#8b6f47', 'low', 'high', 'high', 'old', 'negative', 'calm', 1.00),
  persona('The Mainstream Hopper', 'Always chasing the next upbeat hit without attachment.', '#fde047', 'low', 'high', 'low', 'new', 'positive', 'energetic', 0.60),
  persona('The Easy Listener', 'Casual with new pop hits, enjoys a relaxed routine.', '#fbcfe8', 'low', 'high', 'low', 'new', 'positive', 'calm', 1.00),
  persona('The Doom Dancer', 'Dives into dark, emotional modern hits with high energy.', '#dc2626', 'low', 'high', 'low', 'new', 'negative', 'energetic', 0.40),
  persona('The Lofi Drifter', 'Enjoys mellow, sad pop playlists without fixation.', '#9ca3af', 'low', 'high', 'low', 'new', 'negative', 'calm', 0.80),
  persona('The Retro Socialite', 'Celebrates cheerful, familiar old hits at every chance.', '#c81d3f', 'low', 'high', 'low', 'old', 'positive', 'energetic', 1.00),
  persona('The Classic Radio Fan', 'Relaxes to nostalgic radio staples and timeless tunes.', '#fefce8', 'low', 'high', 'low', 'old', 'positive', 'calm', 1.00),
  persona('The Torchbearer', 'Finds intensity in old heartbreak anthems; plays them loud.', '#722f37', 'low', 'high', 'low', 'old', 'negative', 'energetic', 0.40),
  persona('The Reflective Listener', 'Quietly listens to moody old hits to feel something true.', '#a8a29e', 'low', 'high', 'low', 'old', 'negative', 'calm', 1.00),
  persona('The Minimalist Creator', 'Loyal to a few optimistic modern indie acts; keeps things simple and strong.', '#06b6d4', 'low', 'low', 'high', 'new', 'positive', 'energetic', 0.80),
  persona('The Soft Collector', 'Attached to gentle, inspiring modern niche artists.', '#6ee7b7', 'low', 'low', 'high', 'new', 'positive', 'calm', 0.60),
  persona('The Niche Rebel', 'Devoted to dark, intense modern underground sounds.', '#991b1b', 'low', 'low', 'high', 'new', 'negative', 'energetic', 0.80),
  persona('The Shadow Follower', 'Faithful to moody modern acts with subtle emotional depth.', '#374151', 'low', 'low', 'high', 'new', 'negative', 'calm', 0.60),
  persona('The Revival Purist', 'Energized by obscure but uplifting classics.', '#b5a642', 'low', 'low', 'high', 'old', 'positive', 'energetic', 0.80),
  persona('The Vintage Collector', 'Treasures serene, old forgotten favorites.', '#ddd0b8', 'low', 'low', 'high', 'old', 'positive', 'calm', 0.40),
  persona('The Obscure Devotee', 'Loyal to powerful, tragic old underground artists.', '#5c0a1f', 'low', 'low', 'high', 'old', 'negative', 'energetic', 0.80),
  persona('The Preservationist', 'Keeps a quiet connection to emotional old music.', '#4b2e1f', 'low', 'low', 'high', 'old', 'negative', 'calm', 1.00),
  persona('The Curious Casual', 'Listens lightly to cheerful modern indies; uncommitted but open.', '#14b8a6', 'low', 'low', 'low', 'new', 'positive', 'energetic', 0.60),
  persona('The Gentle Dabbler', 'Occasional listener of soft, uplifting new songs.', '#bfdbfe', 'low', 'low', 'low', 'new', 'positive', 'calm', 0.40),
  persona('The Glitch Drifter', 'Dives into chaotic, dark modern sounds sporadically.', '#ff1744', 'low', 'low', 'low', 'new', 'negative', 'energetic', 0.80),
  persona('The Quiet Ghost', 'A withdrawn, infrequent listener of moody new music.', '#64748b', 'low', 'low', 'low', 'new', 'negative', 'calm', 0.80),
  persona('The Retro Casual', 'Plays light, happy old tracks occasionally for nostalgia.', '#fdba74', 'low', 'low', 'low', 'old', 'positive', 'energetic', 0.00),
  persona('The Soft Traditionalist', 'Comforts self with gentle, familiar old music.', '#f0e6d2', 'low', 'low', 'low', 'old', 'positive', 'calm', 0.80),
  persona('The Restless Historian', 'Visits emotional corners of old music without settling long.', '#a3402b', 'low', 'low', 'low', 'old', 'negative', 'energetic', 0.80),
  persona('The Fading Whisperer', 'Listens rarely, softly, and with longing for the past.', '#64748b', 'low', 'low', 'low', 'old', 'negative', 'calm', 0.60),
];

export interface PersonaInput {
  genreDiversity: Level;
  trackPopularity: Level;
  artistConsistency: Level;
  era: Era;
  valence: Valence;
  arousal: Arousal;
}

// Derive the 6 classification dimensions from real listening stats.
export function computePersonaInput(stats: Stats): PersonaInput {
  const { genreDiversity, averagePopularity } = stats.overview;
  const weighted = calculateWeightedVACRSScore(stats.genres);

  const eraTracks = stats.mode === 'playlist' ? stats.tracks.map(t => t.track) : stats.topTracks;
  const releaseYears = eraTracks
    .map(t => t.album?.release_date ? parseInt(t.album.release_date.slice(0, 4), 10) : NaN)
    .filter(year => !isNaN(year));
  const currentYear = new Date().getFullYear();
  const centerYear = releaseYears.length ? medianOf(releaseYears) : currentYear;

  return {
    genreDiversity: genreDiversity > PERSONA_THRESHOLDS.genreDiversityHighAbove ? 'high' : 'low',
    trackPopularity: averagePopularity > PERSONA_THRESHOLDS.popularityHighAbove ? 'high' : 'low',
    artistConsistency: topArtistShare(stats.artists) > PERSONA_THRESHOLDS.artistConsistencyWhenTopShareAbove ? 'high' : 'low',
    era: (currentYear - centerYear) <= PERSONA_THRESHOLDS.newEraWithinYears ? 'new' : 'old',
    valence: weighted.valence > PERSONA_THRESHOLDS.valencePositiveAbove ? 'positive' : 'negative',
    arousal: weighted.arousal > PERSONA_THRESHOLDS.arousalEnergeticAbove ? 'energetic' : 'calm',
  };
}

// The table above is a complete truth table (2^6 = 64 combinations), so an
// exact dimension match always exists.
export function classifyPersona(input: PersonaInput): Persona {
  const match = MUSIC_PERSONAS.find(p =>
    p.dimensions.genreDiversity === input.genreDiversity &&
    p.dimensions.trackPopularity === input.trackPopularity &&
    p.dimensions.artistConsistency === input.artistConsistency &&
    p.dimensions.era === input.era &&
    p.dimensions.valence === input.valence &&
    p.dimensions.arousal === input.arousal
  );
  return match ?? MUSIC_PERSONAS[0];
}

export function getUserPersona(stats: Stats): Persona {
  return classifyPersona(computePersonaInput(stats));
}

function medianOf(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Share of plays held by the most-played artists. One play each stays low. A few artists holding the list goes high. */
function topArtistShare(artists: { playCount: number }[], topCount = 5): number {
  const total = artists.reduce((sum, artist) => sum + artist.playCount, 0);
  if (total <= 0) return 0;
  const ranked = [...artists].sort((left, right) => right.playCount - left.playCount);
  const top = ranked.slice(0, topCount).reduce((sum, artist) => sum + artist.playCount, 0);
  return top / total;
}

/** Portrait set the app shows. The other tries sit beside it in `public/personas`. */
const PERSONA_PORTRAIT_STYLE = 'animal';

/** Hand-drawn portrait for a persona, served from `public/personas`. */
export function personaPortraitSrc(id: string): string {
  return `/personas/${PERSONA_PORTRAIT_STYLE}/${id}.jpg`;
}

// Maps a persona's dimensions onto the generative-art profile shape, so the
// same persona always renders the same abstract artwork.
export function personaToArtProfile(persona: Persona): ArtProfile {
  return {
    valence: persona.dimensions.valence === 'positive' ? 0.85 : 0.15,
    arousal: persona.dimensions.arousal === 'energetic' ? 0.85 : 0.15,
    complexity: persona.dimensions.genreDiversity === 'high' ? 0.85 : 0.15,
    rawness: persona.dimensions.trackPopularity === 'low' ? 0.85 : 0.15,
    socialPresence: persona.dimensions.artistConsistency === 'low' ? 0.85 : 0.15,
  };
}
