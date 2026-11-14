import fs from 'fs';
import path from 'path';
import { calculateTopGenres } from '@/lib/spotify';
import { computeStats, type ListeningDataSource } from '@/lib/statsPipeline';
import type { Stats } from '@/types';

/**
 * The frozen Spotify sample used by `npm run coverage`.
 * Dev-only: the dashboard can load one of these playlists through the real stats pipeline.
 */

export interface SamplePlaylistSummary {
  id: string;
  name: string;
  owner: string;
  role: 'genre' | 'chart' | 'devoted';
  query: string;
  trackCount: number;
  /** Vibe and persona from the latest coverage report. Empty until a report has scored this playlist. */
  vibe: string;
  persona: string;
}

interface CorpusArtist {
  name: string;
  genres: string[];
}

interface CorpusTrack {
  id: string;
  name: string;
  popularity: number;
  durationMs: number;
  release: string;
  artistIds: string[];
}

interface CorpusPlaylist {
  id: string;
  role: 'genre' | 'chart' | 'devoted';
  query: string;
  name: string;
  owner: string;
  tracks: CorpusTrack[];
}

interface Corpus {
  fetchedAt: string;
  playlists: CorpusPlaylist[];
  artists: Record<string, CorpusArtist>;
}

let corpusCache: Corpus | null = null;

function corpus(): Corpus {
  if (!corpusCache) {
    const file = path.join(process.cwd(), 'analysis', 'corpus.json');
    corpusCache = JSON.parse(fs.readFileSync(file, 'utf8')) as Corpus;
  }
  return corpusCache;
}

interface ReportRow {
  id?: string;
  query?: string;
  vibe?: string;
  persona?: string;
}

/** Labels stored by the latest coverage report, keyed by playlist id. */
function reportLabels(playlists: CorpusPlaylist[]): Map<string, { vibe: string; persona: string }> {
  const labels = new Map<string, { vibe: string; persona: string }>();
  const indexPath = path.join(process.cwd(), 'analysis', 'runs', 'index.json');
  if (!fs.existsSync(indexPath)) return labels;
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8')) as { runs?: { file: string }[] };
  const relative = index.runs?.[0]?.file;
  if (!relative) return labels;
  const reportPath = path.join(process.cwd(), relative);
  if (!fs.existsSync(reportPath)) return labels;
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as {
    stations?: ReportRow[];
    devoted?: ReportRow[];
    charts?: ReportRow[];
  };

  const claim = (id: string | undefined, row: ReportRow) => {
    if (!id || !row.vibe || !row.persona || labels.has(id)) return;
    labels.set(id, { vibe: row.vibe, persona: row.persona });
  };
  const claimByQuery = (role: CorpusPlaylist['role'], rows: ReportRow[]) => {
    for (const row of rows) {
      if (row.id) {
        claim(row.id, row);
        continue;
      }
      const match = playlists.find(playlist => playlist.role === role && playlist.query === row.query);
      claim(match?.id, row);
    }
  };

  claimByQuery('genre', report.stations ?? []);
  claimByQuery('devoted', report.devoted ?? []);
  for (const row of report.charts ?? []) claim(row.id, row);
  return labels;
}

export function listSamplePlaylists(): { fetchedAt: string; playlists: SamplePlaylistSummary[] } {
  const data = corpus();
  const labels = reportLabels(data.playlists);
  const playlists = data.playlists.map(playlist => ({
    id: playlist.id,
    name: playlist.name,
    owner: playlist.owner,
    role: playlist.role,
    query: playlist.query,
    trackCount: playlist.tracks.length,
    vibe: labels.get(playlist.id)?.vibe ?? '',
    persona: labels.get(playlist.id)?.persona ?? '',
  }));
  const roleOrder = { genre: 0, devoted: 1, chart: 2 };
  playlists.sort((left, right) => {
    if (left.role !== right.role) return roleOrder[left.role] - roleOrder[right.role];
    const leftLabel = left.role === 'chart' ? left.name : left.query;
    const rightLabel = right.role === 'chart' ? right.name : right.query;
    return leftLabel.localeCompare(rightLabel);
  });
  return { fetchedAt: data.fetchedAt, playlists };
}

function releasePrecision(release: string): SpotifyApi.AlbumObjectSimplified['release_date_precision'] {
  if (release.length >= 10) return 'day';
  if (release.length >= 7) return 'month';
  return 'year';
}

function artistObject(id: string, artist: CorpusArtist): SpotifyApi.ArtistObjectFull {
  return {
    id,
    name: artist.name,
    type: 'artist',
    uri: `spotify:artist:${id}`,
    href: `https://api.spotify.com/v1/artists/${id}`,
    external_urls: { spotify: `https://open.spotify.com/artist/${id}` },
    genres: artist.genres ?? [],
    popularity: 0,
    followers: { href: null, total: 0 },
    images: [],
  };
}

function trackObject(track: CorpusTrack, artists: SpotifyApi.ArtistObjectFull[]): SpotifyApi.TrackObjectFull {
  const refs: SpotifyApi.ArtistObjectSimplified[] = artists.map(artist => ({
    id: artist.id,
    name: artist.name,
    type: 'artist',
    uri: artist.uri,
    href: artist.href,
    external_urls: artist.external_urls,
  }));
  const albumId = `sample-album-${track.id}`;
  return {
    id: track.id,
    name: track.name,
    type: 'track',
    uri: `spotify:track:${track.id}`,
    href: `https://api.spotify.com/v1/tracks/${track.id}`,
    external_urls: { spotify: `https://open.spotify.com/track/${track.id}` },
    external_ids: {},
    explicit: false,
    is_local: false,
    preview_url: null,
    disc_number: 1,
    track_number: 1,
    duration_ms: track.durationMs,
    popularity: track.popularity,
    artists: refs,
    album: {
      id: albumId,
      name: track.name,
      type: 'album',
      album_type: 'album',
      total_tracks: 1,
      artists: refs,
      images: [],
      release_date: track.release,
      release_date_precision: releasePrecision(track.release),
      uri: `spotify:album:${albumId}`,
      href: `https://api.spotify.com/v1/albums/${albumId}`,
      external_urls: { spotify: `https://open.spotify.com/album/${albumId}` },
    },
  };
}

/** Stats for one saved sample, scored with the same pipeline as a listener's playlist. */
export async function statsForSamplePlaylist(id: string): Promise<Stats | null> {
  const data = corpus();
  const playlist = data.playlists.find(item => item.id === id);
  if (!playlist) return null;

  const artistsById: Record<string, SpotifyApi.ArtistObjectFull> = {};
  for (const track of playlist.tracks) {
    for (const artistId of track.artistIds) {
      if (artistsById[artistId] || !data.artists[artistId]) continue;
      artistsById[artistId] = artistObject(artistId, data.artists[artistId]);
    }
  }

  const tracks = playlist.tracks.flatMap(track => {
    const artists = track.artistIds.map(artistId => artistsById[artistId]).filter(Boolean);
    if (artists.length === 0) return [];
    return [{ track: trackObject(track, artists), addedAt: '' }];
  });

  const source: ListeningDataSource = {
    getRecentlyPlayed: async () => [],
    getTopTracks: async () => [],
    getTopArtists: async () => [],
    fetchArtistsByIds: async (artistIds) => {
      const found: Record<string, SpotifyApi.ArtistObjectFull> = {};
      for (const artistId of artistIds) {
        if (artistsById[artistId]) found[artistId] = artistsById[artistId];
      }
      return found;
    },
    enhanceArtists: async (artists) => ({ artists, lastFmUnavailable: [] }),
  };

  const stats = await computeStats(source, {
    timeRange: 'medium_term',
    limit: 50,
    mode: 'playlist',
    playlist: {
      id: playlist.id,
      name: playlist.name,
      total: playlist.tracks.length,
      tracks,
    },
    includeDebug: true,
    debugLastFmStatus: 'disabled',
  });

  stats.topArtists = stats.artists.map(({ artist, playCount }) => ({ ...artist, recentPlays: playCount }));
  stats.topTracks = stats.tracks.map(({ track }) => ({ ...track, recentPlays: 0 }));
  stats.topGenres = calculateTopGenres(stats.artists.map(({ artist }) => artist));
  return stats;
}
