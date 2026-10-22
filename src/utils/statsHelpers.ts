/**
 * Diversity and statistical calculation helpers
 * These functions calculate diversity metrics used in the stats overview
 */

/**
 * Calculates genre diversity as the ratio of unique genres to total genres
 * @param uniqueGenres - Number of unique genres listened to
 * @param totalGenres - Total number of genre tags across all artists
 * @returns A diversity score between 0 and 1, where higher means more diverse
 */
export function calculateGenreDiversity(
  uniqueGenres: number,
  totalGenres: number
): number {
  return uniqueGenres / Math.max(totalGenres, 1);
}

/**
 * Calculates artist diversity as the ratio of unique artists to total plays
 * @param uniqueArtists - Number of unique artists listened to
 * @param totalPlays - Total number of plays
 * @returns A diversity score between 0 and 1, where higher means more diverse
 */
export function calculateArtistDiversity(
  uniqueArtists: number,
  totalPlays: number
): number {
  return uniqueArtists / Math.max(totalPlays, 1);
}

/**
 * Calculates average session length in minutes
 * @param totalDuration - Total listening duration in milliseconds
 * @param totalPlays - Total number of plays
 * @returns Average session length in minutes
 */
export function calculateAverageSessionLength(
  totalDuration: number,
  totalPlays: number
): number {
  return totalDuration / totalPlays / 60000; // Convert ms to minutes
}

/**
 * Calculates average track popularity from play history
 * @param tracks - Array of tracks with popularity scores (0-100)
 * @returns Average popularity rounded to nearest integer
 */
export function calculateAveragePopularity(
  tracks: Array<{ popularity?: number | null }>
): number {
  if (tracks.length === 0) return 0;
  
  const totalPopularity = tracks.reduce(
    (sum, track) => sum + (track.popularity || 0),
    0
  );
  
  return Math.round(totalPopularity / tracks.length);
}
