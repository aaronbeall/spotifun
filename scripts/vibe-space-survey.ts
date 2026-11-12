/**
 * One-off survey: model geometry plus Spotify editorial stations classified
 * with the same vibe and persona functions the dashboard uses.
 * Writes scripts/vibe-space-survey.json. Not part of the app.
 */
import fs from 'fs';
import { calculateGenreStats } from '../src/lib/spotify';
import { findBestMatchingVibe } from '../src/utils/musicVibesAnalyzer';
import { MUSIC_VIBES } from '../src/utils/musicVibes';
import { calculateVACRSScoreDistance, calculateWeightedVACRSScoreWithCoverage } from '../src/utils/musicClassification';
import { MUSIC_PERSONAS, getUserPersona } from '../src/utils/musicPersonas';
import type { GenreStats, Stats, VACRSScore } from '../src/types';

const TOP_N = 40;
const OUT = 'scripts/vibe-space-survey.json';

const CHARTS = [
  '37i9dQZEVXbMDoHDwVN2tF',
  '37i9dQZEVXbLRQDuF5jeBp',
  '37i9dQZEVXbLiRSasKsNU9',
  '37i9dQZF1DXcBWIGoYBM5M',
  '37i9dQZF1DX4JAvHpjipBk',
];

const GENRE_QUERIES = [
  'rap', 'hip hop', 'country', 'rock', 'metal', 'punk', 'pop', 'k-pop', 'latin',
  'r&b', 'soul', 'jazz', 'blues', 'classical', 'opera', 'ambient', 'piano',
  'techno', 'house', 'edm', 'dance', 'indie', 'folk', 'singer-songwriter',
  'reggae', 'afrobeats', 'reggaeton', 'gospel', 'disco', 'funk', 'emo',
  'hyperpop', 'phonk', 'drill', 'bluegrass', 'bossa nova', 'soundtrack',
  'lo-fi', 'sleep', 'focus', 'workout', 'kids',
];

function loadEnv(file: string) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim().replace(/^"|"$/g, '');
  }
}

async function token(): Promise<string> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) throw new Error('Spotify app credentials are not set');
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!response.ok) throw new Error(`token ${response.status}`);
  return (await response.json()).access_token;
}

async function spotify<T>(access: string, path: string): Promise<T | null> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(`https://api.spotify.com/v1${path}`, {
      headers: { Authorization: `Bearer ${access}` },
    });
    if (response.status === 429) {
      const wait = Number(response.headers.get('retry-after') || 2);
      await new Promise(resolve => setTimeout(resolve, wait * 1000));
      continue;
    }
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`${path} ${response.status}`);
    return response.json() as Promise<T>;
  }
  throw new Error(`rate limited ${path}`);
}

type Track = {
  id: string;
  name: string;
  popularity: number;
  duration_ms: number;
  release: string;
  artists: { id: string; name: string }[];
};

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function vibeBasins() {
  const steps = 9;
  const counts = new Map<string, number>();
  let total = 0;
  let marginSum = 0;
  for (let v = 0; v < steps; v++) {
    for (let a = 0; a < steps; a++) {
      for (let c = 0; c < steps; c++) {
        for (let r = 0; r < steps; r++) {
          for (let s = 0; s < steps; s++) {
            const score: VACRSScore = {
              valence: v / (steps - 1),
              arousal: a / (steps - 1),
              complexity: c / (steps - 1),
              rawness: r / (steps - 1),
              socialPresence: s / (steps - 1),
            };
            const ranked = MUSIC_VIBES
              .map(vibe => ({ name: vibe.name, distance: calculateVACRSScoreDistance(score, vibe.targetScore) }))
              .sort((left, right) => left.distance - right.distance);
            counts.set(ranked[0].name, (counts.get(ranked[0].name) ?? 0) + 1);
            marginSum += ranked[1].distance - ranked[0].distance;
            total++;
          }
        }
      }
    }
  }
  const basins = [...counts.entries()]
    .map(([name, count]) => ({ name, share: round(count / total), points: count }))
    .sort((left, right) => right.points - left.points);
  return { grid: `${steps} steps per axis, ${total} points`, meanMargin: round(marginSum / total), basins };
}

function targetSpread() {
  const dims = ['valence', 'arousal', 'complexity', 'rawness', 'socialPresence'] as const;
  return dims.map(dim => {
    const values = MUSIC_VIBES.map(vibe => vibe.targetScore[dim]);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    return {
      dimension: dim,
      min: Math.min(...values),
      max: Math.max(...values),
      mean: round(mean),
    };
  });
}

function classifyStation(tracks: Track[], artists: Record<string, SpotifyApi.ArtistObjectFull>) {
  const plays = tracks.map(track => ({
    played_at: '',
    context: null,
    track: {
      id: track.id,
      name: track.name,
      popularity: track.popularity,
      duration_ms: track.duration_ms,
      artists: track.artists,
      album: { release_date: track.release },
    },
  })) as unknown as SpotifyApi.PlayHistoryObject[];

  const genreStats = calculateGenreStats(plays, artists);
  const vibe = findBestMatchingVibe(genreStats);
  const ranked = MUSIC_VIBES
    .map(item => ({ name: item.name, distance: calculateVACRSScoreDistance(vibe.score, item.targetScore) }))
    .sort((left, right) => left.distance - right.distance);
  const coverage = calculateWeightedVACRSScoreWithCoverage(genreStats);

  let tagInstances = 0;
  const artistIds = new Set<string>();
  for (const track of tracks) {
    for (const artist of track.artists) {
      artistIds.add(artist.id);
      tagInstances += artists[artist.id]?.genres?.length ?? 0;
    }
  }
  const years = tracks
    .map(track => parseInt(track.release.slice(0, 4), 10))
    .filter(year => !Number.isNaN(year));
  const avgYear = years.length ? years.reduce((sum, year) => sum + year, 0) / years.length : 2026;
  const averagePopularity = tracks.reduce((sum, track) => sum + (track.popularity || 0), 0) / Math.max(tracks.length, 1);
  const genreDiversity = genreStats.length / Math.max(tagInstances, 1);
  const artistDiversity = artistIds.size / Math.max(tracks.length, 1);

  const stats = {
    overview: { genreDiversity, averagePopularity, artistDiversity },
    genres: genreStats,
    mode: 'playlist',
    tracks: tracks.map(track => ({
      track: { album: { release_date: track.release } },
    })),
    topTracks: [],
  } as unknown as Stats;
  const persona = getUserPersona(stats);

  return {
    tracks: tracks.length,
    vibe: vibe.vibe.name,
    vibeMatch: vibe.matchPercentage,
    runnerUp: ranked[1].name,
    margin: round(ranked[1].distance - ranked[0].distance),
    score: {
      valence: round(vibe.score.valence),
      arousal: round(vibe.score.arousal),
      complexity: round(vibe.score.complexity),
      rawness: round(vibe.score.rawness),
      socialPresence: round(vibe.score.socialPresence),
    },
    coverage: round(coverage.coverage),
    genreDiversity: round(genreDiversity),
    artistDiversity: round(artistDiversity),
    averagePopularity: Math.round(averagePopularity),
    avgYear: Math.round(avgYear),
    persona: persona.name,
    dimensions: persona.dimensions,
    topGenres: genreStats.slice(0, 5).map(genre => genre.genre),
    genreStats,
  };
}

function trackVibe(track: Track, artists: Record<string, SpotifyApi.ArtistObjectFull>) {
  const genres: GenreStats[] = [];
  const seen = new Map<string, number>();
  for (const artist of track.artists) {
    for (const genre of artists[artist.id]?.genres ?? []) {
      seen.set(genre, (seen.get(genre) ?? 0) + 1);
    }
  }
  for (const [genre, playCount] of seen) {
    genres.push({ genre, playCount, uniqueTracks: 1, uniqueArtists: 1, totalDuration: track.duration_ms });
  }
  const vibe = findBestMatchingVibe(genres);
  const coverage = calculateWeightedVACRSScoreWithCoverage(genres);
  return { vibe: vibe.vibe.name, score: vibe.score, coverage: coverage.coverage };
}

async function main() {
  loadEnv('.env');
  loadEnv('.env.local');
  const access = await token();

  const found = new Map<string, { id: string; name: string; source: string }>();
  for (const id of CHARTS) found.set(id, { id, name: '', source: 'chart' });

  for (const query of GENRE_QUERIES) {
    const body = await spotify<{ playlists: { items: { id: string; name: string; owner: { id: string } }[] } }>(
      access,
      `/search?q=${encodeURIComponent(query)}&type=playlist&limit=8`,
    );
    const official = body?.playlists.items.find(item => item?.owner?.id === 'spotify' && item.id);
    const pick = official ?? body?.playlists.items.find(item => item?.id);
    if (pick && !found.has(pick.id)) found.set(pick.id, { id: pick.id, name: pick.name, source: query });
  }

  let categories: { categories: { items: { id: string; name: string }[] } } | null = null;
  try {
    categories = await spotify(access, '/browse/categories?limit=50&country=US');
  } catch (error) {
    console.error(`browse categories unavailable: ${error instanceof Error ? error.message : error}`);
  }

  const stations: object[] = [];
  const songs: { id: string; name: string; artists: string; popularity: number; year: number; vibe: string; station: string }[] = [];
  const seenSongs = new Set<string>();

  for (const entry of found.values()) {
    const playlist = await spotify<{ name: string; owner: { display_name: string }; tracks: { items: { track: SpotifyApi.TrackObjectFull | null }[] } }>(
      access,
      `/playlists/${entry.id}?fields=name,owner.display_name,tracks.items(track(id,name,popularity,duration_ms,album.release_date,artists(id,name)))`,
    );
    if (!playlist) continue;
    const raw = playlist.tracks.items.map(item => item.track).filter((track): track is SpotifyApi.TrackObjectFull => !!track?.id);
    const tracks: Track[] = raw.slice(0, TOP_N).map(track => ({
      id: track.id,
      name: track.name,
      popularity: track.popularity ?? 0,
      duration_ms: track.duration_ms,
      release: track.album?.release_date ?? '',
      artists: track.artists.map(artist => ({ id: artist.id, name: artist.name })),
    }));
    const ids = [...new Set(tracks.flatMap(track => track.artists.map(artist => artist.id)))];
    const artists: Record<string, SpotifyApi.ArtistObjectFull> = {};
    for (let index = 0; index < ids.length; index += 50) {
      const batch = await spotify<{ artists: SpotifyApi.ArtistObjectFull[] }>(
        access,
        `/artists?ids=${ids.slice(index, index + 50).join(',')}`,
      );
      for (const artist of batch?.artists ?? []) {
        if (artist?.id) artists[artist.id] = artist;
      }
    }
    const classified = classifyStation(tracks, artists);
    const { genreStats: _genres, ...summary } = classified;
    stations.push({
      id: entry.id,
      query: entry.source,
      name: playlist.name,
      owner: playlist.owner.display_name,
      ...summary,
    });
    for (const track of tracks) {
      if (seenSongs.has(track.id)) continue;
      seenSongs.add(track.id);
      const vibe = trackVibe(track, artists);
      if (vibe.coverage <= 0) continue;
      songs.push({
        id: track.id,
        name: track.name,
        artists: track.artists.map(artist => artist.name).join(', '),
        popularity: track.popularity,
        year: parseInt(track.release.slice(0, 4), 10) || 0,
        vibe: vibe.vibe,
        station: playlist.name,
      });
    }
    console.error(`${playlist.name}: ${classified.vibe} / ${classified.persona}`);
  }

  const vibeCounts = new Map<string, number>();
  const personaCounts = new Map<string, number>();
  for (const station of stations as { vibe: string; persona: string }[]) {
    vibeCounts.set(station.vibe, (vibeCounts.get(station.vibe) ?? 0) + 1);
    personaCounts.set(station.persona, (personaCounts.get(station.persona) ?? 0) + 1);
  }
  const songVibes = new Map<string, number>();
  for (const song of songs) songVibes.set(song.vibe, (songVibes.get(song.vibe) ?? 0) + 1);

  const missingVibes = MUSIC_VIBES.map(vibe => vibe.name).filter(name => !vibeCounts.has(name));
  const proposals = missingVibes.map(name => {
    const target = MUSIC_VIBES.find(vibe => vibe.name === name)!;
    const picks = songs
      .map(song => {
        const single = trackVibeFromName(song);
        return song;
      })
      .filter(song => song.vibe === name)
      .sort((left, right) => right.popularity - left.popularity)
      .slice(0, 12);
    return {
      vibe: name,
      tracks: picks.map(song => ({ name: song.name, artists: song.artists, year: song.year })),
    };
  });

  const report = {
    fetchedAt: new Date().toISOString(),
    topN: TOP_N,
    browseCategories: categories?.categories.items.map(item => item.name) ?? null,
    model: {
      vibeCount: MUSIC_VIBES.length,
      personaCount: MUSIC_PERSONAS.length,
      basins: vibeBasins(),
      targetSpread: targetSpread(),
    },
    stationCount: stations.length,
    songCount: songs.length,
    songs: songs.map(song => ({ id: song.id, name: song.name, artists: song.artists, popularity: song.popularity, year: song.year, vibe: song.vibe, station: song.station })),
    vibeCounts: [...vibeCounts.entries()].sort((a, b) => b[1] - a[1]),
    personaCounts: [...personaCounts.entries()].sort((a, b) => b[1] - a[1]),
    songVibeCounts: [...songVibes.entries()].sort((a, b) => b[1] - a[1]),
    missingVibes,
    missingPersonaCount: MUSIC_PERSONAS.length - personaCounts.size,
    stations,
    proposals,
  };
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.error(`wrote ${OUT} stations=${stations.length} songs=${songs.length}`);
}

function trackVibeFromName(song: { vibe: string }) {
  return song;
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
