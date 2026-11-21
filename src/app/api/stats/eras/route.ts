import { NextRequest, NextResponse } from 'next/server';
import { getUsername } from '@/lib/session';
import { createLastFmDataSource } from '@/lib/lastfmSource';
import { errorResponse } from '@/lib/apiErrors';
import { averageKnownPopularity } from '@/lib/statsPipeline';
import { calculateWeightedVACRSScore } from '@/utils/musicClassification';
import { genreFamilySpread } from '@/utils/improvedClassification';
import { EraSnapshot, ErasResponse, GenreStats, TimeRange } from '@/types';
import type { Artist, Track } from '@/types/music';

const ERAS: { timeRange: TimeRange; label: string }[] = [
  { timeRange: '1month', label: 'Last month' },
  { timeRange: '6month', label: 'Last 6 months' },
  { timeRange: '12month', label: 'Last year' },
  { timeRange: 'overall', label: 'All time' },
];

/** Fewer than the main profile's 50, so a cold cache fills in a few seconds */
const ERA_LIST_SIZE = 30;

function snapshot(timeRange: TimeRange, label: string, artists: Artist[], tracks: Track[]): EraSnapshot {
  const genreMap = new Map<string, GenreStats>();
  for (const artist of artists) {
    const weight = artist.playcount ?? 1;
    for (const genre of artist.genres ?? []) {
      const existing = genreMap.get(genre);
      if (existing) {
        existing.playCount += weight;
        existing.uniqueArtists += 1;
      } else {
        genreMap.set(genre, { genre, playCount: weight, uniqueTracks: 0, uniqueArtists: 1, totalDuration: 0 });
      }
    }
  }

  const vacrs = calculateWeightedVACRSScore([...genreMap.values()]);
  return {
    timeRange,
    label,
    popularity: averageKnownPopularity(tracks.map(track => track.popularity))
      || averageKnownPopularity(artists.map(artist => artist.popularity)),
    genreDiversity: genreFamilySpread(artists.map(artist => artist.genres ?? [])),
    valence: vacrs.valence,
    arousal: vacrs.arousal,
    artists: artists.length,
    tracks: tracks.length,
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<ErasResponse | { error: string }>> {
  try {
    const source = createLastFmDataSource(getUsername(request));
    const eras = await Promise.all(ERAS.map(async ({ timeRange, label }) => {
      const [artists, tracks] = await Promise.all([
        source.getTopArtists(timeRange, ERA_LIST_SIZE).then(list => source.enhanceArtists(list)).then(result => result.artists),
        source.getTopTracks(timeRange, ERA_LIST_SIZE).then(list => source.enrichTracks ? source.enrichTracks(list) : list),
      ]);
      return snapshot(timeRange, label, artists, tracks);
    }));
    return NextResponse.json({ eras });
  } catch (error) {
    return errorResponse(error, 'eras');
  }
}
