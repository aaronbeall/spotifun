import { NextRequest, NextResponse } from 'next/server';
import { getTopArtists, getTopTracks } from '@/lib/spotify';
import { setAuthCookies, UnauthenticatedError, withSpotifyAccessToken } from '@/lib/auth';
import { calculateWeightedVACRSScore } from '@/utils/musicClassification';
import { EraSnapshot, ErasResponse, GenreStats, TimeRange } from '@/types';

const RANGES: { timeRange: TimeRange; label: string }[] = [
  { timeRange: 'short_term', label: 'About 4 weeks' },
  { timeRange: 'medium_term', label: 'About 6 months' },
  { timeRange: 'long_term', label: 'Several years' },
];

function snapshot(
  timeRange: TimeRange,
  label: string,
  artists: SpotifyApi.ArtistObjectFull[],
  tracks: SpotifyApi.TrackObjectFull[],
): EraSnapshot {
  const genreMap = new Map<string, GenreStats>();
  let tagCount = 0;
  for (const artist of artists) {
    for (const genre of artist.genres ?? []) {
      tagCount += 1;
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
  const popularitySource = tracks.length > 0 ? tracks : null;
  const popularity = popularitySource
    ? Math.round(popularitySource.reduce((sum, track) => sum + (track.popularity || 0), 0) / popularitySource.length)
    : artists.length > 0
      ? Math.round(artists.reduce((sum, artist) => sum + (artist.popularity || 0), 0) / artists.length)
      : 0;

  return {
    timeRange,
    label,
    popularity,
    genreDiversity: genreStats.length / Math.max(tagCount, 1),
    valence: vacrs.valence,
    arousal: vacrs.arousal,
    artists: artists.length,
    tracks: tracks.length,
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<ErasResponse | { error: string }>> {
  try {
    const { result, refreshedTokens } = await withSpotifyAccessToken(request, async () => {
      const [artists, tracks] = await Promise.all([
        Promise.all(RANGES.map(range => getTopArtists(range.timeRange, 50))),
        Promise.all(RANGES.map(range => getTopTracks(range.timeRange, 50))),
      ]);
      return {
        eras: RANGES.map((range, index) => snapshot(range.timeRange, range.label, artists[index], tracks[index])),
      };
    });

    const response = NextResponse.json(result);
    if (refreshedTokens) setAuthCookies(response, refreshedTokens);
    return response;
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }
    console.error('Error fetching time ranges:', error);
    return NextResponse.json({ error: 'Failed to fetch time ranges' }, { status: 500 });
  }
}
