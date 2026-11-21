import type { ListeningDataSource, PlaylistCollection } from '@/lib/statsPipeline';
import { enhanceArtistsWithLastFm } from '@/lib/listening';
import { enrichArtists, enrichTracks } from '@/lib/deezer';
import { emptyArtist, getLovedTracks, getRecentTracks, getTopArtists, getTopTracks } from '@/lib/lastfmApi';
import { LIKED_SONGS_ID, LIKED_SONGS_NAME } from '@/types';
import type { Artist } from '@/types/music';

/** Loved Tracks analyzed at most. Each new one is a Deezer lookup, so this keeps cold loads quick. */
const LOVED_TRACKS_CAP = 100;

/** Listening data for one Last.fm user, with artwork and lengths from Deezer and genres from Last.fm tags. */
export function createLastFmDataSource(username: string): ListeningDataSource {
  const apiKey = process.env.LASTFM_API_KEY;
  return {
    getRecentlyPlayed: limit => getRecentTracks(username, limit),
    getTopTracks: (period, limit) => getTopTracks(username, period, limit),
    getTopArtists: (period, limit) => getTopArtists(username, period, limit),
    fetchArtists: async refs => {
      const enriched = await enrichArtists(refs.map(ref => 'images' in ref ? ref as Artist : emptyArtist(ref)));
      return Object.fromEntries(enriched.map(artist => [artist.id, artist]));
    },
    enhanceArtists: artists => enhanceArtistsWithLastFm(artists, apiKey),
    enrichTracks: (tracks, options) => enrichTracks(tracks, options),
  };
}

/** The listener's Loved Tracks, newest first, as a collection for playlist mode */
export async function getLovedCollection(username: string): Promise<PlaylistCollection> {
  const loved = await getLovedTracks(username, LOVED_TRACKS_CAP);
  return {
    id: LIKED_SONGS_ID,
    name: LIKED_SONGS_NAME,
    total: loved.total,
    tracks: loved.tracks.map(({ track, lovedAt }) => ({ track, addedAt: lovedAt })),
  };
}
