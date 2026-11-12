import fs from 'fs';

function loadEnv(file: string) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim().replace(/^"|"$/g, '');
  }
}

async function main() {
  loadEnv('.env.local');
  const id = process.env.SPOTIFY_CLIENT_ID!;
  const secret = process.env.SPOTIFY_CLIENT_SECRET!;
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const access = (await tokenResponse.json()).access_token as string;
  const get = async (path: string) => {
    const response = await fetch(`https://api.spotify.com/v1${path}`, { headers: { Authorization: `Bearer ${access}` } });
    const text = await response.text();
    return { status: response.status, text: text.slice(0, 400) };
  };

  for (const playlistId of ['37i9dQZEVXbMDoHDwVN2tF', '37i9dQZF1DXcBWIGoYBM5M', '37i9dQZF1DX0XUsuxWHRQd', '37i9dQZF1DX4sWSpwq3LiO']) {
    const result = await get(`/playlists/${playlistId}?fields=name,owner(id,display_name)`);
    console.log('playlist', playlistId, result.status, result.text.replace(/\s+/g, ' '));
  }

  const featured = await get('/browse/featured-playlists?country=US&limit=5');
  console.log('featured', featured.status, featured.text.replace(/\s+/g, ' '));

  const releases = await get('/browse/new-releases?country=US&limit=3');
  console.log('releases', releases.status, releases.text.replace(/\s+/g, ' ').slice(0, 250));

  const search = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent('Top 50 Global')}&type=playlist&market=US&limit=10`, {
    headers: { Authorization: `Bearer ${access}` },
  });
  const body = await search.json() as { playlists: { items: ({ name: string; id: string; owner: { id: string; display_name: string }; followers?: { total: number } } | null)[] } };
  for (const item of body.playlists.items) {
    if (!item) { console.log('null item'); continue; }
    console.log(item.owner?.id, item.owner?.display_name, item.followers?.total, item.name, item.id);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
