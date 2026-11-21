import fs from 'fs';
import path from 'path';
import { calculateTopGenres } from '@/lib/listening';
import { computeStats, type ListeningDataSource } from '@/lib/statsPipeline';
import type { Stats } from '@/types';
import type { Artist, Track } from '@/types/music';
import { lastFmArtistUrl, lastFmTrackUrl } from '@/utils/links';

/**
 * The frozen playlist sample (collected from Spotify before the move to Last.fm) used by `npm run coverage`.
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

function artistObject(id: string, artist: CorpusArtist): Artist {
  return {
    id,
    name: artist.name,
    url: lastFmArtistUrl(artist.name),
    genres: artist.genres ?? [],
    images: [],
  };
}

function trackObject(track: CorpusTrack, artists: Artist[]): Track {
  return {
    id: track.id,
    name: track.name,
    url: lastFmTrackUrl(artists[0].name, track.name),
    duration_ms: track.durationMs,
    popularity: track.popularity,
    artists: artists.map(({ id, name, url }) => ({ id, name, url })),
    album: {
      id: `sample-album-${track.id}`,
      name: track.name,
      images: [],
      release_date: track.release,
    },
  };
}

/** Stats for one saved sample, scored with the same pipeline as a listener's playlist. */
export async function statsForSamplePlaylist(id: string): Promise<Stats | null> {
  const data = corpus();
  const playlist = data.playlists.find(item => item.id === id);
  if (!playlist) return null;

  const artistsById: Record<string, Artist> = {};
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
    fetchArtists: async (refs) => {
      const found: Record<string, Artist> = {};
      for (const { id } of refs) {
        if (artistsById[id]) found[id] = artistsById[id];
      }
      return found;
    },
    enhanceArtists: async (artists) => ({ artists, lastFmUnavailable: [] }),
  };

  const stats = await computeStats(source, {
    timeRange: '6month',
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
