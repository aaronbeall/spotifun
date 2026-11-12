/**
 * Rescore the saved Spotify sample with the current vibe and persona model.
 *
 *   npm run coverage                 score analysis/corpus.json, store a run, refresh the canvas
 *   npm run coverage -- --label "…"  same, with a note stored on the run
 *   npm run coverage:refresh         re-read the playlist sample from Spotify, then score
 *
 * Runs land in analysis/runs/. The canvas compares the new run with the previous one.
 */
import fs from 'fs';
import path from 'path';
import { calculateGenreStats } from '../src/lib/spotify';
import { findBestMatchingVibe } from '../src/utils/musicVibesAnalyzer';
import { MUSIC_VIBES } from '../src/utils/musicVibes';
import { calculateVACRSScoreDistance, calculateWeightedVACRSScoreWithCoverage } from '../src/utils/musicClassification';
import { MUSIC_PERSONAS, PERSONA_THRESHOLDS, getUserPersona } from '../src/utils/musicPersonas';
import type { GenreStats, Stats, VACRSScore } from '../src/types';

const ROOT = process.cwd();
const CORPUS_PATH = path.join(ROOT, 'analysis', 'corpus.json');
const RUNS_DIR = path.join(ROOT, 'analysis', 'runs');
const INDEX_PATH = path.join(RUNS_DIR, 'index.json');
const CANVAS_PATH = path.join(
  process.env.USERPROFILE || '',
  '.cursor', 'projects', 'c-Users-conta-Development-spotifun', 'canvases', 'vibe-persona-coverage.canvas.tsx',
);
const TOP_N = 40;

type CorpusArtist = { name: string; genres: string[] };
type CorpusTrack = { id: string; name: string; popularity: number; durationMs: number; release: string; artistIds: string[] };
type CorpusPlaylist = { id: string; role: 'genre' | 'chart'; query: string; name: string; owner: string; tracks: CorpusTrack[] };
type Corpus = { fetchedAt: string; asOfYear: number; note: string; artists: Record<string, CorpusArtist>; playlists: CorpusPlaylist[] };

type SwitchRow = {
  name: string;
  majority: string;
  minority: string;
  majorityCount: number;
  minorityCount: number;
  total: number;
  stuck: boolean;
};
type RunIndexEntry = { id: string; at: string; label: string; personasHit: number; vibesHit: number; topVibe: string; file: string };

function loadEnv(file: string) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return;
  for (const line of fs.readFileSync(full, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim().replace(/^"|"$/g, '');
  }
}

function plain(value: string): string {
  return value.replace(/\p{Extended_Pictographic}/gu, '').replace(/\s+/g, ' ').trim();
}

function round(value: number, places = 1): number {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

function argValue(flag: string): string {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? (process.argv[index + 1] || '') : '';
}

async function token(): Promise<string> {
  loadEnv('.env.local');
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

async function spotify<T>(access: string, apiPath: string): Promise<T | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const response = await fetch(`https://api.spotify.com/v1${apiPath}`, {
      headers: { Authorization: `Bearer ${access}` },
    });
    if (response.status === 429) {
      await new Promise(resolve => setTimeout(resolve, Number(response.headers.get('retry-after') || 2) * 1000));
      continue;
    }
    if (response.status === 404 || response.status === 403) return null;
    if (!response.ok) throw new Error(`${apiPath} ${response.status}`);
    return response.json() as Promise<T>;
  }
  return null;
}

async function refreshCorpus(): Promise<Corpus> {
  const survey = readJson<{ stations: { id: string; query: string; name: string; owner: string }[] }>(path.join(ROOT, 'scripts', 'vibe-space-survey.json'));
  const charts = readJson<{ stations: { id: string; name: string; owner: string }[] }>(path.join(ROOT, 'scripts', 'vibe-space-charts.json'));
  const wanted: { id: string; role: 'genre' | 'chart'; query: string; name: string; owner: string }[] = [
    ...survey.stations.map(station => ({ id: station.id, role: 'genre' as const, query: station.query, name: station.name, owner: station.owner })),
    ...charts.stations.map(station => ({ id: station.id, role: 'chart' as const, query: station.name, name: station.name, owner: station.owner })),
  ];
  const access = await token();
  const artists: Record<string, CorpusArtist> = {};
  const playlists: CorpusPlaylist[] = [];

  for (const entry of wanted) {
    const playlist = await spotify<{
      name: string;
      owner?: { display_name?: string };
      tracks?: { items?: { track?: SpotifyApi.TrackObjectFull | null }[] };
    }>(access, `/playlists/${entry.id}?fields=name,owner.display_name,tracks.items(track(id,name,popularity,duration_ms,album.release_date,artists(id,name)))`);
    const raw = (playlist?.tracks?.items ?? []).map(item => item.track).filter((track): track is SpotifyApi.TrackObjectFull => !!track?.id).slice(0, TOP_N);
    if (!playlist || raw.length === 0) {
      console.error(`skip ${entry.id} ${entry.name}`);
      continue;
    }
    const missing = [...new Set(raw.flatMap(track => track.artists.map(artist => artist.id)))].filter(id => !artists[id]);
    for (let index = 0; index < missing.length; index += 50) {
      const batch = await spotify<{ artists: { id: string; name: string; genres?: string[] }[] }>(access, `/artists?ids=${missing.slice(index, index + 50).join(',')}`);
      for (const artist of batch?.artists ?? []) {
        if (artist?.id) artists[artist.id] = { name: artist.name, genres: artist.genres ?? [] };
      }
    }
    playlists.push({
      id: entry.id,
      role: entry.role,
      query: entry.query,
      name: playlist.name || entry.name,
      owner: playlist.owner?.display_name || entry.owner,
      tracks: raw.map(track => ({
        id: track.id,
        name: track.name,
        popularity: track.popularity ?? 0,
        durationMs: track.duration_ms,
        release: track.album?.release_date ?? '',
        artistIds: track.artists.map(artist => artist.id),
      })),
    });
    console.error(`saved ${entry.role} ${playlist.name} (${raw.length})`);
  }

  const corpus: Corpus = {
    fetchedAt: new Date().toISOString(),
    asOfYear: new Date().getFullYear(),
    note: 'Frozen playlist sample. Genre rows are the first search hit per genre word. Chart rows are name-matched Billboard and Official Charts playlists. Spotify-owned 37i9 stations are not in this file; this app token receives 404 for them. First 40 tracks in Spotify order.',
    artists,
    playlists,
  };
  fs.mkdirSync(path.dirname(CORPUS_PATH), { recursive: true });
  fs.writeFileSync(CORPUS_PATH, JSON.stringify(corpus));
  console.error(`wrote ${CORPUS_PATH} playlists=${playlists.length} artists=${Object.keys(artists).length}`);
  return corpus;
}

function vibeBasins() {
  const steps = 9;
  const counts = new Map<string, number>();
  let total = 0;
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
            let best = MUSIC_VIBES[0];
            let bestDistance = Infinity;
            for (const vibe of MUSIC_VIBES) {
              const distance = calculateVACRSScoreDistance(score, vibe.targetScore);
              if (distance < bestDistance) {
                best = vibe;
                bestDistance = distance;
              }
            }
            counts.set(best.name, (counts.get(best.name) ?? 0) + 1);
            total++;
          }
        }
      }
    }
  }
  return { total, counts };
}

function classifyPlaylist(playlist: CorpusPlaylist, corpus: Corpus) {
  const tracks = playlist.tracks.map(track => ({
    id: track.id,
    name: track.name,
    popularity: track.popularity,
    duration_ms: track.durationMs,
    release: track.release,
    artists: track.artistIds.map(id => ({ id, name: corpus.artists[id]?.name ?? id })),
  }));
  const artistDetails: Record<string, { genres?: string[] }> = {};
  for (const track of playlist.tracks) {
    for (const id of track.artistIds) artistDetails[id] = { genres: corpus.artists[id]?.genres ?? [] };
  }
  const plays = tracks.map(track => ({
    played_at: '',
    context: null,
    track: { ...track, album: { release_date: track.release } },
  })) as unknown as SpotifyApi.PlayHistoryObject[];
  const genreStats = calculateGenreStats(plays, artistDetails as Record<string, SpotifyApi.ArtistObjectFull>);
  const vibe = findBestMatchingVibe(genreStats);
  const ranked = MUSIC_VIBES
    .map(item => ({ name: item.name, distance: calculateVACRSScoreDistance(vibe.score, item.targetScore) }))
    .sort((left, right) => left.distance - right.distance);
  const coverage = calculateWeightedVACRSScoreWithCoverage(genreStats);
  let tagInstances = 0;
  const artistIds = new Set<string>();
  for (const track of playlist.tracks) {
    for (const id of track.artistIds) {
      artistIds.add(id);
      tagInstances += corpus.artists[id]?.genres.length ?? 0;
    }
  }
  const years = playlist.tracks.map(track => parseInt(track.release.slice(0, 4), 10)).filter(year => !Number.isNaN(year));
  const avgYear = years.length ? years.reduce((sum, year) => sum + year, 0) / years.length : corpus.asOfYear;
  const averagePopularity = playlist.tracks.reduce((sum, track) => sum + track.popularity, 0) / Math.max(playlist.tracks.length, 1);
  const stats = {
    overview: {
      genreDiversity: genreStats.length / Math.max(tagInstances, 1),
      averagePopularity,
      artistDiversity: artistIds.size / Math.max(playlist.tracks.length, 1),
    },
    genres: genreStats,
    mode: 'playlist',
    tracks: playlist.tracks.map(track => ({ track: { album: { release_date: track.release } } })),
    topTracks: [],
  } as unknown as Stats;
  const persona = getUserPersona(stats);
  return {
    vibe: vibe.vibe.name,
    persona: persona.name,
    dimensions: persona.dimensions,
    score: coverage.scores,
    coverage: round(coverage.coverage, 3),
    margin: round(ranked[1].distance - ranked[0].distance, 3),
    averagePopularity: Math.round(averagePopularity),
    avgYear: Math.round(avgYear),
  };
}

function trackVibe(track: CorpusTrack, corpus: Corpus): { name: string; score: VACRSScore } | null {
  const genres: string[] = [];
  for (const id of track.artistIds) {
    for (const genre of corpus.artists[id]?.genres ?? []) {
      if (!genres.includes(genre)) genres.push(genre);
    }
  }
  if (genres.length === 0) return null;
  const stats: GenreStats[] = genres.map(genre => ({
    genre, playCount: 1, uniqueTracks: 1, uniqueArtists: 1, totalDuration: track.durationMs,
  }));
  const coverage = calculateWeightedVACRSScoreWithCoverage(stats);
  if (coverage.coverage <= 0) return null;
  return { name: findBestMatchingVibe(stats).vibe.name, score: coverage.scores };
}

const VACRS_AXES = [
  ['valence', 'Valence'],
  ['arousal', 'Arousal'],
  ['complexity', 'Complexity'],
  ['rawness', 'Rawness'],
  ['socialPresence', 'Social presence'],
] as const;

const VACRS_BINS = ['0–.1', '.1–.2', '.2–.3', '.3–.4', '.4–.5', '.5–.6', '.6–.7', '.7–.8', '.8–.9', '.9–1'];

function shareBins(values: number[]): number[] {
  const counts = Array(10).fill(0);
  for (const value of values) counts[Math.min(9, Math.max(0, Math.floor(value * 10)))]++;
  const total = values.length || 1;
  return counts.map(count => round(count / total * 100));
}

function meanOf(values: number[]): number {
  if (values.length === 0) return 0;
  return round(values.reduce((sum, value) => sum + value, 0) / values.length, 2);
}

function vacrsSpace(songs: VACRSScore[], playlists: VACRSScore[], unscoredPlaylists: number) {
  const axes = VACRS_AXES.map(([key, name]) => {
    const songValues = songs.map(score => score[key]);
    const playlistValues = playlists.map(score => score[key]);
    const targetValues = MUSIC_VIBES.map(vibe => vibe.targetScore[key]);
    const songShares = shareBins(songValues);
    const peak = Math.max(...songShares);
    return {
      name,
      songMean: meanOf(songValues),
      playlistMean: meanOf(playlistValues),
      targetMean: meanOf(targetValues),
      songPeak: peak,
      songs: songShares,
      playlists: shareBins(playlistValues),
      targets: shareBins(targetValues),
    };
  });
  const farthest = [...axes].sort((left, right) => Math.abs(right.songMean - right.targetMean) - Math.abs(left.songMean - left.targetMean))[0];
  const tightest = [...axes].sort((left, right) => right.songPeak - left.songPeak)[0];
  return {
    bins: VACRS_BINS,
    scoredPlaylists: playlists.length,
    unscoredPlaylists,
    reading: `Songs average ${farthest.songMean} on ${farthest.name}; the 15 vibe targets average ${farthest.targetMean} there. The tightest song pile is ${tightest.name}, where ${tightest.songPeak}% of songs sit in a single tenth.`,
    axes,
  };
}

function score(corpus: Corpus, label: string) {
  const genrePlaylists = corpus.playlists.filter(playlist => playlist.role === 'genre');
  const chartPlaylists = corpus.playlists.filter(playlist => playlist.role === 'chart');
  const genreScored = genrePlaylists.map(playlist => ({ playlist, result: classifyPlaylist(playlist, corpus) }));
  const chartScored = chartPlaylists.map(playlist => ({ playlist, result: classifyPlaylist(playlist, corpus) }));

  const stationVibes = new Map<string, number>();
  const personaCounts = new Map<string, number>(MUSIC_PERSONAS.map(persona => [persona.name, 0]));
  const bits = {
    genreHigh: 0, popHigh: 0, consistencyHigh: 0, eraNew: 0, valencePositive: 0, arousalEnergetic: 0,
  };
  for (const row of genreScored) {
    stationVibes.set(row.result.vibe, (stationVibes.get(row.result.vibe) ?? 0) + 1);
    personaCounts.set(row.result.persona, (personaCounts.get(row.result.persona) ?? 0) + 1);
    const dimensions = row.result.dimensions;
    if (dimensions.genreDiversity === 'high') bits.genreHigh++;
    if (dimensions.trackPopularity === 'high') bits.popHigh++;
    if (dimensions.artistConsistency === 'high') bits.consistencyHigh++;
    if (dimensions.era === 'new') bits.eraNew++;
    if (dimensions.valence === 'positive') bits.valencePositive++;
    if (dimensions.arousal === 'energetic') bits.arousalEnergetic++;
  }

  const songVibes = new Map<string, number>();
  const songScores: VACRSScore[] = [];
  const seen = new Set<string>();
  let classifiedSongs = 0;
  for (const playlist of genrePlaylists) {
    for (const track of playlist.tracks) {
      if (seen.has(track.id)) continue;
      seen.add(track.id);
      const vibe = trackVibe(track, corpus);
      if (!vibe) continue;
      classifiedSongs++;
      songScores.push(vibe.score);
      songVibes.set(vibe.name, (songVibes.get(vibe.name) ?? 0) + 1);
    }
  }

  const basins = vibeBasins();
  const playlistTotal = genreScored.length;
  const gaps = MUSIC_VIBES.map(vibe => {
    const basin = (basins.counts.get(vibe.name) ?? 0) / basins.total * 100;
    const songs = (songVibes.get(vibe.name) ?? 0) / Math.max(classifiedSongs, 1) * 100;
    return {
      name: vibe.name,
      gap: round(songs - basin),
      basin: round(basin),
      songs: round(songs),
      stations: round((stationVibes.get(vibe.name) ?? 0) / Math.max(playlistTotal, 1) * 100),
    };
  }).sort((left, right) => right.gap - left.gap);

  const total = playlistTotal;
  const switchOf = (name: string, highName: string, lowName: string, high: number): SwitchRow => {
    const low = total - high;
    const majorityIsHigh = high >= low;
    const majorityCount = majorityIsHigh ? high : low;
    return {
      name,
      majority: majorityIsHigh ? highName : lowName,
      minority: majorityIsHigh ? lowName : highName,
      majorityCount,
      minorityCount: total - majorityCount,
      total,
      stuck: total > 0 && majorityCount / total >= 0.75,
    };
  };
  const switches: SwitchRow[] = [
    switchOf('Genre diversity', 'high', 'low', bits.genreHigh),
    switchOf('Artist consistency', 'high', 'low', bits.consistencyHigh),
    switchOf('Era', 'new', 'old', bits.eraNew),
    switchOf('Valence', 'positive', 'negative', bits.valencePositive),
    switchOf('Energy', 'energetic', 'calm', bits.arousalEnergetic),
    switchOf('Popularity', 'high', 'low', bits.popHigh),
  ];

  const songRanking = [...songVibes.entries()].sort((left, right) => right[1] - left[1]);
  const top3 = songRanking.slice(0, 3).reduce((sum, entry) => sum + entry[1], 0);
  const personas = MUSIC_PERSONAS.map(persona => ({ name: persona.name, count: personaCounts.get(persona.name) ?? 0 }));
  const personasHit = personas.filter(persona => persona.count > 0).length;
  const piled = gaps.filter(row => row.gap > 0).slice(0, 3).map(row => row.name);
  const empty = [...gaps].sort((left, right) => left.gap - right.gap).slice(0, 3).map(row => row.name);
  const vacrs = vacrsSpace(
    songScores,
    genreScored.filter(row => row.result.coverage > 0).map(row => row.result.score),
    genreScored.filter(row => row.result.coverage <= 0).length,
  );

  const at = new Date().toISOString();
  const id = at.replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  return {
    id,
    at,
    label: label || 'rescore',
    corpusFetchedAt: corpus.fetchedAt,
    eraYear: new Date().getFullYear(),
    thresholds: PERSONA_THRESHOLDS,
    vibeTargets: MUSIC_VIBES.map(vibe => ({ name: vibe.name, ...vibe.targetScore })),
    headline: {
      personasHit,
      personaTotal: MUSIC_PERSONAS.length,
      vibesHit: MUSIC_VIBES.filter(vibe => (stationVibes.get(vibe.name) ?? 0) > 0).length,
      vibeTotal: MUSIC_VIBES.length,
      top3SongShare: round(top3 / Math.max(classifiedSongs, 1) * 100),
      top3Names: songRanking.slice(0, 3).map(entry => entry[0]),
      playlists: playlistTotal,
      songs: classifiedSongs,
    },
    switches,
    gaps,
    vacrs,
    reading: `${piled.join(', ')} draw more songs than their share of the vibe space. ${empty.join(', ')} have room in the model that these tags barely reach.`,
    personas,
    stations: genreScored.map(row => ({
      query: row.playlist.query,
      name: plain(row.playlist.name),
      owner: row.playlist.owner,
      tracks: row.playlist.tracks.length,
      vibe: row.result.vibe,
      persona: row.result.persona,
    })),
    charts: chartScored.map(row => ({
      id: row.playlist.id,
      name: plain(row.playlist.name),
      owner: row.playlist.owner,
      tracks: row.playlist.tracks.length,
      vibe: row.result.vibe,
      persona: row.result.persona,
      coverage: row.result.coverage,
      popularity: row.result.averagePopularity,
      year: row.result.avgYear,
    })),
    hot100: (chartPlaylists.find(playlist => playlist.name === 'Billboard Hot 100')?.tracks ?? []).map(track => ({
      name: track.name,
      artists: track.artistIds.map(artistId => corpus.artists[artistId]?.name ?? artistId).join(', '),
      year: parseInt(track.release.slice(0, 4), 10) || 0,
    })),
  };
}

function compare(current: ReturnType<typeof score>, previous: ReturnType<typeof score> | null) {
  if (!previous) return null;
  const lines: string[] = [];
  const thresholdKeys = Object.keys(current.thresholds) as (keyof typeof PERSONA_THRESHOLDS)[];
  for (const key of thresholdKeys) {
    if (current.thresholds[key] !== previous.thresholds[key]) {
      lines.push(`${key} cutoff ${previous.thresholds[key]} → ${current.thresholds[key]}`);
    }
  }
  for (const vibe of current.vibeTargets) {
    const before = previous.vibeTargets.find(item => item.name === vibe.name);
    if (!before) continue;
    const moved = (['valence', 'arousal', 'complexity', 'rawness', 'socialPresence'] as const)
      .filter(dim => vibe[dim] !== before[dim]);
    if (moved.length) lines.push(`${vibe.name} target moved on ${moved.join(', ')}`);
  }
  if ('vacrs' in previous && previous.vacrs) {
    for (const axis of current.vacrs.axes) {
      const before = previous.vacrs.axes.find(item => item.name === axis.name);
      if (before && Math.abs(axis.songMean - before.songMean) >= 0.03) {
        lines.push(`${axis.name} song mean ${before.songMean} → ${axis.songMean}`);
      }
    }
  }
  for (const row of current.switches) {
    const before = previous.switches.find(item => item.name === row.name);
    if (!before) continue;
    const now = round(row.majorityCount / row.total * 100);
    const then = round(before.majorityCount / before.total * 100);
    if (row.majority !== before.majority || Math.abs(now - then) >= 5) {
      lines.push(`${row.name}: ${before.majorityCount}/${before.total} ${before.majority} → ${row.majorityCount}/${row.total} ${row.majority}`);
    }
  }
  for (const row of current.gaps) {
    const before = previous.gaps.find(item => item.name === row.name);
    if (before && Math.abs(row.gap - before.gap) >= 2) {
      lines.push(`${row.name} gap ${before.gap} → ${row.gap} percentage points`);
    }
  }
  for (const persona of current.personas) {
    const before = previous.personas.find(item => item.name === persona.name);
    const previousCount = before?.count ?? 0;
    if (persona.count !== previousCount) {
      lines.push(`${persona.name}: ${previousCount} → ${persona.count} playlists`);
    }
  }
  return { previousId: previous.id, previousLabel: previous.label, lines };
}

function writeCanvas(report: ReturnType<typeof score> & { runs: RunIndexEntry[]; comparison: ReturnType<typeof compare>; corpusNote: string }) {
  const source = `import {
  BarChart,
  Callout,
  CollapsibleSection,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Stack,
  Stat,
  Table,
  Text,
  UsageBar,
  useHostTheme,
} from "cursor/canvas";

const REPORT = ${JSON.stringify(report, null, 2)};

function PersonaMap() {
  const theme = useHostTheme();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(8, minmax(0, 1fr))", gap: 4 }}>
      {REPORT.personas.map(persona => (
        <div
          key={persona.name}
          title={persona.name + ": " + persona.count + (persona.count === 1 ? " playlist" : " playlists")}
          style={{
            height: 28,
            background: persona.count > 0 ? theme.accent.primary : theme.fill.tertiary,
          }}
        />
      ))}
    </div>
  );
}

export default function VibePersonaCoverage() {
  const leaders = REPORT.personas.filter(persona => persona.count > 0).sort((left, right) => right.count - left.count);
  const comparison = REPORT.comparison as { previousLabel: string; lines: string[] } | null;
  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <H1>Where the model piles up</H1>
        <Text tone="secondary">
          {REPORT.headline.top3Names.join(", ")} hold {REPORT.headline.top3SongShare}% of classified songs.
          {" "}{REPORT.headline.personasHit} of {REPORT.headline.personaTotal} personas appear.
          Run {REPORT.label}, scored {REPORT.at.slice(0, 16).replace("T", " ")} UTC against the corpus from {REPORT.corpusFetchedAt.slice(0, 10)}.
        </Text>
      </Stack>

      <Grid columns={4} gap={16}>
        <Stat value={REPORT.headline.personasHit + " / " + REPORT.headline.personaTotal} label="Personas with a playlist" tone="warning" />
        <Stat value={REPORT.headline.vibesHit + " / " + REPORT.headline.vibeTotal} label="Vibes with a playlist" />
        <Stat value={REPORT.headline.top3SongShare + "%"} label="Songs in the top 3 vibes" tone="warning" />
        <Stat value={String(REPORT.switches.filter(row => row.stuck).length)} label="Switches stuck past 75%" tone="warning" />
      </Grid>

      <Stack gap={10}>
        <H2>Persona switches on the genre playlists</H2>
        <Text tone="secondary" size="small">
          Each bar is all {REPORT.headline.playlists} genre playlists. A switch is stuck when one side holds at least 75%. High genre diversity means unique tags exceed half of all tag occurrences. High artist consistency means unique artists are under half the songs. New means average release year is within {REPORT.thresholds.newEraWithinYears} years of {REPORT.eraYear}.
        </Text>
        {REPORT.switches.map(row => (
          <UsageBar
            key={row.name}
            total={row.total}
            topLeftLabel={row.name}
            topRightLabel={row.majorityCount + " " + row.majority + " / " + row.minorityCount + " " + row.minority}
            segments={[
              { id: "majority", value: row.majorityCount, color: row.stuck ? "orange" : "blue" },
              { id: "minority", value: row.minorityCount, color: "gray" },
            ]}
          />
        ))}
      </Stack>

      <Stack gap={8}>
        <H2>VACRS scores behind the vibe names</H2>
        <Text tone="secondary" size="small">
          A vibe is the nearest of 15 target points in this five-axis space. Each chart runs from 0 to 1 in tenths. Bars are the share of classified songs, the share of genre playlists that produced a score, and the share of the 15 vibe targets in that tenth. {REPORT.vacrs.unscoredPlaylists} playlists had no classifiable tags and are left out, because an empty score is the neutral 0.5 point rather than a measured one.
        </Text>
        <Table
          headers={["Axis", "Song mean", "Playlist mean", "Target mean"]}
          columnAlign={["left", "right", "right", "right"]}
          rows={REPORT.vacrs.axes.map(axis => [axis.name, String(axis.songMean), String(axis.playlistMean), String(axis.targetMean)])}
        />
        <Text>{REPORT.vacrs.reading}</Text>
        <Grid columns={2} gap={16}>
          {REPORT.vacrs.axes.map(axis => (
            <Stack key={axis.name} gap={4}>
              <H3>{axis.name}</H3>
              <BarChart
                height={200}
                categories={REPORT.vacrs.bins}
                valueSuffix="%"
                series={[
                  { name: "Songs", data: axis.songs },
                  { name: "Playlists", data: axis.playlists },
                  { name: "Vibe targets", data: axis.targets },
                ]}
              />
            </Stack>
          ))}
        </Grid>
        <Text tone="tertiary" size="small">
          Axis units are the model's 0–1 score, and each category is one tenth of that range. Song and playlist shares use the genre-playlist sample. Target share is where MUSIC_VIBES places its 15 points, not a listening count.
        </Text>
      </Stack>

      <Stack gap={8}>
        <H2>Songs versus the space each vibe owns</H2>
        <Text tone="secondary" size="small">
          Percentage points: share of {REPORT.headline.songs} classified songs, minus that vibe's share of a 59,049-point sample of the vibe cube. Above zero, songs crowd in past the model's own territory. Below zero, the model has a region these genre tags barely enter.
        </Text>
        <BarChart
          horizontal
          beginAtZero={false}
          height={480}
          categories={REPORT.gaps.map(row => row.name)}
          valueSuffix=" pp"
          referenceLines={[{ value: 0, label: "even with the model" }]}
          series={[{ name: "Song share minus model share", data: REPORT.gaps.map(row => row.gap) }]}
        />
        <Text>{REPORT.reading}</Text>
      </Stack>

      <Grid columns={2} gap={20}>
        <Stack gap={8}>
          <H2>The 64 persona cells</H2>
          <Text tone="secondary" size="small">
            One square per persona, in model order. Filled squares got at least one of the {REPORT.headline.playlists} genre playlists. Hover a square for its name.
          </Text>
          <PersonaMap />
          <Text tone="tertiary" size="small">{REPORT.headline.personaTotal - REPORT.headline.personasHit} cells are empty on this sample.</Text>
        </Stack>
        <Stack gap={8}>
          <H3>Playlists per persona that appeared</H3>
          <BarChart
            horizontal
            height={Math.max(220, leaders.length * 28)}
            categories={leaders.map(persona => persona.name)}
            series={[{ name: "Genre playlists", data: leaders.map(persona => persona.count) }]}
          />
        </Stack>
      </Grid>

      <Divider />

      <Stack gap={8}>
        <H2>Runs</H2>
        <Text tone="secondary" size="small">
          npm run coverage rescores the saved corpus with the current model. Add -- --label "note" to name the run. npm run coverage:refresh replaces the corpus from Spotify, then scores. Files: analysis/corpus.json and analysis/runs/.
        </Text>
        <Table
          headers={["When (UTC)", "Label", "Personas", "Vibes", "Leading song vibe"]}
          rows={REPORT.runs.map(run => [run.at.slice(0, 16).replace("T", " "), run.label, String(run.personasHit), String(run.vibesHit), run.topVibe])}
        />
        {comparison ? (
          <Stack gap={6}>
            <H3>Change since {comparison.previousLabel}</H3>
            {comparison.lines.length > 0 ? (
              <Table headers={["What moved"]} rows={comparison.lines.map(line => [line])} />
            ) : (
              <Text>The cutoffs, vibe targets, switch balance, and persona counts match the previous run.</Text>
            )}
          </Stack>
        ) : (
          <Callout tone="info" title="Baseline">
            This is the first stored run. Change a vibe target or a cutoff in PERSONA_THRESHOLDS, then run npm run coverage. The next report lists what moved.
          </Callout>
        )}
      </Stack>

      <CollapsibleSection title="Sample behind the bars" count={REPORT.stations.length + REPORT.charts.length}>
        <Stack gap={12}>
          <Text tone="secondary" size="small">{REPORT.corpusNote}</Text>
          <H3>Chart playlists, scored on their own</H3>
          <Table
            headers={["Playlist", "Owner", "Vibe", "Persona", "Coverage", "Popularity", "Year"]}
            columnAlign={["left", "left", "left", "left", "right", "right", "right"]}
            rows={REPORT.charts.map(chart => [chart.name, chart.owner, chart.vibe, chart.persona, Math.round(chart.coverage * 100) + "%", String(chart.popularity), String(chart.year)])}
          />
          <H3>Genre-search playlists</H3>
          <Table
            headers={["Search", "Playlist", "Owner", "Tracks", "Vibe", "Persona"]}
            rows={REPORT.stations.map(station => [station.query, station.name, station.owner, String(station.tracks), station.vibe, station.persona])}
          />
          <CollapsibleSection title="Billboard Hot 100, first tracks in playlist order" count={REPORT.hot100.length}>
            <Table
              headers={["#", "Song", "Artists", "Year"]}
              columnAlign={["right", "left", "left", "right"]}
              rows={REPORT.hot100.map((song, index) => [String(index + 1), song.name, song.artists, String(song.year)])}
            />
          </CollapsibleSection>
        </Stack>
      </CollapsibleSection>
    </Stack>
  );
}
`;
  fs.mkdirSync(path.dirname(CANVAS_PATH), { recursive: true });
  fs.writeFileSync(CANVAS_PATH, source);
  console.error(`wrote canvas ${CANVAS_PATH}`);
}

async function main() {
  const refresh = process.argv.includes('--refresh');
  let corpus: Corpus;
  if (refresh || !fs.existsSync(CORPUS_PATH)) {
    corpus = await refreshCorpus();
  } else {
    corpus = readJson<Corpus>(CORPUS_PATH);
  }
  const previousEntries: RunIndexEntry[] = fs.existsSync(INDEX_PATH) ? readJson<{ runs: RunIndexEntry[] }>(INDEX_PATH).runs : [];
  const label = argValue('--label') || (previousEntries.length === 0 ? 'baseline' : 'rescore');
  const scored = score(corpus, label);
  const previous = previousEntries[0] ? readJson<ReturnType<typeof score>>(path.join(ROOT, previousEntries[0].file)) : null;
  const comparison = compare(scored, previous);
  const entry: RunIndexEntry = {
    id: scored.id,
    at: scored.at,
    label: scored.label,
    personasHit: scored.headline.personasHit,
    vibesHit: scored.headline.vibesHit,
    topVibe: scored.headline.top3Names[0] ?? '',
    file: path.relative(ROOT, path.join(RUNS_DIR, `${scored.id}.json`)).replace(/\\/g, '/'),
  };
  const runs = [entry, ...previousEntries.filter(item => item.id !== entry.id)];
  fs.mkdirSync(RUNS_DIR, { recursive: true });
  fs.writeFileSync(path.join(RUNS_DIR, `${scored.id}.json`), JSON.stringify({ ...scored, comparison }, null, 2));
  fs.writeFileSync(INDEX_PATH, JSON.stringify({ runs }, null, 2));
  writeCanvas({ ...scored, runs, comparison, corpusNote: corpus.note });
  console.error(`stored ${entry.file} personas=${entry.personasHit} top=${entry.topVibe}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
