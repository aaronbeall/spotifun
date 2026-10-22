import { Stats, GenreStats, DataMode, TimeRange } from '@/types';
import { FlowTrack, getTopGenres } from '@/components/features/FlowStreamChart';

/**
 * Generate a dynamic caption for the Flow visualization based on actual data trends
 */
export function generateFlowCaption(
  tracks: FlowTrack[],
  mode: DataMode,
  chartMode: 'genres' | 'traits' | 'vibes'
): string {
  if (!tracks || tracks.length < 5) {
    return chartMode === 'genres'
      ? 'Your listening flow over time.'
      : chartMode === 'traits'
      ? 'Your music trait evolution over time.'
      : 'Your vibe progression over time.';
  }

  if (chartMode === 'genres') {
    return generateGenreFlowCaption(tracks, mode);
  } else if (chartMode === 'traits') {
    return "Shows how your music traits (valence, arousal, complexity, rawness, social presence) shift over time.";
  } else {
    return "Tracks which named vibes (like Energetic Party or Chill Introspective) best match your evolving taste.";
  }
}

function generateGenreFlowCaption(tracks: FlowTrack[], mode: DataMode): string {
  const topGenres = getTopGenres(tracks);
  
  if (topGenres.length === 0) {
    return 'Your genre distribution over time.';
  }

  // Count genre occurrences for distribution analysis
  const genreCounts = new Map<string, number>();
  tracks.forEach(t => {
    (t.genres || []).forEach(g => genreCounts.set(g, (genreCounts.get(g) || 0) + 1));
  });

  // Analyze early vs late distribution
  const thirdMark = Math.floor(tracks.length / 3);
  const earlyTracks = tracks.slice(0, thirdMark);
  const lateTracks = tracks.slice(-thirdMark);

  const earlyGenres = getTopGenres(earlyTracks);
  const lateGenres = getTopGenres(lateTracks);

  // Find dominant genres
  const dominantGenre = topGenres[0];
  const secondGenre = topGenres[1];

  // Check for shifts
  const earlyDominant = earlyGenres[0];
  const lateDominant = lateGenres[0];

  if (earlyDominant && lateDominant && earlyDominant !== lateDominant) {
    return `${capitalize(earlyDominant)} dominated early, then ${lateDominant} took over in your ${mode === 'recent' ? 'last plays' : 'top tracks'}.`;
  }

  // Check for consistency
  const topCount = genreCounts.get(dominantGenre) || 0;
  const secondCount = genreCounts.get(secondGenre || '') || 0;
  
  if (topGenres.length === 1 || (topCount > secondCount * 2)) {
    return `Heavily focused on ${dominantGenre}, showing strong consistency ${mode === 'recent' ? 'recently' : 'in this period'}.`;
  }

  // Check for diversity
  if (topGenres.length >= 4) {
    const topThree = topGenres.slice(0, 3);
    return `Diverse listening across ${topThree.slice(0, -1).join(', ')}, and ${topThree[topThree.length - 1]}.`;
  }

  // Default to two-genre split
  if (secondGenre) {
    const ratio = Math.round((topCount / (topCount + secondCount)) * 100);
    return `Split ${ratio}% ${dominantGenre}, ${100 - ratio}% ${secondGenre} ${mode === 'recent' ? 'recently' : 'in your top plays'}.`;
  }

  return `Your genre flow ${mode === 'recent' ? 'over recent plays' : 'across top tracks'}.`;
}

/**
 * Generate a dynamic caption for the Vibe visualization
 */
export function generateVibeCaption(
  stats: Stats,
  topGenre: string | undefined
): string {
  const mode = stats.mode;
  const isTopMode = mode !== 'recent';
  
  if (!topGenre) {
    return isTopMode 
      ? 'Your musical personality based on top listening patterns.'
      : 'Your current musical personality based on recent listening.';
  }

  const genreCount = stats.genres.length;
  
  if (genreCount <= 2) {
    return isTopMode
      ? `Focused listening centered on ${topGenre}.`
      : `Your recent plays are centered on ${topGenre}.`;
  }

  if (genreCount >= 8) {
    return isTopMode
      ? `Eclectic taste spanning ${genreCount} genres, with ${topGenre} leading.`
      : `Wide-ranging recent listening across ${genreCount} genres, led by ${topGenre}.`;
  }

  return isTopMode
    ? `${capitalize(topGenre)} leads your top genres, alongside ${genreCount - 1} others.`
    : `${capitalize(topGenre)} is trending in your recent plays, mixed with ${genreCount - 1} other genres.`;
}

/**
 * Generate a dynamic caption for the Spectrum visualization
 * Describes the trait spread (range score) and which traits vary most/least
 */
export function generateSpectrumCaption(stats: Stats): string {
  const mode = stats.mode;
  const isTopMode = mode !== 'recent';
  
  if (stats.genres.length === 0) {
    return 'Your music spectrum across emotional and sonic dimensions.';
  }

  // Analyze the trait spreads from the stats
  // For now, provide general insights based on the data structure
  const genreCount = stats.genres.length;
  
  if (genreCount === 1) {
    return isTopMode
      ? 'Single genre shows focused trait profile.'
      : 'Recent plays show a focused trait profile.';
  }

  if (genreCount === 2) {
    return isTopMode
      ? 'Two genres create contrast across valence and energy dimensions.'
      : 'Recent genres show contrasting emotional and sonic traits.';
  }

  if (genreCount >= 10) {
    return isTopMode
      ? `Wide trait variation: ${genreCount} genres span from calm to energetic, simple to complex, creating rich sonic diversity.`
      : `Recent listening spans a wide sonic range: ${genreCount} genres vary from mellow to intense, raw to polished.`;
  }

  // Medium genre count (3-9)
  return isTopMode
    ? `${genreCount} genres spread across valence, energy, and complexity dimensions, showing balanced sonic exploration.`
    : `Recent ${genreCount} genres vary across mood, energy, and production style, creating moderate trait range.`;
}

/**
 * Generate a dynamic caption for the Popularity visualization
 */
export function generatePopularityCaption(stats: Stats): string {
  const avg = stats.overview.averagePopularity;
  const trackCount = stats.tracks.length;
  const mode = stats.mode;
  const isTopMode = mode !== 'recent';

  if (trackCount === 0) {
    return 'Your balance between mainstream and niche tracks.';
  }

  // Get popularity distribution
  const nicheTracks = stats.tracks.filter(t => (t.track.popularity || 0) < 40).length;
  const mainstreamTracks = stats.tracks.filter(t => (t.track.popularity || 0) >= 70).length;
  const nichePercent = Math.round((nicheTracks / trackCount) * 100);
  const mainstreamPercent = Math.round((mainstreamTracks / trackCount) * 100);

  if (avg >= 70) {
    return isTopMode
      ? `${mainstreamPercent}% mainstream hits dominate your top tracks.`
      : `${mainstreamPercent}% mainstream tracks in your recent plays.`;
  }

  if (avg <= 35) {
    return isTopMode
      ? `Deep dive into niche music: ${nichePercent}% of top tracks are under the radar.`
      : `Underground focus: ${nichePercent}% of recent plays are niche tracks.`;
  }

  if (mainstreamPercent > nichePercent + 20) {
    return isTopMode
      ? `Mainstream-leaning (${avg}% avg) with ${mainstreamPercent}% popular tracks.`
      : `Leaning mainstream recently: ${mainstreamPercent}% popular, ${nichePercent}% niche.`;
  }

  if (nichePercent > mainstreamPercent + 20) {
    return isTopMode
      ? `Niche-leaning (${avg}% avg) with ${nichePercent}% underground picks.`
      : `Digging deeper recently: ${nichePercent}% niche vs ${mainstreamPercent}% mainstream.`;
  }

  return isTopMode
    ? `Balanced mix: ${mainstreamPercent}% mainstream, ${nichePercent}% niche (${avg}% avg).`
    : `Even split recently: ${mainstreamPercent}% mainstream, ${nichePercent}% niche.`;
}

/**
 * Generate a dynamic caption for the Persona visualization
 */
export function generatePersonaCaption(stats: Stats): string {
  const mode = stats.mode;
  const isTopMode = mode !== 'recent';
  const artistCount = stats.artists.length;
  const trackCount = stats.tracks.length;
  const artistDiversity = Math.round(stats.overview.artistDiversity * 100);

  if (artistDiversity >= 80) {
    return isTopMode
      ? `Explorer: wide-ranging taste across ${artistCount} artists in your top listening.`
      : `Explorer mindset: sampling ${artistCount} different artists recently.`;
  }

  if (artistDiversity <= 30) {
    return isTopMode
      ? `Loyalist: focused dedication to ${artistCount} core artists.`
      : `Loyalist: sticking with ${artistCount} favorite artists recently.`;
  }

  const avgTracksPerArtist = trackCount / artistCount;
  if (avgTracksPerArtist >= 3) {
    return isTopMode
      ? `Deep listener: averaging ${Math.round(avgTracksPerArtist)} tracks per artist in your top ${artistCount}.`
      : `Album diver: averaging ${Math.round(avgTracksPerArtist)} tracks per artist recently.`;
  }

  return isTopMode
    ? `Balanced curation across ${artistCount} artists with ${trackCount} tracks.`
    : `Varied rotation: ${artistCount} artists across ${trackCount} recent plays.`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
