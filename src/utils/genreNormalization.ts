/**
 * Genre String Normalization
 * 
 * Utilities for normalizing genre strings to improve matching accuracy.
 * Handles case, punctuation, diacritics, and common variations.
 */

/**
 * Alias table for common genre variations
 * Maps non-standard spellings to canonical forms
 */
const GENRE_ALIASES: Record<string, string> = {
  // Ampersand variations
  'r&b': 'r and b',
  'drum&bass': 'drum and bass',
  'd&b': 'drum and bass',
  
  // Hyphen/space variations
  'hip-hop': 'hip hop',
  'drum-and-bass': 'drum and bass',
  'drum-n-bass': 'drum and bass',
  'trip-hop': 'trip hop',
  'synth-pop': 'synth pop',
  'electro-pop': 'electro pop',
  'dance-pop': 'dance pop',
  'indie-pop': 'indie pop',
  'indie-rock': 'indie rock',
  'post-punk': 'post punk',
  'post-rock': 'post rock',
  'neo-soul': 'neo soul',
  'avant-garde': 'avant garde',
  'alt-rock': 'alternative rock',
  'art-pop': 'art pop',
  'pop-rock': 'pop rock',
  'pop-punk': 'pop punk',
  'prog-rock': 'prog rock',
  
  // No-space variations
  'hiphop': 'hip hop',
  'drumandbass': 'drum and bass',
  'triphop': 'trip hop',
  'synthpop': 'synth pop',
  'electropop': 'electro pop',
  'dancepop': 'dance pop',
  'indiepop': 'indie pop',
  'indierock': 'indie rock',
  'postpunk': 'post punk',
  'postrock': 'post rock',
  'neosoul': 'neo soul',
  'avantgarde': 'avant garde',
  'altrock': 'alternative rock',
  'artpop': 'art pop',
  'poprock': 'pop rock',
  'poppunk': 'pop punk',
  'progrock': 'prog rock',
  'hardrock': 'hard rock',
  'softrock': 'soft rock',
  'deathmetal': 'death metal',
  'blackmetal': 'black metal',
  'doommetal': 'doom metal',
  'thrashmetal': 'thrash metal',
  'powermetal': 'power metal',
  'dreampop': 'dream pop',
  'bedrompop': 'bedroom pop',
  'garagerock': 'garage rock',
  'psychrock': 'psychedelic rock',
  'jazzfusion': 'jazz fusion',
  'smoothjazz': 'smooth jazz',
  'freejazz': 'free jazz',
  'deephouse': 'deep house',
  'techhouse': 'tech house',
  'proghouse': 'progressive house',
  'electrohouse': 'electro house',
  'tropicalhouse': 'tropical house',
  'futurebass': 'future bass',
  'cloudrap': 'cloud rap',
  'emorap': 'emo rap',
  'ukdrill': 'uk drill',
  'bossanova': 'bossa nova',
  'latinpop': 'latin pop',
  
  // Common abbreviations
  'dnb': 'drum and bass',
  'edm': 'electronic dance music',
  'rnb': 'r and b',
  'kpop': 'k-pop',
  'jpop': 'j-pop',
  'uk drill': 'uk drill',
  
  // Spelling variations
  'reggaeton': 'reggaeton',
  'reggaetón': 'reggaeton',
  'afrobeat': 'afrobeats',
  'afro beat': 'afrobeats',
  'afro beats': 'afrobeats',
  
  // Alternative names
  'rhythm and blues': 'r and b',
  'rhythm & blues': 'r and b',
  'electronic dance music': 'electronic',
  'metal core': 'metalcore',
  'death core': 'deathcore',
  'be-bop': 'bebop',
  'be bop': 'bebop',
  'jungle': 'drum and bass',
  'garage': 'garage rock',
  'lofi': 'lo-fi',
  'lo fi': 'lo-fi',
  'chillhop': 'lo-fi',
  'lofi hip hop': 'lo-fi',
  'lo-fi hip hop': 'lo-fi',
  'alternative': 'alternative rock',
  'alt': 'alternative rock',
  'indie': 'indie rock',
  'psych': 'psychedelic',
  'psychedelia': 'psychedelic',
  'prog': 'prog rock',
  'goth': 'gothic',
  'gothic': 'goth',
  'gothic rock': 'goth',
};

/**
 * Remove diacritics from a string
 * Example: "café" -> "cafe", "naïve" -> "naive"
 */
function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normalize a genre string for matching
 * 
 * Steps:
 * 1. Convert to lowercase
 * 2. Remove diacritics
 * 3. Replace '&' with 'and'
 * 4. Normalize hyphens and spaces
 * 5. Apply alias table
 * 6. Trim whitespace
 * 
 * @param genre - The genre string to normalize
 * @returns Normalized genre string
 */
export function normalizeGenre(genre: string): string {
  if (!genre || typeof genre !== 'string') {
    return '';
  }
  
  // Step 1: Lowercase and trim
  let normalized = genre.toLowerCase().trim();
  
  // Step 2: Remove diacritics
  normalized = removeDiacritics(normalized);
  
  // Step 3: Replace '&' with 'and'
  normalized = normalized.replace(/\s*&\s*/g, ' and ');
  
  // Step 4: Normalize multiple spaces to single space
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Step 5: Apply alias table
  if (GENRE_ALIASES[normalized]) {
    normalized = GENRE_ALIASES[normalized];
  }
  
  // Step 6: Final trim
  normalized = normalized.trim();
  
  return normalized;
}

/**
 * Split a genre string into individual genres
 * Handles various separators: comma, slash, 'and', '&'
 * 
 * @param genreString - The genre string to split
 * @returns Array of normalized individual genres
 */
export function splitGenres(genreString: string): string[] {
  if (!genreString || typeof genreString !== 'string') {
    return [];
  }
  
  // Split by common separators: comma, slash, 'and', '&'
  const parts = genreString
    .split(/[,\/]|\s+and\s+|\s*&\s+/)
    .map(part => normalizeGenre(part))
    .filter(part => part.length > 0);
  
  return parts;
}

/**
 * Extract the last word from a genre string
 * Used for fallback matching (e.g., "uk drill" -> "drill")
 * 
 * @param genre - The genre string
 * @returns The last word, or empty string
 */
export function getLastWord(genre: string): string {
  const words = genre.trim().split(/\s+/);
  return words.length > 0 ? words[words.length - 1] : '';
}

/**
 * Check if a term contains another term as a whole word
 * Avoids false positives like "rap" matching "trap"
 * 
 * @param haystack - The string to search in
 * @param needle - The term to search for
 * @returns True if needle is found as a whole word in haystack
 */
export function containsWholeWord(haystack: string, needle: string): boolean {
  if (!haystack || !needle) {
    return false;
  }
  
  // Create regex for whole word matching
  // \b = word boundary
  const regex = new RegExp(`\\b${escapeRegex(needle)}\\b`, 'i');
  return regex.test(haystack);
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get the longest matching genre from a list
 * Used to prefer more specific matches over general ones
 * 
 * @param genre - The genre to match against
 * @param candidates - List of candidate genre strings
 * @returns The longest matching candidate, or undefined
 */
export function getLongestMatch(genre: string, candidates: string[]): string | undefined {
  const matches = candidates.filter(candidate => 
    containsWholeWord(genre, candidate)
  );
  
  if (matches.length === 0) {
    return undefined;
  }
  
  // Sort by length descending and return the longest
  matches.sort((a, b) => b.length - a.length);
  return matches[0];
}
