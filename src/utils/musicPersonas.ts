import { Stats } from '@/types';
import { calculateWeightedVACRSScore } from './musicClassification';

export type Level = 'high' | 'low';
export type Era = 'new' | 'old';
export type Valence = 'positive' | 'negative';
export type Arousal = 'energetic' | 'calm';

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
  arousal: Arousal
): Persona {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    name,
    description,
    color,
    dimensions: { genreDiversity, trackPopularity, artistConsistency, era, valence, arousal },
  };
}

// Complete truth table: every combination of the 6 binary/ternary dimensions
// (2 x 2 x 2 x 2 x 2 x 2 = 64) maps to exactly one named persona.
export const MUSIC_PERSONAS: Persona[] = [
  persona('The Trend Voyager', 'Explores modern hits across genres but sticks to favorite stars. Loves energy and discovery.', '#22d3ee', 'high', 'high', 'high', 'new', 'positive', 'energetic'),
  persona('The Chill Curator', 'Enjoys diverse modern hits but prefers smooth, relaxed sounds.', '#86efac', 'high', 'high', 'high', 'new', 'positive', 'calm'),
  persona('The Electric Escapist', 'Channels emotion through upbeat new tracks across many genres.', '#d6336c', 'high', 'high', 'high', 'new', 'negative', 'energetic'),
  persona('The Reflective Dreamer', 'Listens to melancholy modern hits with genre variety but emotional depth.', '#93c5fd', 'high', 'high', 'high', 'new', 'negative', 'calm'),
  persona('The Golden Revivalist', 'Reignites classic hits from many eras, full of nostalgia and rhythm.', '#eab308', 'high', 'high', 'high', 'old', 'positive', 'energetic'),
  persona('The Vintage Enthusiast', 'Savors diverse old classics in a mellow, reflective mood.', '#f5e6c8', 'high', 'high', 'high', 'old', 'positive', 'calm'),
  persona('The Restless Romantic', 'Draws passion from the drama and energy of timeless tracks.', '#7f1d1d', 'high', 'high', 'high', 'old', 'negative', 'energetic'),
  persona('The Sentimental Archivist', 'Immersed in melancholic golden-age hits, finding comfort in the past.', '#7c5a3a', 'high', 'high', 'high', 'old', 'negative', 'calm'),
  persona('The Playlist Hopper', "Constantly jumps through upbeat, popular new music—always chasing the next vibe.", '#ec4899', 'high', 'high', 'low', 'new', 'positive', 'energetic'),
  persona('The Easy Explorer', 'Samples fresh chart-toppers lightly; easygoing and mood-driven.', '#ffcba4', 'high', 'high', 'low', 'new', 'positive', 'calm'),
  persona('The Chaos Seeker', 'Finds catharsis in energetic, emotionally charged new hits.', '#dc2626', 'high', 'high', 'low', 'new', 'negative', 'energetic'),
  persona('The Moody Mixer', 'A quiet drifter between sad, modern playlists and chill genres.', '#6a5acd', 'high', 'high', 'low', 'new', 'negative', 'calm'),
  persona('The Retro Nomad', 'Dances between upbeat golden tracks of every genre.', '#c2410c', 'high', 'high', 'low', 'old', 'positive', 'energetic'),
  persona('The Gentle Nostalgic', 'Enjoys soft classic hits from varied genres with easy warmth.', '#e0c9a6', 'high', 'high', 'low', 'old', 'positive', 'calm'),
  persona('The Haunted DJ', 'Replays intense, emotional classics to relive the fire of the past.', '#5c1a35', 'high', 'high', 'low', 'old', 'negative', 'energetic'),
  persona('The Fading Wanderer', 'Wanders through wistful old tunes, lost in gentle melancholy.', '#9ca3af', 'high', 'high', 'low', 'old', 'negative', 'calm'),
  persona('The Indie Devotee', 'Loyal to select modern indie artists with high energy and spirit.', '#8b5cf6', 'high', 'low', 'high', 'new', 'positive', 'energetic'),
  persona('The Ambient Collector', 'Focused on calm, experimental modern sounds and sonic craftsmanship.', '#5eead4', 'high', 'low', 'high', 'new', 'positive', 'calm'),
  persona('The Subculture Rebel', 'Loyal to raw, underground acts that vent emotion and truth.', '#991b1b', 'high', 'low', 'high', 'new', 'negative', 'energetic'),
  persona('The Shadow Curator', 'Devoted to mellow, somber modern soundscapes from niche artists.', '#24344d', 'high', 'low', 'high', 'new', 'negative', 'calm'),
  persona('The Vintage Explorer', 'Travels through upbeat forgotten gems of old music.', '#b87333', 'high', 'low', 'high', 'old', 'positive', 'energetic'),
  persona('The Gentle Historian', 'Studies obscure classics for serenity and craft.', '#c9a227', 'high', 'low', 'high', 'old', 'positive', 'calm'),
  persona('The Underground Romantic', 'Channels emotion through rare, passionate old songs.', '#b7410e', 'high', 'low', 'high', 'old', 'negative', 'energetic'),
  persona('The Obscure Archivist', 'Carefully collects somber, forgotten treasures of the past.', '#4b2e1f', 'high', 'low', 'high', 'old', 'negative', 'calm'),
  persona('The Sonic Wanderer', 'Skims new underground energy scenes for fun and freedom.', '#2dd4bf', 'high', 'low', 'low', 'new', 'positive', 'energetic'),
  persona('The Modern Daydreamer', 'Casual listener drifting through niche calm sounds.', '#38bdf8', 'high', 'low', 'low', 'new', 'positive', 'calm'),
  persona('The Noise Nomad', 'Energetic seeker of emotional chaos in experimental new sounds.', '#ff1744', 'high', 'low', 'low', 'new', 'negative', 'energetic'),
  persona('The Fadeaway Listener', 'Soft, sad traveler through underground mellow genres.', '#d1d5db', 'high', 'low', 'low', 'new', 'negative', 'calm'),
  persona('The Eclectic Retrohead', 'Mixes lively, underappreciated old tracks across scenes.', '#f59e0b', 'high', 'low', 'low', 'old', 'positive', 'energetic'),
  persona('The Vinyl Drifter', 'Plays gentle, obscure classics for peaceful reflection.', '#fdf6e3', 'high', 'low', 'low', 'old', 'positive', 'calm'),
  persona('The Obscure Punk', 'Intense dive into forgotten, emotional old underground.', '#7f1d3d', 'high', 'low', 'low', 'old', 'negative', 'energetic'),
  persona('The Lost Listener', 'Softly nostalgic and withdrawn, cherishing emotional old sounds.', '#a1a1aa', 'high', 'low', 'low', 'old', 'negative', 'calm'),
  persona('The Pop Loyalist', 'Faithful to upbeat, mainstream modern icons.', '#ec4899', 'low', 'high', 'high', 'new', 'positive', 'energetic'),
  persona('The Chart Regular', 'Listens loyally to smooth new pop favorites for relaxation.', '#fda4af', 'low', 'high', 'high', 'new', 'positive', 'calm'),
  persona('The Modern Melancholic', 'Draws emotional fire from popular yet dark-tinged modern music.', '#d6336c', 'low', 'high', 'high', 'new', 'negative', 'energetic'),
  persona('The Brooding Fan', 'Listens to emotional, reflective pop favorites quietly.', '#6d5a8c', 'low', 'high', 'high', 'new', 'negative', 'calm'),
  persona('The Classic Loyalist', 'Passionate about golden-age hits, played with joy and devotion.', '#facc15', 'low', 'high', 'high', 'old', 'positive', 'energetic'),
  persona('The Vintage Devotee', 'Finds comfort in familiar old classics from a few beloved artists.', '#e8d5b7', 'low', 'high', 'high', 'old', 'positive', 'calm'),
  persona('The Dramatic Traditionalist', 'Relives the emotional power of intense, old hits.', '#5c1027', 'low', 'high', 'high', 'old', 'negative', 'energetic'),
  persona('The Melancholy Purist', 'Listens to soft, sorrowful classics on repeat.', '#8b6f47', 'low', 'high', 'high', 'old', 'negative', 'calm'),
  persona('The Mainstream Hopper', 'Always chasing the next upbeat hit without attachment.', '#fde047', 'low', 'high', 'low', 'new', 'positive', 'energetic'),
  persona('The Easy Listener', 'Casual with new pop hits, enjoys a relaxed routine.', '#fbcfe8', 'low', 'high', 'low', 'new', 'positive', 'calm'),
  persona('The Doom Dancer', 'Dives into dark, emotional modern hits with high energy.', '#dc2626', 'low', 'high', 'low', 'new', 'negative', 'energetic'),
  persona('The Lofi Drifter', 'Enjoys mellow, sad pop playlists without fixation.', '#9ca3af', 'low', 'high', 'low', 'new', 'negative', 'calm'),
  persona('The Retro Socialite', 'Celebrates cheerful, familiar old hits at every chance.', '#c81d3f', 'low', 'high', 'low', 'old', 'positive', 'energetic'),
  persona('The Classic Radio Fan', 'Relaxes to nostalgic radio staples and timeless tunes.', '#fefce8', 'low', 'high', 'low', 'old', 'positive', 'calm'),
  persona('The Torchbearer', 'Finds intensity in old heartbreak anthems; plays them loud.', '#722f37', 'low', 'high', 'low', 'old', 'negative', 'energetic'),
  persona('The Reflective Listener', 'Quietly listens to moody old hits to feel something true.', '#a8a29e', 'low', 'high', 'low', 'old', 'negative', 'calm'),
  persona('The Minimalist Creator', 'Loyal to a few optimistic modern indie acts; keeps things simple and strong.', '#06b6d4', 'low', 'low', 'high', 'new', 'positive', 'energetic'),
  persona('The Soft Collector', 'Attached to gentle, inspiring modern niche artists.', '#6ee7b7', 'low', 'low', 'high', 'new', 'positive', 'calm'),
  persona('The Niche Rebel', 'Devoted to dark, intense modern underground sounds.', '#991b1b', 'low', 'low', 'high', 'new', 'negative', 'energetic'),
  persona('The Shadow Follower', 'Faithful to moody modern acts with subtle emotional depth.', '#374151', 'low', 'low', 'high', 'new', 'negative', 'calm'),
  persona('The Revival Purist', 'Energized by obscure but uplifting classics.', '#b5a642', 'low', 'low', 'high', 'old', 'positive', 'energetic'),
  persona('The Vintage Collector', 'Treasures serene, old forgotten favorites.', '#ddd0b8', 'low', 'low', 'high', 'old', 'positive', 'calm'),
  persona('The Obscure Devotee', 'Loyal to powerful, tragic old underground artists.', '#5c0a1f', 'low', 'low', 'high', 'old', 'negative', 'energetic'),
  persona('The Preservationist', 'Keeps a quiet connection to emotional old music.', '#4b2e1f', 'low', 'low', 'high', 'old', 'negative', 'calm'),
  persona('The Curious Casual', 'Listens lightly to cheerful modern indies; uncommitted but open.', '#14b8a6', 'low', 'low', 'low', 'new', 'positive', 'energetic'),
  persona('The Gentle Dabbler', 'Occasional listener of soft, uplifting new songs.', '#bfdbfe', 'low', 'low', 'low', 'new', 'positive', 'calm'),
  persona('The Glitch Drifter', 'Dives into chaotic, dark modern sounds sporadically.', '#ff1744', 'low', 'low', 'low', 'new', 'negative', 'energetic'),
  persona('The Quiet Ghost', 'A withdrawn, infrequent listener of moody new music.', '#64748b', 'low', 'low', 'low', 'new', 'negative', 'calm'),
  persona('The Retro Casual', 'Plays light, happy old tracks occasionally for nostalgia.', '#fdba74', 'low', 'low', 'low', 'old', 'positive', 'energetic'),
  persona('The Soft Traditionalist', 'Comforts self with gentle, familiar old music.', '#f0e6d2', 'low', 'low', 'low', 'old', 'positive', 'calm'),
  persona('The Restless Historian', 'Visits emotional corners of old music without settling long.', '#a3402b', 'low', 'low', 'low', 'old', 'negative', 'energetic'),
  persona('The Fading Whisperer', 'Listens rarely, softly, and with longing for the past.', '#64748b', 'low', 'low', 'low', 'old', 'negative', 'calm'),
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
  const { genreDiversity, averagePopularity, artistDiversity } = stats.overview;
  const weighted = calculateWeightedVACRSScore(stats.genres);

  const releaseYears = stats.topTracks
    .map(t => t.album?.release_date ? parseInt(t.album.release_date.slice(0, 4), 10) : NaN)
    .filter(year => !isNaN(year));
  const currentYear = new Date().getFullYear();
  const avgYear = releaseYears.length
    ? releaseYears.reduce((sum, y) => sum + y, 0) / releaseYears.length
    : currentYear;

  return {
    genreDiversity: genreDiversity > 0.5 ? 'high' : 'low',
    trackPopularity: averagePopularity > 50 ? 'high' : 'low',
    // Low artist diversity means the listener returns to the same artists often (high consistency)
    artistConsistency: artistDiversity < 0.5 ? 'high' : 'low',
    era: (currentYear - avgYear) <= 5 ? 'new' : 'old',
    valence: weighted.valence > 0.5 ? 'positive' : 'negative',
    arousal: weighted.arousal > 0.5 ? 'energetic' : 'calm',
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
