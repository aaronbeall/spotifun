/**
 * Last.fm user data: profile, scrobbles, top lists, loved tracks and now playing.
 *
 * Only public profile data is read, so a username is all a listener needs to give us.
 * Everything goes through the shared cache and throttle in ./apiCache. Last.fm returns no
 * usable artwork (and its API terms exclude images), so tracks and artists come back with
 * empty image lists for ./deezer to fill.
 */
import type { Album, Artist, ArtistRef, Play, Track } from '@/types/music';
import type { TimeRange } from '@/types';
import { cachedJson, TTL, type ErrorKind } from './apiCache';

const API_BASE = process.env.LASTFM_API_BASE || 'https://ws.audioscrobbler.com/2.0/';

// https://www.last.fm/api/errorcodes
const ERROR_INVALID_PARAMETERS = 6; // also "User not found"
const ERROR_LOGIN_REQUIRED = 17; // the user hides their recent listening
const ERROR_RATE_LIMIT = 29;
const TRANSIENT_ERRORS = new Set([8, 11, 16]);

/** How long each top-list period stays cached. Longer periods change more slowly. */
const TOP_LIST_TTL: Record<TimeRange, number> = {
  '7day': TTL.fifteenMinutes,
  '1month': TTL.hour,
  '3month': TTL.sixHours,
  '6month': TTL.sixHours,
  '12month': TTL.sixHours,
  overall: TTL.day,
};

export class LastFmUserNotFoundError extends Error {
  constructor(readonly username: string) {
    super(`Last.fm user not found: ${username}`);
    this.name = 'LastFmUserNotFoundError';
  }
}

/** The listener hides their recent listening in Last.fm's privacy settings. */
export class LastFmPrivateError extends Error {
  constructor() {
    super('Last.fm recent listening is private');
    this.name = 'LastFmPrivateError';
  }
}

export class LastFmUnavailableError extends Error {
  constructor(readonly kind: ErrorKind) {
    super(`Last.fm unavailable (${kind})`);
    this.name = 'LastFmUnavailableError';
  }
}

interface LastFmErrorBody {
  error?: number;
  message?: string;
}

// ---------- Ids and normalization ----------

const normalizeName = (name: string) => name.normalize('NFKC').toLowerCase().trim().replace(/\s+/g, ' ');

export const artistIdFor = (name: string) => `artist:${normalizeName(name)}`;
export const trackIdFor = (artist: string, track: string) => `track:${normalizeName(artist)}|${normalizeName(track)}`;
export const albumIdFor = (artist: string, album: string) => `album:${normalizeName(artist)}|${normalizeName(album)}`;

/** Last.fm returns a lone object instead of a one-item array */
function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

const textOf = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record['#text'] === 'string') return record['#text'];
    if (typeof record.name === 'string') return record.name;
  }
  return '';
};

const mbidOf = (value: unknown): string | undefined => {
  const mbid = value && typeof value === 'object' ? (value as { mbid?: unknown }).mbid : undefined;
  return typeof mbid === 'string' && mbid ? mbid : undefined;
};

const lastFmMusicUrl = (...parts: string[]) =>
  `https://www.last.fm/music/${parts.map(part => encodeURIComponent(part).replace(/%20/g, '+')).join('/')}`;

export function artistRef(name: string, raw?: unknown): ArtistRef {
  const url = raw && typeof raw === 'object' && typeof (raw as { url?: unknown }).url === 'string'
    ? (raw as { url: string }).url
    : lastFmMusicUrl(name);
  return { id: artistIdFor(name), name, url, mbid: mbidOf(raw) };
}

export function emptyArtist(ref: ArtistRef): Artist {
  return { ...ref, images: [], genres: [] };
}

function buildTrack(raw: RawTrack): Track | null {
  const name = textOf(raw.name);
  const artistName = textOf(raw.artist);
  if (!name || !artistName) return null;
  const albumName = textOf(raw.album);
  const album: Album = {
    id: albumName ? albumIdFor(artistName, albumName) : albumIdFor(artistName, name),
    name: albumName,
    images: [],
  };
  const durationSeconds = Number(raw.duration);
  const playcount = Number(raw.playcount);
  return {
    id: trackIdFor(artistName, name),
    name,
    artists: [artistRef(artistName, raw.artist)],
    album,
    duration_ms: Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds * 1000 : 0,
    url: typeof raw.url === 'string' && raw.url ? raw.url : lastFmMusicUrl(artistName, '_', name),
    mbid: mbidOf(raw),
    ...(Number.isFinite(playcount) && playcount > 0 ? { playcount } : {}),
  };
}

// ---------- Raw response shapes ----------

interface RawTrack {
  name?: unknown;
  artist?: unknown;
  album?: unknown;
  url?: unknown;
  mbid?: unknown;
  duration?: unknown;
  playcount?: unknown;
  date?: { uts?: string };
  '@attr'?: { nowplaying?: string };
}

interface RawArtist {
  name?: unknown;
  url?: unknown;
  mbid?: unknown;
  playcount?: unknown;
}

interface UserInfoBody extends LastFmErrorBody {
  user?: {
    name?: string;
    realname?: string;
    url?: string;
    playcount?: string;
    country?: string;
    registered?: { unixtime?: string; '#text'?: number | string };
  };
}

interface RecentTracksBody extends LastFmErrorBody {
  recenttracks?: { track?: RawTrack | RawTrack[]; '@attr'?: { total?: string } };
}

interface TopTracksBody extends LastFmErrorBody {
  toptracks?: { track?: RawTrack | RawTrack[] };
}

interface TopArtistsBody extends LastFmErrorBody {
  topartists?: { artist?: RawArtist | RawArtist[] };
}

interface LovedTracksBody extends LastFmErrorBody {
  lovedtracks?: { track?: RawTrack | RawTrack[]; '@attr'?: { total?: string } };
}

// ---------- Requests ----------

function apiKey(): string {
  const key = process.env.LASTFM_API_KEY;
  if (!key) throw new LastFmUnavailableError('error');
  return key;
}

function classifyLastFm(body: LastFmErrorBody): ErrorKind {
  if (!body.error) return 'ok';
  if (body.error === ERROR_RATE_LIMIT) return 'rate-limited';
  if (TRANSIENT_ERRORS.has(body.error)) return 'transient';
  if (body.error === ERROR_INVALID_PARAMETERS) return 'not-found';
  return 'error';
}

async function callUser<T extends LastFmErrorBody>(
  method: string,
  username: string,
  params: Record<string, string>,
  revalidate: number,
  options: { skipProbe?: boolean } = {}
): Promise<T> {
  const url = new URL(API_BASE);
  url.searchParams.set('method', method);
  url.searchParams.set('user', username.toLowerCase());
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set('api_key', apiKey());
  url.searchParams.set('format', 'json');

  const result = await cachedJson<T>(url.toString(), {
    service: 'lastfm',
    revalidate,
    tag: `lastfm-${method}-${username.toLowerCase()}-${Object.values(params).join('-')}`,
    classify: classifyLastFm,
    skipProbe: options.skipProbe,
  });
  if (result.ok) return result.body;
  if (result.body?.error === ERROR_LOGIN_REQUIRED) throw new LastFmPrivateError();
  if (result.kind === 'not-found') throw new LastFmUserNotFoundError(username);
  throw new LastFmUnavailableError(result.kind);
}

export interface LastFmProfile {
  name: string;
  realname?: string;
  url: string;
  playcount: number;
  registeredAt?: string;
  country?: string;
}

export async function getUserInfo(username: string): Promise<LastFmProfile> {
  const body = await callUser<UserInfoBody>('user.getInfo', username, {}, TTL.hour);
  const user = body.user;
  if (!user?.name) throw new LastFmUserNotFoundError(username);
  const unixtime = Number(user.registered?.unixtime ?? user.registered?.['#text']);
  return {
    name: user.name,
    realname: user.realname || undefined,
    url: user.url || `https://www.last.fm/user/${encodeURIComponent(user.name)}`,
    playcount: Number(user.playcount) || 0,
    registeredAt: Number.isFinite(unixtime) && unixtime > 0 ? new Date(unixtime * 1000).toISOString() : undefined,
    country: user.country && user.country !== 'None' ? user.country : undefined,
  };
}

/** Last.fm returns at most 200 scrobbles per page */
export const RECENT_PAGE_MAX = 200;

/** Completed scrobbles, newest first. The now-playing entry is left out. */
export async function getRecentTracks(username: string, limit: number): Promise<Play[]> {
  const body = await callUser<RecentTracksBody>(
    'user.getRecentTracks',
    username,
    { limit: String(Math.min(limit, RECENT_PAGE_MAX)), extended: '1' },
    TTL.minute,
    { skipProbe: true }
  );
  const plays: Play[] = [];
  for (const raw of toArray(body.recenttracks?.track)) {
    if (raw['@attr']?.nowplaying === 'true') continue;
    const uts = Number(raw.date?.uts);
    const track = buildTrack(raw);
    if (!track || !Number.isFinite(uts)) continue;
    plays.push({ track, played_at: new Date(uts * 1000).toISOString() });
  }
  return plays.slice(0, limit);
}

export interface LastFmNowPlaying {
  isPlaying: boolean;
  track: Track | null;
}

/** The scrobbler's live track, or the latest scrobble when nothing is playing */
export async function getNowPlaying(username: string): Promise<LastFmNowPlaying> {
  const body = await callUser<RecentTracksBody>('user.getRecentTracks', username, { limit: '1', extended: '1' }, 0);
  const [first] = toArray(body.recenttracks?.track);
  if (!first) return { isPlaying: false, track: null };
  return { isPlaying: first['@attr']?.nowplaying === 'true', track: buildTrack(first) };
}

export async function getTopTracks(username: string, period: TimeRange, limit: number): Promise<Track[]> {
  const body = await callUser<TopTracksBody>(
    'user.getTopTracks', username, { period, limit: String(limit) }, TOP_LIST_TTL[period]
  );
  return toArray(body.toptracks?.track).map(buildTrack).filter((track): track is Track => track !== null);
}

export async function getTopArtists(username: string, period: TimeRange, limit: number): Promise<Artist[]> {
  const body = await callUser<TopArtistsBody>(
    'user.getTopArtists', username, { period, limit: String(limit) }, TOP_LIST_TTL[period]
  );
  return toArray(body.topartists?.artist).flatMap(raw => {
    const name = textOf(raw.name);
    if (!name) return [];
    const playcount = Number(raw.playcount);
    return [{
      ...emptyArtist(artistRef(name, raw)),
      ...(Number.isFinite(playcount) && playcount > 0 ? { playcount } : {}),
    }];
  });
}

export interface LovedTracks {
  total: number;
  /** Newest first, with the date each was loved */
  tracks: { track: Track; lovedAt: string }[];
}

export async function getLovedTracks(username: string, limit: number): Promise<LovedTracks> {
  const body = await callUser<LovedTracksBody>(
    'user.getLovedTracks', username, { limit: String(Math.min(limit, 1000)) }, TTL.hour
  );
  const tracks = toArray(body.lovedtracks?.track).flatMap(raw => {
    const track = buildTrack(raw);
    const uts = Number(raw.date?.uts);
    return track ? [{ track, lovedAt: Number.isFinite(uts) ? new Date(uts * 1000).toISOString() : '' }] : [];
  });
  return { total: Number(body.lovedtracks?.['@attr']?.total) || tracks.length, tracks };
}
