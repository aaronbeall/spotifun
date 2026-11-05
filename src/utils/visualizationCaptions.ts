import { Stats, DataMode } from '@/types';
import { FlowTrack, getTopGenres } from '@/components/features/FlowStreamChart';

function byMode(mode: DataMode, copy: { recent: string; top: string; playlist: string }): string {
  if (mode === 'playlist') return copy.playlist;
  if (mode === 'recent') return copy.recent;
  return copy.top;
}

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
    return `${capitalize(earlyDominant)} dominated early, then ${lateDominant} took over ${byMode(mode, {
      recent: 'in your last plays',
      top: 'in your top tracks',
      playlist: 'in this playlist',
    })}.`;
  }

  // Check for consistency
  const topCount = genreCounts.get(dominantGenre) || 0;
  const secondCount = genreCounts.get(secondGenre || '') || 0;
  
  if (topGenres.length === 1 || (topCount > secondCount * 2)) {
    return `Heavily focused on ${dominantGenre}, showing strong consistency ${byMode(mode, {
      recent: 'recently',
      top: 'in this period',
      playlist: 'in this playlist',
    })}.`;
  }

  // Check for diversity
  if (topGenres.length >= 4) {
    const topThree = topGenres.slice(0, 3);
    return `Diverse listening across ${topThree.slice(0, -1).join(', ')}, and ${topThree[topThree.length - 1]}.`;
  }

  // Default to two-genre split
  if (secondGenre) {
    const ratio = Math.round((topCount / (topCount + secondCount)) * 100);
    return `Split ${ratio}% ${dominantGenre}, ${100 - ratio}% ${secondGenre} ${byMode(mode, {
      recent: 'recently',
      top: 'in your top plays',
      playlist: 'in this playlist',
    })}.`;
  }

  return `Your genre flow ${byMode(mode, {
    recent: 'over recent plays',
    top: 'across top tracks',
    playlist: 'across this playlist',
  })}.`;
}

/**
 * Generate a dynamic caption for the Vibe visualization
 */
export function generateVibeCaption(
  stats: Stats,
  topGenre: string | undefined
): string {
  const mode = stats.mode;

  if (!topGenre) {
    return byMode(mode, {
      top: 'Your musical personality based on top listening patterns.',
      recent: 'Your current musical personality based on recent listening.',
      playlist: 'Your musical personality based on this playlist.',
    });
  }

  const genreCount = stats.genres.length;
  
  if (genreCount <= 2) {
    return byMode(mode, {
      top: `Focused listening centered on ${topGenre}.`,
      recent: `Your recent plays are centered on ${topGenre}.`,
      playlist: `This playlist is centered on ${topGenre}.`,
    });
  }

  if (genreCount >= 8) {
    return byMode(mode, {
      top: `Eclectic taste spanning ${genreCount} genres, with ${topGenre} leading.`,
      recent: `Wide-ranging recent listening across ${genreCount} genres, led by ${topGenre}.`,
      playlist: `This playlist spans ${genreCount} genres, with ${topGenre} leading.`,
    });
  }

  return byMode(mode, {
    top: `${capitalize(topGenre)} leads your top genres, alongside ${genreCount - 1} others.`,
    recent: `${capitalize(topGenre)} is trending in your recent plays, mixed with ${genreCount - 1} other genres.`,
    playlist: `${capitalize(topGenre)} leads this playlist, alongside ${genreCount - 1} other genres.`,
  });
}

/**
 * Generate a dynamic caption for the Spectrum visualization
 * Describes the trait spread (range score) and which traits vary most/least
 */
export function generateSpectrumCaption(stats: Stats): string {
  const mode = stats.mode;

  if (stats.genres.length === 0) {
    return mode === 'playlist'
      ? 'This playlist has no genres to place on the spectrum.'
      : 'Your music spectrum across emotional and sonic dimensions.';
  }

  // Analyze the trait spreads from the stats
  // For now, provide general insights based on the data structure
  const genreCount = stats.genres.length;
  
  if (genreCount === 1) {
    return byMode(mode, {
      top: 'Single genre shows focused trait profile.',
      recent: 'Recent plays show a focused trait profile.',
      playlist: 'This playlist shows a focused trait profile.',
    });
  }

  if (genreCount === 2) {
    return byMode(mode, {
      top: 'Two genres create contrast across valence and energy dimensions.',
      recent: 'Recent genres show contrasting emotional and sonic traits.',
      playlist: 'Two genres in this playlist contrast across valence and energy.',
    });
  }

  if (genreCount >= 10) {
    return byMode(mode, {
      top: `Wide trait variation: ${genreCount} genres span from calm to energetic, simple to complex, creating rich sonic diversity.`,
      recent: `Recent listening spans a wide sonic range: ${genreCount} genres vary from mellow to intense, raw to polished.`,
      playlist: `This playlist spans a wide sonic range: ${genreCount} genres vary from mellow to intense, raw to polished.`,
    });
  }

  // Medium genre count (3-9)
  return byMode(mode, {
    top: `${genreCount} genres spread across valence, energy, and complexity dimensions, showing balanced sonic exploration.`,
    recent: `Recent ${genreCount} genres vary across mood, energy, and production style, creating moderate trait range.`,
    playlist: `${genreCount} genres in this playlist vary across mood, energy, and production style.`,
  });
}

/**
 * Generate a dynamic caption for the Popularity visualization
 */
export function generatePopularityCaption(stats: Stats): string {
  const avg = stats.overview.averagePopularity;
  const trackCount = stats.tracks.length;
  const mode = stats.mode;

  if (trackCount === 0) {
    return mode === 'playlist'
      ? 'This playlist has no songs to place on the popularity scale.'
      : 'Your balance between mainstream and niche tracks.';
  }

  // Get popularity distribution
  const nicheTracks = stats.tracks.filter(t => (t.track.popularity || 0) < 40).length;
  const mainstreamTracks = stats.tracks.filter(t => (t.track.popularity || 0) >= 70).length;
  const nichePercent = Math.round((nicheTracks / trackCount) * 100);
  const mainstreamPercent = Math.round((mainstreamTracks / trackCount) * 100);

  if (avg >= 70) {
    return byMode(mode, {
      top: `${mainstreamPercent}% mainstream hits dominate your top tracks.`,
      recent: `${mainstreamPercent}% mainstream tracks in your recent plays.`,
      playlist: `${mainstreamPercent}% of this playlist is mainstream.`,
    });
  }

  if (avg <= 35) {
    return byMode(mode, {
      top: `Deep dive into niche music: ${nichePercent}% of top tracks are under the radar.`,
      recent: `Underground focus: ${nichePercent}% of recent plays are niche tracks.`,
      playlist: `Underground focus: ${nichePercent}% of this playlist is under the radar.`,
    });
  }

  if (mainstreamPercent > nichePercent + 20) {
    return byMode(mode, {
      top: `Mainstream-leaning (${avg}% avg) with ${mainstreamPercent}% popular tracks.`,
      recent: `Leaning mainstream recently: ${mainstreamPercent}% popular, ${nichePercent}% niche.`,
      playlist: `Mainstream-leaning playlist (${avg}% avg): ${mainstreamPercent}% popular, ${nichePercent}% niche.`,
    });
  }

  if (nichePercent > mainstreamPercent + 20) {
    return byMode(mode, {
      top: `Niche-leaning (${avg}% avg) with ${nichePercent}% underground picks.`,
      recent: `Digging deeper recently: ${nichePercent}% niche vs ${mainstreamPercent}% mainstream.`,
      playlist: `Niche-leaning playlist (${avg}% avg): ${nichePercent}% underground, ${mainstreamPercent}% mainstream.`,
    });
  }

  return byMode(mode, {
    top: `Balanced mix: ${mainstreamPercent}% mainstream, ${nichePercent}% niche (${avg}% avg).`,
    recent: `Even split recently: ${mainstreamPercent}% mainstream, ${nichePercent}% niche.`,
    playlist: `Even split in this playlist: ${mainstreamPercent}% mainstream, ${nichePercent}% niche.`,
  });
}

/**
 * Generate a dynamic caption for the Persona visualization
 */
export function generatePersonaCaption(stats: Stats): string {
  const mode = stats.mode;
  const artistCount = stats.artists.length;
  const trackCount = stats.tracks.length;
  const artistDiversity = Math.round(stats.overview.artistDiversity * 100);

  if (mode === 'playlist' && trackCount === 0) {
    return 'This playlist has no songs to analyze.';
  }

  if (artistDiversity >= 80) {
    return byMode(mode, {
      top: `Explorer: wide-ranging taste across ${artistCount} artists in your top listening.`,
      recent: `Explorer mindset: sampling ${artistCount} different artists recently.`,
      playlist: `Explorer: this playlist ranges across ${artistCount} artists.`,
    });
  }

  if (artistDiversity <= 30) {
    return byMode(mode, {
      top: `Loyalist: focused dedication to ${artistCount} core artists.`,
      recent: `Loyalist: sticking with ${artistCount} favorite artists recently.`,
      playlist: `Loyalist: this playlist stays with ${artistCount} artists.`,
    });
  }

  const avgTracksPerArtist = artistCount > 0 ? trackCount / artistCount : 0;
  if (avgTracksPerArtist >= 3) {
    return byMode(mode, {
      top: `Deep listener: averaging ${Math.round(avgTracksPerArtist)} tracks per artist in your top ${artistCount}.`,
      recent: `Album diver: averaging ${Math.round(avgTracksPerArtist)} tracks per artist recently.`,
      playlist: `Deep playlist: averaging ${Math.round(avgTracksPerArtist)} songs per artist.`,
    });
  }

  return byMode(mode, {
    top: `Balanced curation across ${artistCount} artists with ${trackCount} tracks.`,
    recent: `Varied rotation: ${artistCount} artists across ${trackCount} recent plays.`,
    playlist: `Balanced playlist: ${artistCount} artists across ${trackCount} songs.`,
  });
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
