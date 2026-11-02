/**
 * Made-up listening data for demo mode (/demo).
 *
 * Everything here is fictional: artists, albums, tracks and the listener. The objects use
 * the same Spotify Web API shapes the live endpoints return, so the real stats pipeline
 * and dashboard components run on them unchanged. Generation is seeded, so the dataset is
 * the same on every request apart from play timestamps, which are anchored to "now".
 */
import type { ListeningDataSource } from '@/lib/statsPipeline';
import type { NowPlaying, TimeRange, UserProfile } from '@/types';

// ---------- Seeded randomness ----------

/** mulberry32: tiny deterministic PRNG */
function createRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

type Rng = ReturnType<typeof createRng>;
const pick = <T,>(rng: Rng, items: readonly T[]): T => items[Math.floor(rng() * items.length)];
const between = (rng: Rng, min: number, max: number) => min + rng() * (max - min);

// ---------- Generated cover art ----------

/** Playful abstract cover art as an inline SVG data URI (no network, works in share cards). */
function coverArt(seed: string, hue: number): string {
  const rng = createRng(hashString(seed));
  const hue2 = (hue + 40 + Math.floor(rng() * 120)) % 360;
  const hue3 = (hue + 180 + Math.floor(rng() * 60)) % 360;
  const style = Math.floor(rng() * 4);
  let shapes = '';
  if (style === 0) {
    // Bubbles
    for (let i = 0; i < 6; i++) {
      shapes += `<circle cx="${Math.round(rng() * 300)}" cy="${Math.round(rng() * 300)}" r="${Math.round(20 + rng() * 70)}" fill="hsl(${hue3} 90% 70%)" opacity="${(0.35 + rng() * 0.4).toFixed(2)}"/>`;
    }
  } else if (style === 1) {
    // Sunset stripes
    for (let i = 0; i < 6; i++) {
      shapes += `<rect x="0" y="${150 + i * 26}" width="300" height="13" fill="hsl(${hue3} 85% ${60 + i * 4}%)" opacity="0.8"/>`;
    }
    shapes += `<circle cx="150" cy="140" r="${Math.round(60 + rng() * 30)}" fill="hsl(${hue2} 95% 70%)"/>`;
  } else if (style === 2) {
    // Big wavy blob
    const w = Math.round(rng() * 60);
    shapes += `<path d="M0 ${180 + w} Q75 ${90 + w} 150 ${170 - w} T300 ${150 + w} V300 H0Z" fill="hsl(${hue3} 80% 60%)" opacity="0.85"/>`;
    shapes += `<circle cx="${Math.round(60 + rng() * 180)}" cy="80" r="34" fill="hsl(${hue2} 95% 85%)"/>`;
  } else {
    // Confetti squares
    for (let i = 0; i < 14; i++) {
      const size = Math.round(16 + rng() * 40);
      shapes += `<rect x="${Math.round(rng() * 280)}" y="${Math.round(rng() * 280)}" width="${size}" height="${size}" rx="6" transform="rotate(${Math.round(rng() * 90)} 150 150)" fill="hsl(${(hue3 + i * 25) % 360} 85% 65%)" opacity="0.75"/>`;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 75% 45%)"/><stop offset="1" stop-color="hsl(${hue2} 70% 30%)"/></linearGradient></defs><rect width="300" height="300" fill="url(#g)"/>${shapes}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const images = (url: string): SpotifyApi.ImageObject[] => [{ url, width: 300, height: 300 }];

// ---------- Catalog ----------

interface ArtistSeed {
  name: string;
  genres: string[];
  popularity: number;
  /** How much the demo listener likes them: [short_term, medium_term, long_term] */
  affinity: [number, number, number];
  hue: number;
  /** Typical track length in minutes */
  length?: [number, number];
}

// The demo listener: an indie/dream-pop kid with a synthwave habit, a lo-fi study playlist,
// and a few chaotic detours (yes, the death metal is load-bearing).
const ARTIST_SEEDS: ArtistSeed[] = [
  { name: 'Moonbeam Laundromat', genres: ['dream pop', 'shoegaze', 'indie pop'], popularity: 58, affinity: [9, 10, 9], hue: 265 },
  { name: 'Neon Pelican', genres: ['synthwave', 'synthpop', 'electronic'], popularity: 63, affinity: [10, 8, 6], hue: 320 },
  { name: 'The Velvet Toasters', genres: ['indie pop', 'indie rock', 'garage rock'], popularity: 71, affinity: [7, 9, 10], hue: 25 },
  { name: 'Lofi Grandma', genres: ['lo-fi', 'jazz', 'chillhop'], popularity: 54, affinity: [8, 7, 7], hue: 190 },
  { name: 'Sofa Kingdom', genres: ['bedroom pop', 'indie pop'], popularity: 39, affinity: [6, 8, 5], hue: 140 },
  { name: 'Glitter Goblin', genres: ['hyperpop', 'electropop', 'pop'], popularity: 47, affinity: [9, 5, 2], hue: 300 },
  { name: 'Kid Cumulus', genres: ['hip hop', 'cloud rap', 'rap'], popularity: 76, affinity: [5, 6, 6], hue: 210 },
  { name: 'Midnight Waffle', genres: ['chillwave', 'vaporwave', 'synthpop'], popularity: 33, affinity: [6, 6, 4], hue: 280 },
  { name: 'Quiet Lighthouse', genres: ['ambient', 'post-rock', 'drone'], popularity: 22, affinity: [4, 6, 7], hue: 200, length: [5.5, 9] },
  { name: 'Lady Thunderclap', genres: ['pop', 'dance-pop', 'electropop'], popularity: 88, affinity: [6, 5, 4], hue: 350 },
  { name: 'Honey Bunker', genres: ['neo soul', 'r&b', 'soul'], popularity: 61, affinity: [5, 7, 6], hue: 40 },
  { name: 'Velociraptor Funeral', genres: ['death metal', 'metal', 'thrash metal'], popularity: 29, affinity: [4, 3, 3], hue: 0 },
  { name: 'Saxophone Weather', genres: ['jazz', 'smooth jazz', 'fusion'], popularity: 35, affinity: [3, 5, 6], hue: 30, length: [4, 7] },
  { name: 'Starfruit Collective', genres: ['k-pop', 'dance-pop', 'pop'], popularity: 82, affinity: [5, 4, 3], hue: 55 },
  { name: 'Cardigan Club', genres: ['indie folk', 'folk', 'singer-songwriter'], popularity: 44, affinity: [3, 5, 8], hue: 95 },
  { name: 'Turbo Possum', genres: ['pop punk', 'punk', 'skate punk'], popularity: 51, affinity: [3, 4, 7], hue: 15, length: [1.8, 3] },
  { name: 'Ghost Arcade', genres: ['synthwave', 'post-punk', 'darkwave'], popularity: 41, affinity: [7, 5, 3], hue: 245 },
  { name: 'Bossa Nova Robot', genres: ['bossa nova', 'latin jazz'], popularity: 26, affinity: [2, 4, 4], hue: 165 },
  { name: 'Afro Comet', genres: ['afrobeats', 'dancehall', 'afropop'], popularity: 69, affinity: [4, 4, 2], hue: 45 },
  { name: 'Cello Vortex', genres: ['modern classical', 'classical', 'orchestral'], popularity: 31, affinity: [2, 3, 5], hue: 220, length: [4, 8] },
  { name: 'Brunch Riot', genres: ['garage rock', 'indie rock', 'punk'], popularity: 49, affinity: [4, 4, 6], hue: 10 },
  { name: 'Soft Serve Sunday', genres: ['soft rock', 'yacht rock'], popularity: 37, affinity: [2, 3, 4], hue: 185 },
  { name: 'Tiny Volcano', genres: ['trip hop', 'downtempo', 'electronic'], popularity: 43, affinity: [4, 5, 5], hue: 5 },
  { name: 'Basement Choir', genres: ['midwest emo', 'emo', 'indie rock'], popularity: 36, affinity: [3, 4, 6], hue: 120 },
  { name: 'Disco Tortoise', genres: ['nu disco', 'disco', 'funk'], popularity: 55, affinity: [5, 4, 3], hue: 330 },
  { name: 'Captain Lowercase', genres: ['lo-fi hip hop', 'indie hip hop', 'lo-fi'], popularity: 32, affinity: [5, 5, 4], hue: 175 },
  { name: 'Polar Bear Party', genres: ['edm', 'electro house', 'dubstep'], popularity: 74, affinity: [3, 3, 2], hue: 195 },
  { name: 'Rosa Relámpago', genres: ['reggaeton', 'latin pop'], popularity: 84, affinity: [4, 3, 1], hue: 340 },
  { name: 'Paper Satellites', genres: ['dream pop', 'indietronica', 'electronic'], popularity: 46, affinity: [6, 6, 5], hue: 230 },
  { name: 'The Spreadsheet Kings', genres: ['progressive rock', 'math rock', 'art rock'], popularity: 28, affinity: [2, 3, 5], hue: 75, length: [5, 8.5] },
  { name: 'Banjo Thunder', genres: ['bluegrass', 'americana', 'country'], popularity: 34, affinity: [2, 2, 3], hue: 35 },
  { name: 'Velvet Vending Machine', genres: ['funk', 'neo soul', 'r&b'], popularity: 52, affinity: [4, 5, 4], hue: 290 },
  { name: 'Static Mermaid', genres: ['shoegaze', 'noise pop', 'dream pop'], popularity: 24, affinity: [6, 5, 4], hue: 180 },
  { name: 'Pixel Orchard', genres: ['glitch', 'electronic', 'ambient'], popularity: 19, affinity: [3, 3, 2], hue: 110 },
  { name: 'Mothman Prom', genres: ['indie rock', 'psychedelic rock', 'garage rock'], popularity: 40, affinity: [5, 4, 3], hue: 260 },
  { name: 'DJ Snack Break', genres: ['house', 'deep house', 'dance-pop'], popularity: 59, affinity: [4, 4, 3], hue: 150 },
];

const TITLE_WORDS = {
  adjectives: ['Velvet', 'Electric', 'Sleepy', 'Neon', 'Haunted', 'Golden', 'Tiny', 'Cosmic', 'Sticky', 'Lukewarm', 'Glow-in-the-Dark', 'Overcaffeinated', 'Gentle', 'Feral', 'Holographic', 'Soggy', 'Midnight', 'Plastic', 'Lazy', 'Turbo'],
  nouns: ['Pancakes', 'Satellites', 'Heartbeat', 'Raccoons', 'Lighthouse', 'Vending Machine', 'Thunderstorm', 'Sunburn', 'Cassette', 'Daydream', 'Rollercoaster', 'Houseplant', 'Group Chat', 'Fireflies', 'Laundry Day', 'Bus Stop', 'Disco Ball', 'Dinosaur', 'Moon Boots', 'Leftovers'],
  places: ['the Parking Lot', 'Aisle Nine', 'the Deep End', 'Outer Space', 'the Food Court', 'Your Basement', 'the Arcade', 'the Last Train', 'the Laundromat', 'Grandma\'s Car'],
  verbs: ['Dancing', 'Crying', 'Skating', 'Floating', 'Texting', 'Running', 'Dreaming', 'Snacking', 'Spinning', 'Hiding'],
};

function makeTitle(rng: Rng): string {
  const { adjectives, nouns, places, verbs } = TITLE_WORDS;
  switch (Math.floor(rng() * 6)) {
    case 0: return `${pick(rng, adjectives)} ${pick(rng, nouns)}`;
    case 1: return `${pick(rng, verbs)} in ${pick(rng, places)}`;
    case 2: return `${pick(rng, nouns)} at ${pick(rng, places)}`;
    case 3: return `${pick(rng, adjectives)} ${pick(rng, nouns)} (Demo)`;
    case 4: return `${pick(rng, verbs)} with ${pick(rng, nouns)}`;
    default: return `Ode to ${pick(rng, nouns)}`;
  }
}

const slug = (value: string) => value.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '');

const RANGE_INDEX: Record<TimeRange, number> = { short_term: 0, medium_term: 1, long_term: 2 };

interface DemoTrack {
  track: SpotifyApi.TrackObjectFull;
  artistIndex: number;
  /** How catchy this track is relative to the rest of the artist's catalog */
  appeal: number;
}

interface DemoCatalog {
  artists: SpotifyApi.ArtistObjectFull[];
  tracks: DemoTrack[];
}

function buildCatalog(): DemoCatalog {
  const rng = createRng(20251102);
  const usedTitles = new Set<string>();
  const uniqueTitle = () => {
    let title = makeTitle(rng);
    while (usedTitles.has(title)) title = makeTitle(rng);
    usedTitles.add(title);
    return title;
  };

  const artists = ARTIST_SEEDS.map((seed): SpotifyApi.ArtistObjectFull => {
    const id = `demo-artist-${slug(seed.name)}`;
    return {
      id,
      name: seed.name,
      type: 'artist',
      uri: `spotify:artist:${id}`,
      href: `https://api.spotify.com/v1/artists/${id}`,
      external_urls: { spotify: `https://open.spotify.com/search/${encodeURIComponent(seed.name)}` },
      genres: seed.genres,
      popularity: seed.popularity,
      followers: { href: null, total: Math.round(seed.popularity ** 3 * (2 + rng() * 6)) },
      images: images(coverArt(id, seed.hue)),
    };
  });

  const tracks: DemoTrack[] = [];
  ARTIST_SEEDS.forEach((seed, artistIndex) => {
    const artist = artists[artistIndex];
    const artistRef: SpotifyApi.ArtistObjectSimplified = {
      id: artist.id, name: artist.name, type: 'artist', uri: artist.uri, href: artist.href, external_urls: artist.external_urls,
    };
    const albumCount = 1 + Math.floor(rng() * 2);
    for (let a = 0; a < albumCount; a++) {
      const albumName = uniqueTitle();
      const albumId = `demo-album-${slug(seed.name)}-${a}`;
      const year = 2014 + Math.floor(rng() * 12);
      const trackCount = 2 + Math.floor(rng() * 3);
      const album: SpotifyApi.AlbumObjectSimplified = {
        id: albumId,
        name: albumName,
        type: 'album',
        album_type: trackCount <= 2 ? 'single' : 'album',
        total_tracks: trackCount,
        artists: [artistRef],
        images: images(coverArt(albumId, (seed.hue + a * 35) % 360)),
        release_date: `${year}-${String(1 + Math.floor(rng() * 12)).padStart(2, '0')}-${String(1 + Math.floor(rng() * 28)).padStart(2, '0')}`,
        release_date_precision: 'day',
        uri: `spotify:album:${albumId}`,
        href: `https://api.spotify.com/v1/albums/${albumId}`,
        external_urls: { spotify: `https://open.spotify.com/search/${encodeURIComponent(albumName)}` },
      };
      const [minLength, maxLength] = seed.length ?? [2.4, 4.6];
      for (let t = 0; t < trackCount; t++) {
        const name = uniqueTitle();
        const id = `demo-track-${slug(seed.name)}-${a}-${t}`;
        // Occasional feature from another artist in the catalog
        const featured = rng() < 0.12 ? artists[Math.floor(rng() * artists.length)] : null;
        const trackArtists = featured && featured.id !== artist.id
          ? [artistRef, { id: featured.id, name: featured.name, type: 'artist' as const, uri: featured.uri, href: featured.href, external_urls: featured.external_urls }]
          : [artistRef];
        tracks.push({
          artistIndex,
          appeal: 0.4 + rng() * 0.6,
          track: {
            id,
            name,
            type: 'track',
            uri: `spotify:track:${id}`,
            href: `https://api.spotify.com/v1/tracks/${id}`,
            external_urls: { spotify: `https://open.spotify.com/search/${encodeURIComponent(`${name} ${seed.name}`)}` },
            external_ids: {},
            album,
            artists: trackArtists,
            disc_number: 1,
            track_number: t + 1,
            duration_ms: Math.round(between(rng, minLength, maxLength) * 60000),
            explicit: rng() < 0.2,
            popularity: Math.max(1, Math.min(100, Math.round(seed.popularity + between(rng, -18, 12)))),
            preview_url: null,
            is_local: false,
          },
        });
      }
    }
  });

  return { artists, tracks };
}

let catalog: DemoCatalog | null = null;
const getCatalog = () => (catalog ??= buildCatalog());

// ---------- Listening behavior ----------

function artistScores(range: TimeRange): number[] {
  const rng = createRng(hashString(`artists-${range}`));
  const index = RANGE_INDEX[range];
  return ARTIST_SEEDS.map(seed => seed.affinity[index] * (0.85 + rng() * 0.3));
}

function rankedTopArtists(range: TimeRange): SpotifyApi.ArtistObjectFull[] {
  const { artists } = getCatalog();
  const scores = artistScores(range);
  return artists
    .map((artist, i) => ({ artist, score: scores[i] }))
    .sort((a, b) => b.score - a.score)
    .map(({ artist }) => artist);
}

function rankedTopTracks(range: TimeRange): SpotifyApi.TrackObjectFull[] {
  const { tracks } = getCatalog();
  const scores = artistScores(range);
  const rng = createRng(hashString(`tracks-${range}`));
  return tracks
    .map(item => ({ item, score: scores[item.artistIndex] * item.appeal * (0.8 + rng() * 0.4) }))
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item.track);
}

/**
 * A believable recently-played history: a few listening sessions over the last couple of days,
 * newest first, with favorite tracks on repeat.
 */
function recentlyPlayed(limit: number, now: number): SpotifyApi.PlayHistoryObject[] {
  const { tracks } = getCatalog();
  const rng = createRng(hashString('recently-played'));
  const scores = artistScores('short_term');
  const weights = tracks.map(item => (scores[item.artistIndex] * item.appeal) ** 2.2);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const pickTrack = () => {
    let roll = rng() * totalWeight;
    for (let i = 0; i < tracks.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return tracks[i].track;
    }
    return tracks[tracks.length - 1].track;
  };

  // Anchor to the current minute so repeated requests within a minute match exactly
  let cursor = Math.floor(now / 60000) * 60000 - 4 * 60000;
  const plays: SpotifyApi.PlayHistoryObject[] = [];
  let previous: SpotifyApi.TrackObjectFull | null = null;
  while (plays.length < 50) {
    let track = pickTrack();
    if (track.id === previous?.id && rng() < 0.7) track = pickTrack();
    plays.push({
      track,
      played_at: new Date(cursor).toISOString(),
      context: {
        type: 'album',
        href: track.album.href,
        uri: track.album.uri,
        external_urls: track.album.external_urls,
      },
    });
    previous = track;
    cursor -= track.duration_ms + Math.round(rng() * 20000);
    // Occasional break between sessions (a commute, a nap, a whole night)
    if (rng() < 0.08) cursor -= Math.round(between(rng, 1, 9) * 3600000);
  }
  return plays.slice(0, limit);
}

/** Data source with the same contract as the live Spotify one, backed by the demo catalog. */
export function createDemoDataSource(now: number = Date.now()): ListeningDataSource {
  return {
    getRecentlyPlayed: async limit => recentlyPlayed(limit, now),
    getTopTracks: async (range, limit) => rankedTopTracks(range).slice(0, limit),
    getTopArtists: async (range, limit) => rankedTopArtists(range).slice(0, limit),
    fetchArtistsByIds: async ids => {
      const wanted = new Set(ids);
      return Object.fromEntries(getCatalog().artists.filter(a => wanted.has(a.id)).map(a => [a.id, a]));
    },
    // Demo artists already have rich genres, so there is nothing to enrich
    enhanceArtists: async artists => ({ artists, lastFmUnavailable: [] }),
  };
}

export const DEMO_USER: UserProfile = {
  id: 'demo-listener',
  display_name: 'Sam Pling',
  images: images(coverArt('demo-listener', 150)),
  product: 'premium',
  followers: { total: 42 },
};

export function getDemoNowPlaying(): NowPlaying {
  const track = rankedTopTracks('short_term')[0];
  return {
    isPlaying: true,
    track: {
      id: track.id,
      name: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      image: track.album.images[0]?.url,
      url: track.external_urls.spotify,
    },
  };
}
