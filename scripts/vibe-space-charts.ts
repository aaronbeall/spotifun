/**
 * Charts the app token can still open (Spotify-owned stations 404),
 * then builds mixes for the vibes those charts miss.
 */
import fs from 'fs';
import { MUSIC_VIBES } from '../src/utils/musicVibes';
import { classify, type Track } from './vibe-space-official';

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
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(`https://api.spotify.com/v1${path}`, {
      headers: { Authorization: `Bearer ${access}` },
    });
    if (response.status === 429) {
      await new Promise(resolve => setTimeout(resolve, Number(response.headers.get('retry-after') || 2) * 1000));
      continue;
    }
    if (response.status === 404 || response.status === 403) return null;
    if (!response.ok) throw new Error(`${path} ${response.status}`);
    return response.json() as Promise<T>;
  }
  return null;
}

async function readPlaylist(access: string, id: string): Promise<{ name: string; owner: string; tracks: Track[] } | null> {
  const playlist = await spotify<{
    name: string;
    owner?: { display_name?: string };
    tracks?: { items?: { track?: SpotifyApi.TrackObjectFull | null }[] };
    items?: { items?: { item?: SpotifyApi.TrackObjectFull | null }[] };
  }>(access, `/playlists/${id}?fields=name,owner.display_name,tracks.items(track(id,name,popularity,duration_ms,album.release_date,artists(id,name))),items.items(item(id,name,popularity,duration_ms,album.release_date,artists(id,name)))`);
  if (!playlist) return null;
  const raw = [
    ...(playlist.tracks?.items ?? []).map(item => item.track),
    ...(playlist.items?.items ?? []).map(item => item.item),
  ].filter((track): track is SpotifyApi.TrackObjectFull => !!track?.id);
  const tracks = raw.slice(0, 40).map(track => ({
    id: track.id,
    name: track.name,
    popularity: track.popularity ?? 0,
    duration_ms: track.duration_ms,
    release: track.album?.release_date ?? '',
    artists: track.artists.map(artist => ({ id: artist.id, name: artist.name })),
  }));
  return { name: playlist.name, owner: playlist.owner?.display_name ?? '', tracks };
}

async function main() {
  loadEnv('.env.local');
  const access = await token();
  const found = new Map<string, string>();
  found.set('6UeSakyzhiEt4NB3UAd6NQ', 'Billboard Hot 100');

  for (const query of ['Billboard Hot 100', 'Billboard Global 200', 'Billboard Country', 'Billboard Rock', 'Billboard R&B', 'Billboard Latin', 'Billboard Dance', 'Official Singles Chart']) {
    const body = await spotify<{ playlists: { items: ({ id: string; name: string; owner: { display_name: string } } | null)[] } }>(
      access,
      `/search?q=${encodeURIComponent(query)}&type=playlist&market=US&limit=10`,
    );
    for (const item of body?.playlists.items ?? []) {
      if (!item) continue;
      const owner = item.owner?.display_name ?? '';
      if (/billboard|official charts/i.test(owner) || item.name.toLowerCase() === query.toLowerCase()) {
        found.set(item.id, owner);
      }
    }
  }

  const stations: object[] = [];
  const songs: { id: string; name: string; artists: string; artistId: string; popularity: number; year: number; station: string }[] = [];
  for (const [id, owner] of found) {
    const playlist = await readPlaylist(access, id);
    if (!playlist || playlist.tracks.length < 10) {
      console.error(`skip ${id} ${owner}`);
      continue;
    }
    const artists: Record<string, { genres?: string[] }> = {};
    const artistIds = [...new Set(playlist.tracks.flatMap(track => track.artists.map(artist => artist.id)))];
    for (let index = 0; index < artistIds.length; index += 50) {
      const batch = await spotify<{ artists: { id: string; genres?: string[] }[] }>(access, `/artists?ids=${artistIds.slice(index, index + 50).join(',')}`);
      for (const artist of batch?.artists ?? []) if (artist?.id) artists[artist.id] = artist;
    }
    const classified = classify(playlist.tracks, artists);
    stations.push({ id, owner: playlist.owner || owner, name: playlist.name, ...classified });
    for (const track of playlist.tracks) {
      songs.push({
        id: track.id,
        name: track.name,
        artists: track.artists.map(artist => artist.name).join(', '),
        artistId: track.artists[0]?.id ?? '',
        popularity: track.popularity,
        year: parseInt(track.release.slice(0, 4), 10) || 0,
        station: playlist.name,
      });
    }
    console.error(`${playlist.name}: ${classified.vibe} / ${classified.persona} cov=${classified.coverage}`);
  }

  const prior = JSON.parse(fs.readFileSync('scripts/vibe-space-survey.json', 'utf8')) as {
    songs?: { id: string; name: string; artists: string; popularity: number; year: number; vibe: string }[];
  };
  const priorSongs = prior.songs ?? [];
  const explorers: object[] = [];
  for (const vibe of MUSIC_VIBES) {
    const picks = priorSongs.filter(song => song.vibe === vibe.name).slice(0, 12);
    if (picks.length < 6) {
      explorers.push({ target: vibe.name, reached: false, available: picks.length, trackNames: picks.map(song => `${song.name} — ${song.artists}`) });
      continue;
    }
    const details = await spotify<{ tracks: (SpotifyApi.TrackObjectFull | null)[] }>(
      access,
      `/tracks?ids=${picks.map(song => song.id).join(',')}`,
    );
    const tracks: Track[] = (details?.tracks ?? []).filter((track): track is SpotifyApi.TrackObjectFull => !!track?.id).map(track => ({
      id: track.id,
      name: track.name,
      popularity: track.popularity ?? 0,
      duration_ms: track.duration_ms,
      release: track.album?.release_date ?? '',
      artists: track.artists.map(artist => ({ id: artist.id, name: artist.name })),
    }));
    if (tracks.length < 6) {
      explorers.push({ target: vibe.name, reached: false, available: picks.length, note: 'track lookup unavailable', trackNames: picks.map(song => `${song.name} — ${song.artists}`) });
      continue;
    }
    const artists: Record<string, { genres?: string[] }> = {};
    const artistIds = [...new Set(tracks.flatMap(track => track.artists.map(artist => artist.id)))];
    for (let index = 0; index < artistIds.length; index += 50) {
      const batch = await spotify<{ artists: { id: string; genres?: string[] }[] }>(access, `/artists?ids=${artistIds.slice(index, index + 50).join(',')}`);
      for (const artist of batch?.artists ?? []) if (artist?.id) artists[artist.id] = artist;
    }
    const classified = classify(tracks, artists);
    explorers.push({
      target: vibe.name,
      reached: classified.vibe === vibe.name,
      name: `${vibe.name} mix`,
      trackNames: tracks.map(track => `${track.name} — ${track.artists.map(artist => artist.name).join(', ')}`),
      ...classified,
    });
    console.error(`mix ${vibe.name} -> ${classified.vibe} / ${classified.persona}`);
  }

  fs.writeFileSync('scripts/vibe-space-charts.json', JSON.stringify({
    fetchedAt: new Date().toISOString(),
    topN: 40,
    note: 'Spotify-owned editorial stations return 404 to this app token. These are chart playlists the token can still read, first 40 tracks in playlist order, 12 Nov 2026.',
    stationCount: stations.length,
    stations,
    chartSongs: songs.slice(0, 80).map(song => ({ name: song.name, artists: song.artists, popularity: song.popularity, year: song.year, station: song.station })),
    explorers,
  }, null, 2));
  console.error(`wrote charts stations=${stations.length} explorers=${explorers.length}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
