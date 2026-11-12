/**
 * Classifies Spotify-owned editorial stations (one per browse category)
 * plus a few single-artist and mixed playlists aimed at empty regions.
 * Writes scripts/vibe-space-official.json.
 */
import fs from 'fs';
import { calculateGenreStats } from '../src/lib/spotify';
import { findBestMatchingVibe } from '../src/utils/musicVibesAnalyzer';
import { MUSIC_VIBES } from '../src/utils/musicVibes';
import { calculateVACRSScoreDistance, calculateWeightedVACRSScoreWithCoverage } from '../src/utils/musicClassification';
import { getUserPersona } from '../src/utils/musicPersonas';
import type { GenreStats, Stats, VACRSScore } from '../src/types';

const TOP_N = 40;
const OUT = 'scripts/vibe-space-official.json';

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
  for (let attempt = 0; attempt < 5; attempt++) {
    const response = await fetch(`https://api.spotify.com/v1${path}`, {
      headers: { Authorization: `Bearer ${access}` },
    });
    if (response.status === 429) {
      const wait = Number(response.headers.get('retry-after') || 2);
      await new Promise(resolve => setTimeout(resolve, wait * 1000));
      continue;
    }
    if (response.status === 404 || response.status === 403) return null;
    if (!response.ok) throw new Error(`${path} ${response.status}`);
    return response.json() as Promise<T>;
  }
  throw new Error(`rate limited ${path}`);
}

export type Track = {
  id: string;
  name: string;
  popularity: number;
  duration_ms: number;
  release: string;
  artists: { id: string; name: string }[];
};

type Song = {
  id: string;
  name: string;
  artists: string;
  artistIds: string[];
  popularity: number;
  year: number;
  vibe: string;
  coverage: number;
  genres: string[];
  station: string;
};

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function classify(tracks: Track[], artists: Record<string, { genres?: string[] }>) {
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

  const artistMap = artists as Record<string, SpotifyApi.ArtistObjectFull>;
  const genreStats = calculateGenreStats(plays, artistMap);
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
  const years = tracks.map(track => parseInt(track.release.slice(0, 4), 10)).filter(year => !Number.isNaN(year));
  const avgYear = years.length ? years.reduce((sum, year) => sum + year, 0) / years.length : 2026;
  const averagePopularity = tracks.reduce((sum, track) => sum + (track.popularity || 0), 0) / Math.max(tracks.length, 1);

  const stats = {
    overview: {
      genreDiversity: genreStats.length / Math.max(tagInstances, 1),
      averagePopularity,
      artistDiversity: artistIds.size / Math.max(tracks.length, 1),
    },
    genres: genreStats,
    mode: 'playlist',
    tracks: tracks.map(track => ({ track: { album: { release_date: track.release } } })),
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
    } as VACRSScore,
    coverage: round(coverage.coverage),
    genreDiversity: round(genreStats.length / Math.max(tagInstances, 1)),
    artistDiversity: round(artistIds.size / Math.max(tracks.length, 1)),
    averagePopularity: Math.round(averagePopularity),
    avgYear: Math.round(avgYear),
    persona: persona.name,
    dimensions: persona.dimensions,
    topGenres: genreStats.slice(0, 5).map(genre => genre.genre),
  };
}

function songOf(track: Track, artists: Record<string, { genres?: string[] }>, station: string): Song | null {
  const genres: string[] = [];
  for (const artist of track.artists) {
    for (const genre of artists[artist.id]?.genres ?? []) {
      if (!genres.includes(genre)) genres.push(genre);
    }
  }
  if (genres.length === 0) return null;
  const stats: GenreStats[] = genres.map(genre => ({
    genre, playCount: 1, uniqueTracks: 1, uniqueArtists: 1, totalDuration: track.duration_ms,
  }));
  const vibe = findBestMatchingVibe(stats);
  const coverage = calculateWeightedVACRSScoreWithCoverage(stats);
  if (coverage.coverage <= 0) return null;
  return {
    id: track.id,
    name: track.name,
    artists: track.artists.map(artist => artist.name).join(', '),
    artistIds: track.artists.map(artist => artist.id),
    popularity: track.popularity,
    year: parseInt(track.release.slice(0, 4), 10) || 0,
    vibe: vibe.vibe.name,
    coverage: round(coverage.coverage),
    genres,
    station,
  };
}

async function artistsFor(access: string, ids: string[]) {
  const artists: Record<string, { genres?: string[] }> = {};
  for (let index = 0; index < ids.length; index += 50) {
    const batch = await spotify<{ artists: { id: string; genres?: string[] }[] }>(
      access,
      `/artists?ids=${ids.slice(index, index + 50).join(',')}`,
    );
    for (const artist of batch?.artists ?? []) {
      if (artist?.id) artists[artist.id] = artist;
    }
  }
  return artists;
}

async function playlistTracks(access: string, id: string): Promise<{ name: string; owner: string; tracks: Track[] } | null> {
  const playlist = await spotify<{
    name: string;
    owner: { display_name: string };
    tracks: { items: { track: SpotifyApi.TrackObjectFull | null }[] };
  }>(
    access,
    `/playlists/${id}?fields=name,owner.display_name,tracks.items(track(id,name,popularity,duration_ms,album.release_date,artists(id,name)))`,
  );
  if (!playlist) return null;
  const tracks = playlist.tracks.items
    .map(item => item.track)
    .filter((track): track is SpotifyApi.TrackObjectFull => !!track?.id)
    .slice(0, TOP_N)
    .map(track => ({
      id: track.id,
      name: track.name,
      popularity: track.popularity ?? 0,
      duration_ms: track.duration_ms,
      release: track.album?.release_date ?? '',
      artists: track.artists.map(artist => ({ id: artist.id, name: artist.name })),
    }));
  return { name: playlist.name, owner: playlist.owner.display_name, tracks };
}

function recount(rows: { vibe: string; persona: string }[]) {
  const vibes = new Map<string, number>();
  const personas = new Map<string, number>();
  for (const row of rows) {
    vibes.set(row.vibe, (vibes.get(row.vibe) ?? 0) + 1);
    personas.set(row.persona, (personas.get(row.persona) ?? 0) + 1);
  }
  const sort = (map: Map<string, number>) => [...map.entries()].sort((a, b) => b[1] - a[1]);
  return { vibes: sort(vibes), personas: sort(personas) };
}

async function main() {
  loadEnv('.env');
  loadEnv('.env.local');
  const access = await token();

  const categories = await spotify<{ categories: { items: { id: string; name: string }[] } }>(
    access,
    '/browse/categories?limit=50&country=US',
  );
  if (!categories) throw new Error('browse categories unavailable');

  const picked: { id: string; category: string }[] = [];
  const seen = new Set<string>();
  const owners = new Map<string, number>();
  let emptyCategories = 0;
  for (const category of categories.categories.items) {
    const body = await spotify<{ playlists: { items: ({ id: string; name: string; owner: { id: string } } | null)[] } }>(
      access,
      `/search?q=${encodeURIComponent(category.name)}&type=playlist&market=US&limit=20`,
    );
    if (!body?.playlists?.items?.length) {
      emptyCategories++;
      continue;
    }
    for (const item of body.playlists.items) {
      if (item?.owner?.id) owners.set(item.owner.id, (owners.get(item.owner.id) ?? 0) + 1);
    }
    const official = body.playlists.items.find(item => item?.owner?.id === 'spotify' && item.id);
    if (!official || seen.has(official.id)) continue;
    seen.add(official.id);
    picked.push({ id: official.id, category: category.name });
  }
  const titles = [
    "Today's Top Hits", 'Top 50 - Global', 'Top 50 - USA', 'Viral 50 - Global', 'RapCaviar',
    'Hot Country', 'Rock This', 'Are & Be', 'Viva Latino', 'K-Pop ON!', 'mint',
    'Peaceful Piano', 'Deep Focus', 'Beast Mode', 'Mood Booster', 'Chill Hits',
    'All Out 2010s', 'All Out 2000s', 'All Out 80s', 'All Out 70s', 'Metal Essentials',
    'Jazz Classics', 'Classical Essentials', 'Ambient Relaxation', 'Techno Bunker',
  ];
  for (const title of titles) {
    const body = await spotify<{ playlists: { items: ({ id: string; name: string; owner: { id: string } } | null)[] } }>(
      access,
      `/search?q=${encodeURIComponent(title)}&type=playlist&market=US&limit=10`,
    );
    const official = body?.playlists.items.find(item => item && item.owner?.id === 'spotify' && item.name.toLowerCase() === title.toLowerCase());
    const fallback = official ?? body?.playlists.items.find(item => item?.owner?.id === 'spotify');
    if (!fallback || seen.has(fallback.id)) continue;
    seen.add(fallback.id);
    picked.push({ id: fallback.id, category: title });
  }
  console.error(`categories=${categories.categories.items.length} empty=${emptyCategories} official=${picked.length} owners=${[...owners.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id, n]) => `${id}:${n}`).join(', ')}`);

  const stations: object[] = [];
  const songs: Song[] = [];
  const seenSongs = new Set<string>();

  for (const entry of picked) {
    const playlist = await playlistTracks(access, entry.id);
    if (!playlist || playlist.tracks.length === 0) continue;
    const artists = await artistsFor(access, [...new Set(playlist.tracks.flatMap(track => track.artists.map(artist => artist.id)))]);
    const classified = classify(playlist.tracks, artists);
    stations.push({ id: entry.id, category: entry.category, name: playlist.name, owner: playlist.owner, ...classified });
    for (const track of playlist.tracks) {
      if (seenSongs.has(track.id)) continue;
      const song = songOf(track, artists, playlist.name);
      if (!song) continue;
      seenSongs.add(track.id);
      songs.push(song);
    }
    console.error(`${entry.category} | ${playlist.name}: ${classified.vibe} / ${classified.persona} cov=${classified.coverage}`);
  }

  const mixes = MUSIC_VIBES.map(vibe => {
    const picks = songs
      .filter(song => song.vibe === vibe.name && song.coverage >= 0.5)
      .sort((left, right) => right.popularity - left.popularity)
      .filter((song, index, list) => list.findIndex(other => other.artistIds[0] === song.artistIds[0]) === index)
      .slice(0, 12);
    return { vibe: vibe.name, available: songs.filter(song => song.vibe === vibe.name).length, picks };
  }).filter(mix => mix.picks.length >= 6);

  const explorers: object[] = [];
  for (const mix of mixes) {
    const tracks: Track[] = mix.picks.map(song => ({
      id: song.id,
      name: song.name,
      popularity: song.popularity,
      duration_ms: 180000,
      release: `${song.year}-01-01`,
      artists: song.artistIds.map((id, index) => ({ id, name: song.artists.split(', ')[index] ?? song.artists })),
    }));
    const artists: Record<string, { genres?: string[] }> = {};
    for (const song of mix.picks) {
      if (song.artistIds[0]) artists[song.artistIds[0]] = { genres: song.genres };
    }
    const classified = classify(tracks, artists);
    explorers.push({
      kind: 'vibe-mix',
      target: mix.vibe,
      reached: classified.vibe === mix.vibe,
      name: `${mix.vibe} from editorial songs`,
      trackNames: mix.picks.map(song => `${song.name} — ${song.artists}`),
      ...classified,
    });
  }

  const calm = songs.filter(song => song.popularity < 45 && song.year > 0 && song.year < 2015 && (song.vibe === 'Peaceful Solitude' || song.vibe === 'Tranquil Serenity' || song.vibe === 'Mystical Reverie' || song.vibe === 'Wistful Nostalgia'));
  const niche = [...calm].sort((left, right) => left.popularity - right.popularity).slice(0, 12);
  if (niche.length >= 6) {
    const tracks: Track[] = niche.map(song => ({
      id: song.id,
      name: song.name,
      popularity: song.popularity,
      duration_ms: 180000,
      release: `${song.year}-01-01`,
      artists: song.artistIds.map((id, index) => ({ id, name: song.artists.split(', ')[index] ?? song.artists })),
    }));
    const artists: Record<string, { genres?: string[] }> = {};
    for (const song of niche) if (song.artistIds[0]) artists[song.artistIds[0]] = { genres: song.genres };
    explorers.push({
      kind: 'quiet-catalog',
      name: 'Older, quieter, less-played editorial songs',
      trackNames: niche.map(song => `${song.name} — ${song.artists}`),
      ...classify(tracks, artists),
    });
  }

  const byArtist = new Map<string, Song[]>();
  for (const song of songs) {
    const key = song.artistIds[0];
    if (!key) continue;
    const list = byArtist.get(key) ?? [];
    list.push(song);
    byArtist.set(key, list);
  }
  const loyal = [...byArtist.entries()].sort((left, right) => right[1].length - left[1].length)[0];
  if (loyal && loyal[1].length >= 4) {
    const artistId = loyal[0];
    const top = await spotify<{ tracks: SpotifyApi.TrackObjectFull[] }>(access, `/artists/${artistId}/top-tracks?market=US`);
    const tracks: Track[] = (top?.tracks ?? []).slice(0, 10).map(track => ({
      id: track.id,
      name: track.name,
      popularity: track.popularity ?? 0,
      duration_ms: track.duration_ms,
      release: track.album?.release_date ?? '',
      artists: track.artists.map(artist => ({ id: artist.id, name: artist.name })),
    }));
    if (tracks.length >= 4) {
      const artists = await artistsFor(access, [...new Set(tracks.flatMap(track => track.artists.map(artist => artist.id)))]);
      explorers.push({
        kind: 'one-artist',
        name: `Top tracks: ${loyal[1][0].artists.split(', ')[0]}`,
        trackNames: tracks.map(track => track.name),
        ...classify(tracks, artists),
      });
    }
  }

  const wide: Song[] = [];
  const usedGenres = new Set<string>();
  const rankedWide = [...songs].sort((left, right) => left.genres.length - right.genres.length);
  for (const song of rankedWide) {
    if (wide.length >= 16) break;
    if (song.genres.some(genre => usedGenres.has(genre))) continue;
    wide.push(song);
    for (const genre of song.genres) usedGenres.add(genre);
  }
  if (wide.length >= 8) {
    const tracks: Track[] = wide.map(song => ({
      id: song.id,
      name: song.name,
      popularity: song.popularity,
      duration_ms: 180000,
      release: `${song.year || 2020}-01-01`,
      artists: song.artistIds.map((id, index) => ({ id, name: song.artists.split(', ')[index] ?? song.artists })),
    }));
    const artists: Record<string, { genres?: string[] }> = {};
    for (const song of wide) if (song.artistIds[0]) artists[song.artistIds[0]] = { genres: song.genres };
    explorers.push({
      kind: 'wide-tags',
      name: 'One song per untouched genre tag',
      trackNames: wide.map(song => `${song.name} — ${song.artists} (${song.genres.slice(0, 2).join(', ')})`),
      ...classify(tracks, artists),
    });
  }

  const stationCounts = recount(stations as { vibe: string; persona: string }[]);
  const songVibes = new Map<string, number>();
  for (const song of songs) songVibes.set(song.vibe, (songVibes.get(song.vibe) ?? 0) + 1);

  const report = {
    fetchedAt: new Date().toISOString(),
    topN: TOP_N,
    note: 'First 40 tracks in Spotify order, one Spotify-owned playlist per US browse category.',
    categories: categories.categories.items.map(item => item.name),
    stationCount: stations.length,
    classifiedSongCount: songs.length,
    vibeCounts: stationCounts.vibes,
    personaCounts: stationCounts.personas,
    songVibeCounts: [...songVibes.entries()].sort((a, b) => b[1] - a[1]),
    stations,
    explorers,
  };
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.error(`wrote ${OUT} stations=${stations.length} songs=${songs.length} explorers=${explorers.length}`);
}

const entry = process.argv[1]?.replace(/\\/g, '/') ?? '';
if (entry.endsWith('vibe-space-official.ts')) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
