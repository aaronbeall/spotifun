import { unstable_cache } from 'next/cache';
import { findAlbumCover, findArtist } from '@/lib/deezer';
import { mapLimit } from '@/lib/apiCache';
import type { MusicImage } from '@/types/music';
import { albumKey, getArtworkQueries } from './demoData';

/** Real images for the example catalog, keyed by artist name and by `albumKey()` */
export interface Artwork {
  artists: Record<string, ArtworkEntry>;
  albums: Record<string, ArtworkEntry>;
}

interface ArtworkEntry {
  images: MusicImage[];
}

const ONE_DAY = 60 * 60 * 24;

async function lookUpArtwork(): Promise<Artwork> {
  const { artists, albums } = getArtworkQueries();
  const artwork: Artwork = { artists: {}, albums: {} };

  await mapLimit(artists, 4, async name => {
    const match = await findArtist(name);
    if (match?.images.length) artwork.artists[name] = { images: match.images };
  });

  await mapLimit(albums, 4, async ({ artist, album }) => {
    const images = await findAlbumCover(artist, album);
    if (images?.length) artwork.albums[albumKey(artist, album)] = { images };
  });

  if (Object.keys(artwork.artists).length === 0 && Object.keys(artwork.albums).length === 0) {
    throw new Error('Deezer artwork lookup found nothing');
  }
  return artwork;
}

// Cached for a day across requests and deployments. A failed lookup throws, so it is never cached.
const getCachedArtwork = unstable_cache(lookUpArtwork, ['example-profile-artwork-v2'], { revalidate: ONE_DAY });

let lastFailureAt = 0;

/**
 * Real artist photos and album covers for the example profile, from Deezer, or null when they
 * can't be looked up (no network). Callers fall back to generated art.
 */
export async function getArtwork(): Promise<Artwork | null> {
  // After a failure, don't hammer Deezer on every request
  if (Date.now() - lastFailureAt < 5 * 60 * 1000) return null;
  try {
    return await getCachedArtwork();
  } catch (error) {
    lastFailureAt = Date.now();
    console.warn('Example profile artwork unavailable, using generated art:', error instanceof Error ? error.message : error);
    return null;
  }
}
