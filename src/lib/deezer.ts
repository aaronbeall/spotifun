/**
 * Artwork, durations, release dates and popularity from Deezer's public API (no key needed).
 *
 * Last.fm has the listening history but no usable artwork, so every artist and track is
 * matched against Deezer by name. Matches are cached for 30 days through ./apiCache.
 * Deezer's terms don't allow storing its images, so the app only ever links to them.
 */
import type { Artist, MusicImage, Track } from '@/types/music';
import { cachedJson, mapLimit, TTL, type ErrorKind } from './apiCache';

const API_BASE = (process.env.DEEZER_API_BASE || 'https://api.deezer.com').replace(/\/$/, '');

const QUOTA_EXCEEDED = 4;
const NO_DATA = 800;

/** Lookups in flight at once. Cache hits finish at once; misses are spaced by the throttle. */
const CONCURRENCY = 8;

/** Release dates cost one more request per track, so only the first this many tracks get one. */
export const RELEASE_DATE_LIMIT = 25;

interface DeezerErrorBody {
  error?: { code?: number; message?: string };
}

interface DeezerArtist {
  id: number;
  name: string;
  link?: string;
  picture_medium?: string;
  picture_big?: string;
  picture_xl?: string;
  nb_fan?: number;
}

interface DeezerAlbum {
  id: number;
  title: string;
  cover_medium?: string;
  cover_big?: string;
  cover_xl?: string;
  release_date?: string;
}

interface DeezerTrack {
  id: number;
  title: string;
  title_short?: string;
  duration?: number;
  rank?: number;
  release_date?: string;
  artist?: { id: number; name: string };
  album?: DeezerAlbum;
}

interface SearchBody<T> extends DeezerErrorBody {
  data?: T[];
}

type TrackBody = DeezerTrack & DeezerErrorBody;

function classifyDeezer(body: DeezerErrorBody): ErrorKind {
  const code = body.error?.code;
  if (code === undefined) return 'ok';
  if (code === QUOTA_EXCEEDED) return 'rate-limited';
  if (code === NO_DATA) return 'not-found';
  return 'transient';
}

const normalize = (value: string) =>
  value.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Strips "(Remastered 2011)", "- Live", "feat. X" and the like for looser title matching */
const coreTitle = (title: string) =>
  normalize(title.replace(/\s*[([].*?[)\]]\s*/g, ' ').replace(/\s+-\s+.*$/, '').replace(/\s+(feat|ft)\.?\s+.*$/i, ''));

function images(sizes: [string | undefined, number][]): MusicImage[] {
  return sizes.flatMap(([url, size]) => url ? [{ url, width: size, height: size }] : []);
}

/** Deezer rank runs 0 to 1,000,000; the app's popularity scale runs 0 to 100. */
export function popularityFromRank(rank: number | undefined): number | undefined {
  if (rank === undefined || !Number.isFinite(rank) || rank <= 0) return undefined;
  return Math.max(0, Math.min(100, Math.round(rank / 10_000)));
}

/** Fan counts span 100 to 30M+, so they go on a log scale: 10k ≈ 36, 1M ≈ 72, 10M ≈ 90. */
export function popularityFromFans(fans: number | undefined): number | undefined {
  if (fans === undefined || !Number.isFinite(fans) || fans <= 0) return undefined;
  return Math.max(0, Math.min(100, Math.round((Math.log10(fans) - 2) * 18)));
}

async function search<T>(kind: 'artist' | 'track' | 'album', query: string, tag: string): Promise<T[] | null> {
  const url = `${API_BASE}/search/${kind}?q=${encodeURIComponent(query)}&limit=10`;
  const result = await cachedJson<SearchBody<T>>(url, {
    service: 'deezer',
    revalidate: TTL.month,
    tag,
    classify: classifyDeezer,
  });
  if (result.ok) return result.body.data ?? [];
  return result.kind === 'not-found' ? [] : null;
}

export interface DeezerArtistMatch {
  images: MusicImage[];
  popularity?: number;
}

export async function findArtist(name: string): Promise<DeezerArtistMatch | null> {
  const results = await search<DeezerArtist>('artist', name, `deezer-artist-${normalize(name)}`);
  if (!results || results.length === 0) return null;
  const wanted = normalize(name);
  const match = results.find(artist => normalize(artist.name) === wanted);
  if (!match) return null;
  return {
    images: images([[match.picture_big, 500], [match.picture_xl, 1000], [match.picture_medium, 250]]),
    popularity: popularityFromFans(match.nb_fan),
  };
}

export interface DeezerTrackMatch {
  id: number;
  albumName: string;
  albumImages: MusicImage[];
  duration_ms: number;
  popularity?: number;
}

export async function findTrack(artist: string, title: string): Promise<DeezerTrackMatch | null> {
  const tag = `deezer-track-${normalize(artist)}|${normalize(title)}`;
  const wantedArtist = normalize(artist);
  const wantedTitle = coreTitle(title);
  const pick = (results: DeezerTrack[]) =>
    results.find(track => normalize(track.artist?.name ?? '') === wantedArtist && coreTitle(track.title) === wantedTitle)
    ?? results.find(track => normalize(track.artist?.name ?? '') === wantedArtist && coreTitle(track.title_short ?? track.title).startsWith(wantedTitle));

  let results = await search<DeezerTrack>('track', `artist:"${artist}" track:"${title}"`, tag);
  if (results === null) return null;
  let match = pick(results);
  if (!match) {
    // Advanced search is strict about punctuation; a plain query catches most of the rest.
    results = await search<DeezerTrack>('track', `${artist} ${title}`, `${tag}-loose`);
    match = results ? pick(results) : undefined;
  }
  if (!match) return null;
  return {
    id: match.id,
    albumName: match.album?.title ?? '',
    albumImages: images([[match.album?.cover_big, 500], [match.album?.cover_xl, 1000], [match.album?.cover_medium, 250]]),
    duration_ms: (match.duration ?? 0) * 1000,
    popularity: popularityFromRank(match.rank),
  };
}

/** Release date of a Deezer track's album, or of the track itself */
export async function findReleaseDate(trackId: number): Promise<string | undefined> {
  const result = await cachedJson<TrackBody>(`${API_BASE}/track/${trackId}`, {
    service: 'deezer',
    revalidate: TTL.month,
    tag: `deezer-track-detail-${trackId}`,
    classify: classifyDeezer,
  });
  if (!result.ok) return undefined;
  const date = result.body.album?.release_date || result.body.release_date;
  return date && date !== '0000-00-00' ? date : undefined;
}

// ---------- Enrichment ----------

/** Fills images and popularity for artists that don't have them. Unmatched artists pass through. */
export async function enrichArtists<T extends Artist>(artists: T[]): Promise<T[]> {
  return mapLimit(artists, CONCURRENCY, async artist => {
    if (artist.images.length > 0 && artist.popularity !== undefined) return artist;
    const match = await findArtist(artist.name);
    if (!match) return artist;
    return {
      ...artist,
      images: artist.images.length > 0 ? artist.images : match.images,
      popularity: artist.popularity ?? match.popularity,
    };
  });
}

export interface EnrichTrackOptions {
  /** Also look up album release dates for the first RELEASE_DATE_LIMIT tracks */
  releaseDates?: boolean;
}

/**
 * Fills album art, album name, duration, popularity and (optionally) release dates.
 * Each distinct track is looked up once, however many times it appears in `tracks`.
 */
export async function enrichTracks<T extends Track>(tracks: T[], options: EnrichTrackOptions = {}): Promise<T[]> {
  const unique = [...new Map(tracks.map(track => [track.id, track])).values()];
  const datedIds = new Set(unique.slice(0, RELEASE_DATE_LIMIT).map(track => track.id));
  const enriched = await mapLimit(unique, CONCURRENCY, async (track): Promise<Track> => {
    const artist = track.artists[0]?.name;
    if (!artist) return track;
    const match = await findTrack(artist, track.name);
    if (!match) return track;
    const releaseDate = options.releaseDates && datedIds.has(track.id) && !track.album.release_date
      ? await findReleaseDate(match.id)
      : undefined;
    return {
      ...track,
      duration_ms: track.duration_ms || match.duration_ms,
      popularity: track.popularity ?? match.popularity,
      album: {
        ...track.album,
        name: track.album.name || match.albumName,
        images: track.album.images.length > 0 ? track.album.images : match.albumImages,
        ...(releaseDate || track.album.release_date ? { release_date: track.album.release_date ?? releaseDate } : {}),
      },
    };
  });
  const byId = new Map(enriched.map(track => [track.id, track]));
  return tracks.map(track => {
    const found = byId.get(track.id);
    return found
      ? { ...track, duration_ms: found.duration_ms, popularity: found.popularity, album: found.album }
      : track;
  });
}

interface DeezerAlbumResult extends DeezerAlbum {
  artist?: { name: string };
}

/** Album cover by artist and album name (used by the example profile) */
export async function findAlbumCover(artist: string, album: string): Promise<MusicImage[] | null> {
  const results = await search<DeezerAlbumResult>(
    'album', `artist:"${artist}" album:"${album}"`, `deezer-album-${normalize(artist)}|${normalize(album)}`
  );
  if (!results) return null;
  const byArtist = results.filter(item => normalize(item.artist?.name ?? '') === normalize(artist));
  const match = byArtist.find(item => coreTitle(item.title) === coreTitle(album)) ?? byArtist[0];
  if (!match) return null;
  return images([[match.cover_big, 500], [match.cover_xl, 1000], [match.cover_medium, 250]]);
}
