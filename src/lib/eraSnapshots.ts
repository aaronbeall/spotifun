import { calculateWeightedVACRSScore } from '@/utils/musicClassification';
import { genreFamilySpread } from '@/utils/improvedClassification';
import { EraSnapshot, GenreStats, TimeRange } from '@/types';

export const ERA_RANGES: { timeRange: TimeRange; label: string }[] = [
  { timeRange: 'short_term', label: 'About 4 weeks' },
  { timeRange: 'medium_term', label: 'About 6 months' },
  { timeRange: 'long_term', label: 'Several years' },
];

/** One period, from that range's top artists and top tracks. Genres are the artists' own tags. */
export function eraSnapshot(
  timeRange: TimeRange,
  label: string,
  artists: SpotifyApi.ArtistObjectFull[],
  tracks: SpotifyApi.TrackObjectFull[],
): EraSnapshot {
  const genreMap = new Map<string, GenreStats>();
  for (const artist of artists) {
    for (const genre of artist.genres ?? []) {
      const existing = genreMap.get(genre);
      if (existing) {
        existing.playCount += 1;
        existing.uniqueArtists += 1;
      } else {
        genreMap.set(genre, {
          genre,
          playCount: 1,
          uniqueTracks: 0,
          uniqueArtists: 1,
          totalDuration: 0,
        });
      }
    }
  }

  const genreStats = [...genreMap.values()];
  const vacrs = calculateWeightedVACRSScore(genreStats);
  const popularity = tracks.length > 0
    ? Math.round(tracks.reduce((sum, track) => sum + (track.popularity || 0), 0) / tracks.length)
    : artists.length > 0
      ? Math.round(artists.reduce((sum, artist) => sum + (artist.popularity || 0), 0) / artists.length)
      : 0;

  return {
    timeRange,
    label,
    popularity,
    genreDiversity: genreFamilySpread(artists.map(artist => artist.genres ?? [])),
    valence: vacrs.valence,
    arousal: vacrs.arousal,
    artists: artists.length,
    tracks: tracks.length,
  };
}
