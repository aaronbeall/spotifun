import { EraSnapshot, Stats, TimeRange } from '@/types';
import { calculateWeightedVACRSScore } from './musicClassification';
import { getUserPersona } from './musicPersonas';

export type StoryKind =
  | 'persona'
  | 'replay'
  | 'once'
  | 'run'
  | 'hour'
  | 'window'
  | 'years'
  | 'built'
  | 'drift'
  | 'length'
  | 'concentration'
  | 'empty';

export interface StorySlide {
  id: string;
  kind: StoryKind;
  kicker: string;
  headline: string;
  detail: string;
  accent?: string;
  hour?: number;
  hourCount?: number;
  hourTotal?: number;
  runCount?: number;
  replayCount?: number;
  yearFrom?: number;
  yearTo?: number;
  yearFromTitle?: string;
  yearToTitle?: string;
  earlyPopularity?: number;
  latePopularity?: number;
}

export type FindingKind = 'replay' | 'streak' | 'deepcut' | 'span' | 'coverage';

export interface Finding {
  id: string;
  kind: FindingKind;
  hit: boolean;
  title: string;
  fact: string;
  detail: string;
  count?: number;
  from?: number;
  to?: number;
  name?: string;
  artist?: string;
  percent?: number;
}

export interface ViewSnapshot {
  label: string;
  popularity: number;
  genreDiversity: number;
  valence: number;
  arousal: number;
  /** False when the open view has no songs or artists to plot. */
  plot: boolean;
}

export type ShiftMetric = 'popularity' | 'genreDiversity' | 'valence' | 'arousal';

export interface ShiftRead {
  sentence: string;
  standout: ShiftMetric | null;
  baselineLabel: string;
  deltas: Record<ShiftMetric, number>;
}

const YEAR_STORY_SPAN = 8;
const YEAR_FINDING_SPAN = 20;
const DEEP_CUT = 20;
const REPLAY_FINDING = 3;
const STREAK_FINDING = 5;
const COVERAGE_LINE = 0.8;

function releaseYear(track: SpotifyApi.TrackObjectFull): number | null {
  const raw = track.album?.release_date;
  if (!raw || raw.length < 4) return null;
  const year = parseInt(raw.slice(0, 4), 10);
  if (!Number.isFinite(year) || year < 1900 || year > new Date().getFullYear() + 1) return null;
  return year;
}

function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'}`;
  if (hours > 0) {
    const remain = minutes % 60;
    return remain > 0 ? `${hours}h ${remain}m` : `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}

function formatSpan(ms: number): string {
  const minutes = Math.max(1, Math.round(ms / 60000));
  if (minutes < 90) return `${minutes} minutes`;
  const hours = Math.round(ms / 3600000);
  if (hours < 36) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  const days = Math.round(ms / 86400000);
  if (days < 60) return `${days} days`;
  const months = Math.round(days / 30.44);
  if (months < 24) return `${months} months`;
  const years = Math.round(days / 365.25);
  return `${years} ${years === 1 ? 'year' : 'years'}`;
}

export function formatHour(hour: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  return `${h} ${suffix}`;
}

function formatWhen(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function hasMusic(stats: Stats): boolean {
  return stats.tracks.length > 0 || stats.artists.length > 0 || stats.recentlyPlayed.length > 0;
}

function longestRun(stats: Stats): { count: number; name: string } {
  let best = { count: 0, name: '' };
  let run = 0;
  let id = '';
  let name = '';
  for (const item of stats.recentlyPlayed) {
    const artist = item.track.artists[0];
    if (artist && artist.id === id) {
      run += 1;
    } else {
      id = artist?.id ?? '';
      name = artist?.name ?? '';
      run = artist ? 1 : 0;
    }
    if (run > best.count) best = { count: run, name };
  }
  return best;
}

function playTimestamps(stats: Stats): number[] {
  return stats.recentlyPlayed
    .map(item => Date.parse(item.played_at))
    .filter(time => Number.isFinite(time));
}

function addedTimestamps(stats: Stats): { at: number; popularity: number }[] {
  return stats.tracks
    .map(item => ({ at: Date.parse(item.firstPlayed), popularity: item.track.popularity ?? 0 }))
    .filter(item => Number.isFinite(item.at))
    .sort((a, b) => a.at - b.at);
}

function datedTracks(stats: Stats): { year: number; title: string }[] {
  return stats.tracks.flatMap(item => {
    const year = releaseYear(item.track);
    return year == null ? [] : [{ year, title: item.track.name }];
  });
}

function personaSlide(stats: Stats): StorySlide {
  const persona = getUserPersona(stats);
  return {
    id: 'persona',
    kind: 'persona',
    kicker: 'The persona for this view',
    headline: persona.name,
    detail: persona.description,
    accent: persona.color,
  };
}

function replaySlide(stats: Stats): StorySlide | null {
  if (stats.tracks.length === 0) return null;
  const ranked = [...stats.tracks].sort((a, b) => b.playCount - a.playCount);
  const top = ranked[0];
  const oneOffs = stats.tracks.filter(track => track.playCount === 1).length;
  if (top.playCount < 2) {
    return {
      id: 'once',
      kind: 'once',
      kicker: 'Repeats in this window',
      headline: 'Once each',
      detail: `All ${stats.tracks.length} songs show up a single time.`,
    };
  }
  return {
    id: 'replay',
    kind: 'replay',
    kicker: 'On repeat',
    headline: top.track.name,
    detail: `${top.playCount} plays in these ${stats.overview.totalPlays}. ${oneOffs} ${oneOffs === 1 ? 'song shows' : 'songs show'} up once.`,
    replayCount: top.playCount,
  };
}

function runSlide(stats: Stats): StorySlide | null {
  const run = longestRun(stats);
  if (run.count < 3 || !run.name) return null;
  return {
    id: 'run',
    kind: 'run',
    kicker: 'Back to back',
    headline: run.name,
    detail: `${run.count} plays in a row, with no other artist between them.`,
    runCount: run.count,
  };
}

function hourSlide(stats: Stats): StorySlide | null {
  const stamps = playTimestamps(stats);
  if (stamps.length < 3) return null;
  const hours = new Array<number>(24).fill(0);
  for (const stamp of stamps) hours[new Date(stamp).getHours()] += 1;
  let hour = 0;
  for (let i = 1; i < 24; i += 1) {
    if (hours[i] > hours[hour]) hour = i;
  }
  const count = hours[hour];
  if (count < 3 && count / stamps.length < 0.2) return null;
  return {
    id: 'hour',
    kind: 'hour',
    kicker: 'When these plays happened',
    headline: formatHour(hour),
    detail: `${count} of ${stamps.length} plays fall in that hour.`,
    hour,
    hourCount: count,
    hourTotal: stamps.length,
  };
}

function windowSlide(stats: Stats): StorySlide | null {
  const stamps = playTimestamps(stats);
  if (stamps.length < 2) return null;
  const min = Math.min(...stamps);
  const max = Math.max(...stamps);
  if (max - min < 60_000) return null;
  return {
    id: 'window',
    kind: 'window',
    kicker: 'How long this window is',
    headline: formatSpan(max - min),
    detail: `From ${formatWhen(min)} to ${formatWhen(max)}.`,
  };
}

function yearsSlide(stats: Stats): StorySlide | null {
  const dated = datedTracks(stats);
  if (dated.length < 2) return null;
  const oldest = dated.reduce((a, b) => (a.year <= b.year ? a : b));
  const newest = dated.reduce((a, b) => (a.year >= b.year ? a : b));
  if (newest.year - oldest.year < YEAR_STORY_SPAN) return null;
  return {
    id: 'years',
    kind: 'years',
    kicker: 'Release years in this view',
    headline: `${oldest.year} → ${newest.year}`,
    detail: `${newest.year - oldest.year} years from the oldest song here to the newest.`,
    yearFrom: oldest.year,
    yearTo: newest.year,
    yearFromTitle: oldest.title,
    yearToTitle: newest.title,
  };
}

function lengthSlide(stats: Stats): StorySlide | null {
  if (stats.overview.totalDuration <= 0) return null;
  return {
    id: 'length',
    kind: 'length',
    kicker: 'Length of these tracks',
    headline: formatDuration(stats.overview.totalDuration),
    detail: 'The songs added together. This is not time spent listening.',
  };
}

function builtSlide(stats: Stats): StorySlide | null {
  const dated = addedTimestamps(stats);
  if (dated.length < 2) return null;
  const span = dated[dated.length - 1].at - dated[0].at;
  if (span < 12 * 60 * 60 * 1000) {
    return {
      id: 'built',
      kind: 'built',
      kicker: 'How it was collected',
      headline: 'One sitting',
      detail: `The dated songs were added between ${formatWhen(dated[0].at)} and ${formatWhen(dated[dated.length - 1].at)}.`,
    };
  }
  return {
    id: 'built',
    kind: 'built',
    kicker: 'How it was collected',
    headline: formatSpan(span),
    detail: `From ${formatWhen(dated[0].at)} to ${formatWhen(dated[dated.length - 1].at)}.`,
  };
}

function driftSlide(stats: Stats): StorySlide | null {
  const dated = addedTimestamps(stats);
  if (dated.length < 4) return null;
  const mid = Math.floor(dated.length / 2);
  const mean = (items: { popularity: number }[]) =>
    Math.round(items.reduce((sum, item) => sum + item.popularity, 0) / items.length);
  const early = mean(dated.slice(0, mid));
  const late = mean(dated.slice(mid));
  const delta = late - early;
  let headline = 'Same band';
  let detail = `Earlier songs average ${early}. Later songs average ${late}.`;
  if (delta <= -5) {
    headline = `${early - late} points more niche`;
    detail = `Songs added later average ${late}, against ${early} for the earlier half.`;
  } else if (delta >= 5) {
    headline = `${late - early} points more mainstream`;
    detail = `Songs added later average ${late}, against ${early} for the earlier half.`;
  }
  return {
    id: 'drift',
    kind: 'drift',
    kicker: 'Earlier adds against later ones',
    headline,
    detail,
    earlyPopularity: early,
    latePopularity: late,
  };
}

function concentrationSlide(stats: Stats): StorySlide | null {
  if (stats.mode !== 'topTracks' || stats.tracks.length < 5) return null;
  const counts = new Map<string, { name: string; count: number }>();
  for (const item of stats.tracks) {
    const artist = item.track.artists[0];
    if (!artist) continue;
    const current = counts.get(artist.id) ?? { name: artist.name, count: 0 };
    current.count += 1;
    counts.set(artist.id, current);
  }
  const top = [...counts.values()].sort((a, b) => b.count - a.count)[0];
  if (!top || top.count < 3) return null;
  return {
    id: 'concentration',
    kind: 'concentration',
    kicker: 'Who takes the list',
    headline: top.name,
    detail: `${top.count} of these ${stats.tracks.length} songs.`,
    runCount: top.count,
  };
}

export function buildStorySlides(stats: Stats): StorySlide[] {
  if (!hasMusic(stats)) {
    return [{
      id: 'empty',
      kind: 'empty',
      kicker: 'This view',
      headline: 'Nothing to read',
      detail: stats.mode === 'playlist'
        ? 'This playlist has no songs to analyze.'
        : 'There are no songs in this view yet.',
    }];
  }

  const slides: StorySlide[] = [personaSlide(stats)];
  if (stats.mode === 'recent') {
    const replay = replaySlide(stats);
    const run = runSlide(stats);
    const hour = hourSlide(stats);
    const window = windowSlide(stats);
    if (replay) slides.push(replay);
    if (run) slides.push(run);
    if (hour) slides.push(hour);
    if (window) slides.push(window);
  }
  if (stats.mode === 'playlist') {
    const built = builtSlide(stats);
    const drift = driftSlide(stats);
    if (built) slides.push(built);
    if (drift) slides.push(drift);
  }
  const concentration = concentrationSlide(stats);
  const years = yearsSlide(stats);
  const length = lengthSlide(stats);
  if (concentration) slides.push(concentration);
  if (years) slides.push(years);
  if (length) slides.push(length);
  return slides;
}

export function viewScope(stats: Stats): string {
  if (stats.mode === 'playlist') {
    return stats.playlist?.name ? `In ${stats.playlist.name}` : 'In this playlist';
  }
  if (stats.mode === 'recent') {
    const n = stats.recentlyPlayed.length;
    return `In these ${n} ${n === 1 ? 'play' : 'plays'}`;
  }
  const range = stats.timeRange === 'short_term'
    ? 'last 4 weeks'
    : stats.timeRange === 'long_term'
      ? 'several-year list'
      : 'last 6 months';
  return stats.mode === 'topArtists' ? `In your ${range} artists` : `In your ${range} tracks`;
}

export function buildFindings(stats: Stats): Finding[] {
  if (!hasMusic(stats)) return [];
  const findings: Finding[] = [];

  if (stats.mode === 'recent' && stats.tracks.length > 0) {
    const top = [...stats.tracks].sort((a, b) => b.playCount - a.playCount)[0];
    const hit = top.playCount >= REPLAY_FINDING;
    findings.push({
      id: 'replay',
      kind: 'replay',
      hit,
      title: 'Replay',
      fact: hit
        ? `${top.playCount} plays of “${top.track.name}”`
        : `Most played is “${top.track.name}”, ${top.playCount} ${top.playCount === 1 ? 'time' : 'times'}`,
      detail: hit
        ? `In these ${stats.overview.totalPlays} plays. The mark is ${REPLAY_FINDING}.`
        : `Nothing in this window reaches ${REPLAY_FINDING} plays.`,
      count: top.playCount,
      name: top.track.name,
      artist: top.track.artists[0]?.name,
    });

    const run = longestRun(stats);
    const streak = run.count >= STREAK_FINDING;
    findings.push({
      id: 'streak',
      kind: 'streak',
      hit: streak,
      title: 'Streak',
      fact: run.name
        ? `${run.count} ${run.name} ${run.count === 1 ? 'play' : 'plays'} in a row`
        : 'No artist run',
      detail: streak
        ? `Consecutive plays, with nobody else in between. The mark is ${STREAK_FINDING}.`
        : `The longest run in this window is ${run.count}. The mark is ${STREAK_FINDING}.`,
      count: run.count,
      name: run.name,
    });
  }

  if (stats.tracks.length > 0) {
    const lowest = [...stats.tracks].sort((a, b) => (a.track.popularity ?? 0) - (b.track.popularity ?? 0))[0];
    const popularity = lowest.track.popularity ?? 0;
    const hit = popularity < DEEP_CUT;
    findings.push({
      id: 'deepcut',
      kind: 'deepcut',
      hit,
      title: 'Deep cut',
      fact: `“${lowest.track.name}” at popularity ${popularity}`,
      detail: hit
        ? `Under ${DEEP_CUT} on Spotify’s 0–100 scale.`
        : `The lowest song here is ${popularity}. A deep cut is under ${DEEP_CUT}.`,
      count: popularity,
      name: lowest.track.name,
      artist: lowest.track.artists[0]?.name,
    });
  }

  const dated = datedTracks(stats);
  if (dated.length >= 2) {
    const from = Math.min(...dated.map(item => item.year));
    const to = Math.max(...dated.map(item => item.year));
    const span = to - from;
    const hit = span >= YEAR_FINDING_SPAN;
    findings.push({
      id: 'span',
      kind: 'span',
      hit,
      title: 'Year span',
      fact: `${from} to ${to}`,
      detail: hit
        ? `${span} years between the oldest and newest release here.`
        : `${span} years between releases. The mark is ${YEAR_FINDING_SPAN}.`,
      from,
      to,
      count: span,
    });
  }

  const coverage = stats.overview.genreCoverage ?? 0;
  const percent = Math.round(coverage * 100);
  const covered = coverage >= COVERAGE_LINE;
  findings.push({
    id: 'coverage',
    kind: 'coverage',
    hit: covered,
    title: 'Genre coverage',
    fact: `${percent}% of the genre weight mapped`,
    detail: covered
      ? 'Enough of the tags landed on a known trait to clear 80%.'
      : 'The mark is 80% of genre weight on a known trait.',
    percent,
  });

  return findings;
}

function viewLabel(stats: Stats): string {
  if (stats.mode === 'recent') return 'Recent plays';
  if (stats.mode === 'playlist') return stats.playlist?.name ?? 'This playlist';
  if (stats.mode === 'topArtists') return 'These artists';
  return 'These tracks';
}

export function currentViewSnapshot(stats: Stats): ViewSnapshot {
  const weighted = calculateWeightedVACRSScore(stats.genres);
  return {
    label: viewLabel(stats),
    popularity: stats.overview.averagePopularity,
    genreDiversity: stats.overview.genreDiversity,
    valence: weighted.valence,
    arousal: weighted.arousal,
    plot: hasMusic(stats),
  };
}

function baselineNoun(range: TimeRange): string {
  if (range === 'short_term') return 'your top artists from about the last 4 weeks';
  if (range === 'medium_term') return 'your top artists from about the last 6 months';
  return 'your top artists across several years';
}

function leanPhrase(metric: ShiftMetric, delta: number): string {
  if (metric === 'popularity') {
    const points = Math.abs(Math.round(delta));
    return `${points} ${points === 1 ? 'point' : 'points'} more ${delta < 0 ? 'niche' : 'mainstream'}`;
  }
  if (metric === 'genreDiversity') {
    return delta < 0 ? 'toward a tighter genre spread' : 'toward a wider genre spread';
  }
  if (metric === 'valence') return delta < 0 ? 'darker' : 'brighter';
  return delta < 0 ? 'calmer' : 'more energetic';
}

export function readShift(current: ViewSnapshot, eras: EraSnapshot[], stats: Stats): ShiftRead | null {
  const populated = eras.filter(era => era.artists > 0 || era.tracks > 0);
  if (populated.length === 0) return null;

  const sameRange = stats.mode === 'topArtists' || stats.mode === 'topTracks' ? stats.timeRange : null;
  const preferred = sameRange === 'long_term' ? 'short_term' : 'long_term';
  const baseline = populated.find(era => era.timeRange === preferred)
    ?? populated.find(era => era.timeRange !== sameRange)
    ?? populated[0];

  const deltas: Record<ShiftMetric, number> = {
    popularity: current.popularity - baseline.popularity,
    genreDiversity: current.genreDiversity - baseline.genreDiversity,
    valence: current.valence - baseline.valence,
    arousal: current.arousal - baseline.arousal,
  };

  const noun = baselineNoun(baseline.timeRange);
  if (!current.plot) {
    return {
      sentence: `This view has no songs to set next to ${noun}.`,
      standout: null,
      baselineLabel: baseline.label,
      deltas,
    };
  }

  const magnitude: Record<ShiftMetric, number> = {
    popularity: Math.abs(deltas.popularity) / 100,
    genreDiversity: Math.abs(deltas.genreDiversity),
    valence: Math.abs(deltas.valence),
    arousal: Math.abs(deltas.arousal),
  };
  const ranked = (Object.keys(magnitude) as ShiftMetric[])
    .filter(metric => magnitude[metric] >= 0.08)
    .sort((a, b) => magnitude[b] - magnitude[a]);

  if (ranked.length === 0) {
    return {
      sentence: `This view sits close to ${noun} on popularity, genre spread, mood, and energy.`,
      standout: null,
      baselineLabel: baseline.label,
      deltas,
    };
  }

  const phrases = ranked
    .slice(0, 2)
    .sort((a, b) => Number(a === 'genreDiversity') - Number(b === 'genreDiversity'))
    .map(metric => leanPhrase(metric, deltas[metric]));
  const joined = phrases.length === 2 ? `${phrases[0]} and ${phrases[1]}` : phrases[0];
  return {
    sentence: `Against ${noun}, this view leans ${joined}.`,
    standout: ranked[0],
    baselineLabel: baseline.label,
    deltas,
  };
}
