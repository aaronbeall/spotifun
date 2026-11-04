import { unstable_cache } from 'next/cache';
import { albumKey, getArtworkQueries } from './demoData';

/** Real images and Spotify links for the example catalog, keyed by artist name and by `albumKey()` */
export interface Artwork {
  artists: Record<string, ArtworkEntry>;
  albums: Record<string, ArtworkEntry>;
}

interface ArtworkEntry {
  images: SpotifyApi.ImageObject[];
  url: string;
}

const ONE_DAY = 60 * 60 * 24;
const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '');

async function getAppToken(clientId: string, clientSecret: string): Promise<string> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Spotify token request failed: ${response.status}`);
  return (await response.json()).access_token;
}

/** Runs `task` over `items` with at most `limit` in flight, to stay friendly with Spotify's rate limits */
async function mapLimited<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await task(items[index]);
    }
  }));
  return results;
}

async function lookUpArtwork(): Promise<Artwork> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Spotify app credentials are not set');

  const token = await getAppToken(clientId, clientSecret);
  const search = async <T>(type: 'artist' | 'album', query: string): Promise<T[]> => {
    const params = new URLSearchParams({ q: query, type, limit: '5' });
    const response = await fetch(`https://api.spotify.com/v1/search?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`Spotify search failed: ${response.status}`);
    const body = await response.json();
    return body[`${type}s`]?.items ?? [];
  };

  const { artists, albums } = getArtworkQueries();
  const artwork: Artwork = { artists: {}, albums: {} };

  await mapLimited(artists, 4, async name => {
    const results = await search<SpotifyApi.ArtistObjectFull>('artist', name);
    // Prefer an exact name match so "Burial" doesn't become some other Burial
    const match = results.find(artist => normalize(artist.name) === normalize(name));
    if (match?.images?.length) artwork.artists[name] = { images: match.images, url: match.external_urls.spotify };
  });

  await mapLimited(albums, 4, async ({ artist, album }) => {
    const results = await search<SpotifyApi.AlbumObjectSimplified>('album', `album:${album} artist:${artist}`);
    const byArtist = results.filter(item => item.artists.some(a => normalize(a.name) === normalize(artist)));
    const match = byArtist.find(item => normalize(item.name) === normalize(album)) ?? byArtist[0];
    if (match?.images?.length) artwork.albums[albumKey(artist, album)] = { images: match.images, url: match.external_urls.spotify };
  });

  if (Object.keys(artwork.artists).length === 0 && Object.keys(artwork.albums).length === 0) {
    throw new Error('Spotify artwork lookup found nothing');
  }
  return artwork;
}

// Cached for a day across requests and deployments. A failed lookup throws, so it is never cached.
const getCachedArtwork = unstable_cache(lookUpArtwork, ['example-profile-artwork-v1'], { revalidate: ONE_DAY });

let lastFailureAt = 0;

/**
 * Real artist photos and album covers for the example profile, or null when they can't be
 * looked up (no Spotify app credentials, no network). Callers fall back to generated art.
 */
export async function getArtwork(): Promise<Artwork | null> {
  // After a failure, don't hammer Spotify on every request
  if (Date.now() - lastFailureAt < 5 * 60 * 1000) return null;
  try {
    return await getCachedArtwork();
  } catch (error) {
    lastFailureAt = Date.now();
    console.warn('Example profile artwork unavailable, using generated art:', error instanceof Error ? error.message : error);
    return null;
  }
}
