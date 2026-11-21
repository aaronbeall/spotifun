/**
 * Example listening data for the example profile (/example).
 *
 * The listener is made up, but the artists, albums and songs are real. Artwork is looked up
 * on Deezer at runtime (./artwork.ts) and falls back to generated art when that lookup isn't
 * available. The objects use the same shapes the live Last.fm endpoints return, so the real
 * stats pipeline and dashboard components run on them unchanged.
 * Generation is seeded, so the dataset is the same on every request apart from play
 * timestamps, which are anchored to "now".
 */
import type { ListeningDataSource } from '@/lib/statsPipeline';
import type { NowPlaying, TimeRange, UserProfile } from '@/types';
import type { Album, Artist, ArtistRef, MusicImage, Play, Track } from '@/types/music';
import { lastFmArtistUrl, lastFmTrackUrl } from '@/utils/links';
import type { Artwork } from './artwork';

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

const images = (url: string): MusicImage[] => [{ url, width: 300, height: 300 }];

// ---------- Catalog ----------

interface AlbumSeed {
  name: string;
  year: number;
  tracks: string[];
}

interface ArtistSeed {
  name: string;
  genres: string[];
  /** Rough popularity (0-100). An estimate, not live data. */
  popularity: number;
  /** How much the example listener likes them: [recent weeks, recent months, years] */
  affinity: [number, number, number];
  /** Hue for the fallback art used when real artwork can't be looked up */
  hue: number;
  /** Typical track length in minutes */
  length?: [number, number];
  albums: AlbumSeed[];
}

// The example listener: real artists and real songs. A dream-pop and indie kid with a synthwave
// habit, a lo-fi study playlist, a jazz-nerd streak and a few chaotic detours (yes, the metal is load-bearing).
// Artwork is looked up at runtime (see ./artwork.ts); everything else lives here.
const ARTIST_SEEDS: ArtistSeed[] = [
  { name: 'Beach House', genres: ['dream pop', 'indie pop', 'shoegaze'], popularity: 72, affinity: [9, 10, 9], hue: 265, length: [4, 6],
    albums: [{ name: 'Depression Cherry', year: 2015, tracks: ['Space Song', 'Levitation', 'PPP'] }, { name: 'Bloom', year: 2012, tracks: ['Myth', 'Wild'] }] },
  { name: 'The Midnight', genres: ['synthwave', 'synthpop', 'retrowave'], popularity: 60, affinity: [10, 8, 6], hue: 320,
    albums: [{ name: 'Endless Summer', year: 2016, tracks: ['Sunset', 'Jason', 'Endless Summer'] }] },
  { name: 'Japanese Breakfast', genres: ['indie pop', 'indie rock', 'dream pop'], popularity: 63, affinity: [8, 9, 8], hue: 25,
    albums: [{ name: 'Jubilee', year: 2021, tracks: ['Be Sweet', 'Paprika', 'Kokomo, IN', 'Slide Tackle'] }] },
  { name: 'Nujabes', genres: ['lo-fi hip hop', 'jazz rap', 'chillhop'], popularity: 62, affinity: [8, 7, 7], hue: 190,
    albums: [{ name: 'Modal Soul', year: 2005, tracks: ['Feather', 'Luv(sic.) pt3', 'Reflection Eternal'] }] },
  { name: 'Mitski', genres: ['indie rock', 'indie pop', 'art pop'], popularity: 82, affinity: [7, 8, 6], hue: 140,
    albums: [{ name: 'Be the Cowboy', year: 2018, tracks: ['Nobody', 'Washing Machine Heart', 'Geyser'] }, { name: 'The Land Is Inhospitable and So Are We', year: 2023, tracks: ['My Love Mine All Mine'] }] },
  { name: 'Charli xcx', genres: ['hyperpop', 'electropop', 'pop'], popularity: 80, affinity: [9, 5, 2], hue: 95,
    albums: [{ name: 'BRAT', year: 2024, tracks: ['360', 'Von dutch', 'Apple'] }] },
  { name: 'Kendrick Lamar', genres: ['hip hop', 'conscious hip hop', 'west coast rap'], popularity: 90, affinity: [5, 6, 7], hue: 210,
    albums: [{ name: 'To Pimp a Butterfly', year: 2015, tracks: ['Alright', 'King Kunta'] }, { name: 'good kid, m.A.A.d city', year: 2012, tracks: ['Money Trees'] }] },
  { name: 'Tame Impala', genres: ['psychedelic rock', 'neo-psychedelic', 'indie rock'], popularity: 80, affinity: [6, 7, 7], hue: 280, length: [3.5, 7.5],
    albums: [{ name: 'Currents', year: 2015, tracks: ['Let It Happen', 'The Less I Know The Better', 'Eventually'] }] },
  { name: 'Boards of Canada', genres: ['idm', 'ambient', 'electronic'], popularity: 55, affinity: [4, 6, 7], hue: 200, length: [3, 6],
    albums: [{ name: 'Music Has the Right to Children', year: 1998, tracks: ['Roygbiv', 'Turquoise Hexagon Sun'] }, { name: 'The Campfire Headphase', year: 2005, tracks: ['Dayvan Cowboy'] }] },
  { name: 'Daft Punk', genres: ['french house', 'electronic', 'disco'], popularity: 81, affinity: [6, 5, 5], hue: 350, length: [3.5, 6],
    albums: [{ name: 'Random Access Memories', year: 2013, tracks: ['Get Lucky', 'Instant Crush'] }, { name: 'Discovery', year: 2001, tracks: ['One More Time', 'Digital Love'] }] },
  { name: 'Hiatus Kaiyote', genres: ['neo soul', 'future soul', 'r&b'], popularity: 52, affinity: [5, 7, 6], hue: 40,
    albums: [{ name: 'Tawk Tomahawk', year: 2012, tracks: ['Nakamarra'] }, { name: 'Mood Valiant', year: 2021, tracks: ['Red Room'] }] },
  { name: 'Gojira', genres: ['death metal', 'progressive metal', 'metal'], popularity: 62, affinity: [4, 3, 3], hue: 0,
    albums: [{ name: 'Magma', year: 2016, tracks: ['Stranded', 'Silvera'] }] },
  { name: 'Herbie Hancock', genres: ['jazz', 'jazz funk', 'hard bop'], popularity: 58, affinity: [3, 5, 6], hue: 30, length: [5, 9],
    albums: [{ name: 'Empyrean Isles', year: 1964, tracks: ['Cantaloupe Island'] }, { name: 'Head Hunters', year: 1973, tracks: ['Chameleon', 'Watermelon Man'] }] },
  { name: 'NewJeans', genres: ['k-pop', 'dance pop', 'pop'], popularity: 78, affinity: [5, 4, 3], hue: 55, length: [2.5, 3.5],
    albums: [{ name: 'New Jeans', year: 2022, tracks: ['Hype Boy', 'Attention'] }, { name: 'Get Up', year: 2023, tracks: ['Super Shy', 'ETA'] }] },
  { name: 'Bon Iver', genres: ['indie folk', 'folk', 'chamber pop'], popularity: 74, affinity: [3, 5, 8], hue: 110,
    albums: [{ name: 'Bon Iver, Bon Iver', year: 2011, tracks: ['Holocene', 'Perth'] }, { name: 'For Emma, Forever Ago', year: 2008, tracks: ['Skinny Love'] }] },
  { name: 'Slowdive', genres: ['shoegaze', 'dream pop', 'noise pop'], popularity: 64, affinity: [6, 5, 5], hue: 180, length: [4, 7],
    albums: [{ name: 'Souvlaki', year: 1993, tracks: ['When the Sun Hits', 'Alison'] }] },
  { name: 'Kraftwerk', genres: ['krautrock', 'synthpop', 'electronic'], popularity: 57, affinity: [2, 3, 5], hue: 245, length: [4, 7],
    albums: [{ name: 'The Man-Machine', year: 1978, tracks: ['The Model', 'The Robots'] }, { name: 'Computer World', year: 1981, tracks: ['Computer Love'] }] },
  { name: 'Fela Kuti', genres: ['afrobeat', 'afro-funk', 'funk'], popularity: 50, affinity: [2, 4, 4], hue: 45, length: [8, 13],
    albums: [{ name: 'Expensive Shit', year: 1975, tracks: ['Water No Get Enemy'] }, { name: 'Zombie', year: 1976, tracks: ['Zombie'] }] },
  { name: 'Khruangbin', genres: ['psychedelic soul', 'funk', 'surf rock'], popularity: 67, affinity: [5, 6, 5], hue: 165,
    albums: [{ name: 'Con Todo El Mundo', year: 2018, tracks: ['Maria También', 'Evan Finds the Third Room'] }, { name: 'Mordechai', year: 2020, tracks: ['Time (You and I)'] }] },
  { name: 'Phoebe Bridgers', genres: ['indie folk', 'singer-songwriter', 'indie rock'], popularity: 73, affinity: [4, 6, 6], hue: 220,
    albums: [{ name: 'Stranger in the Alps', year: 2017, tracks: ['Motion Sickness'] }, { name: 'Punisher', year: 2020, tracks: ['Kyoto', 'Garden Song'] }] },
  { name: 'Bad Bunny', genres: ['reggaeton', 'latin trap', 'latin pop'], popularity: 93, affinity: [4, 3, 1], hue: 340,
    albums: [{ name: 'Un Verano Sin Ti', year: 2022, tracks: ['Tití Me Preguntó', 'Me Porto Bonito'] }] },
  { name: 'Burial', genres: ['uk garage', 'dubstep', 'electronic'], popularity: 51, affinity: [4, 4, 4], hue: 230, length: [4, 7],
    albums: [{ name: 'Untrue', year: 2007, tracks: ['Archangel', 'Untrue'] }] },
  { name: 'Caroline Polachek', genres: ['art pop', 'indie pop', 'electropop'], popularity: 63, affinity: [6, 5, 3], hue: 300,
    albums: [{ name: 'Pang', year: 2019, tracks: ["So Hot You're Hurting My Feelings"] }, { name: 'Desire, I Want To Turn Into You', year: 2023, tracks: ['Welcome To My Island', 'Bunny Is A Rider'] }] },
  { name: 'Fleetwood Mac', genres: ['soft rock', 'classic rock', 'yacht rock'], popularity: 84, affinity: [2, 3, 5], hue: 15,
    albums: [{ name: 'Rumours', year: 1977, tracks: ['Dreams', 'The Chain'] }, { name: 'Tango in the Night', year: 1987, tracks: ['Everywhere'] }] },
  { name: 'Tyler, The Creator', genres: ['hip hop', 'neo soul', 'alternative hip hop'], popularity: 88, affinity: [5, 5, 4], hue: 75,
    albums: [{ name: 'Flower Boy', year: 2017, tracks: ['See You Again', 'Boredom'] }, { name: 'IGOR', year: 2019, tracks: ['EARFQUAKE'] }] },
  { name: 'Radiohead', genres: ['art rock', 'alternative rock', 'experimental rock'], popularity: 80, affinity: [3, 5, 7], hue: 120, length: [4, 6],
    albums: [{ name: 'In Rainbows', year: 2007, tracks: ['Weird Fishes/Arpeggi', 'Reckoner'] }, { name: 'Kid A', year: 2000, tracks: ['Everything In Its Right Place'] }] },
  { name: 'Dolly Parton', genres: ['country', 'bluegrass', 'americana'], popularity: 76, affinity: [2, 2, 3], hue: 35,
    albums: [{ name: 'Jolene', year: 1974, tracks: ['Jolene'] }, { name: '9 to 5 and Odd Jobs', year: 1980, tracks: ['9 to 5'] }] },
  { name: 'Mac DeMarco', genres: ['indie rock', 'jangle pop', 'slacker rock'], popularity: 70, affinity: [5, 5, 5], hue: 150,
    albums: [{ name: 'Salad Days', year: 2014, tracks: ['Chamber Of Reflection', 'Salad Days'] }, { name: '2', year: 2012, tracks: ['My Kind Of Woman'] }] },
];

const slug = (value: string) => value.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '');

const RANGE_INDEX: Record<TimeRange, number> = { '7day': 0, '1month': 0, '3month': 1, '6month': 1, '12month': 2, overall: 2 };

/** Roughly how many plays a favorite racks up over each period, to make believable play counts */
const RANGE_PLAYS: Record<TimeRange, number> = { '7day': 1.5, '1month': 5, '3month': 12, '6month': 22, '12month': 40, overall: 110 };

interface DemoTrack {
  track: Track;
  artistIndex: number;
  /** How catchy this track is relative to the rest of the artist's catalog */
  appeal: number;
}

interface DemoCatalog {
  artists: Artist[];
  tracks: DemoTrack[];
}

function buildCatalog(): DemoCatalog {
  const rng = createRng(20251102);

  const artists = ARTIST_SEEDS.map((seed): Artist => {
    const id = `demo-artist-${slug(seed.name)}`;
    return {
      id,
      name: seed.name,
      url: lastFmArtistUrl(seed.name),
      genres: seed.genres,
      popularity: seed.popularity,
      images: images(coverArt(id, seed.hue)),
    };
  });

  const tracks: DemoTrack[] = [];
  ARTIST_SEEDS.forEach((seed, artistIndex) => {
    const artist = artists[artistIndex];
    const artistRef: ArtistRef = { id: artist.id, name: artist.name, url: artist.url };
    seed.albums.forEach((albumSeed, a) => {
      const albumId = `demo-album-${slug(seed.name)}-${slug(albumSeed.name)}`;
      const album: Album = {
        id: albumId,
        name: albumSeed.name,
        images: images(coverArt(albumId, (seed.hue + a * 35) % 360)),
        release_date: `${albumSeed.year}`,
      };
      const [minLength, maxLength] = seed.length ?? [2.6, 4.6];
      albumSeed.tracks.forEach((name, t) => {
        const id = `demo-track-${slug(seed.name)}-${slug(name)}`;
        tracks.push({
          artistIndex,
          // Earlier-listed songs are the hits
          appeal: Math.max(0.35, 1 - t * 0.18 - a * 0.1) * (0.85 + rng() * 0.15),
          track: {
            id,
            name,
            url: lastFmTrackUrl(seed.name, name),
            album,
            artists: [artistRef],
            duration_ms: Math.round(between(rng, minLength, maxLength) * 60000),
            popularity: Math.max(1, Math.min(100, Math.round(seed.popularity + between(rng, -14, 8) - t * 3))),
          },
        });
      });
    });
  });

  return { artists, tracks };
}

/** Lookup key for an album in `Artwork.albums` */
export const albumKey = (artist: string, album: string) => `${artist}|${album}`;

/** Artist names and albums the artwork lookup should resolve */
export function getArtworkQueries(): { artists: string[]; albums: { artist: string; album: string }[] } {
  return {
    artists: ARTIST_SEEDS.map(seed => seed.name),
    albums: ARTIST_SEEDS.flatMap(seed => seed.albums.map(album => ({ artist: seed.name, album: album.name }))),
  };
}

/** Swaps in real artwork wherever the lookup found it */
function applyArtwork(base: DemoCatalog, artwork: Artwork): DemoCatalog {
  const artists = base.artists.map(artist => {
    const found = artwork.artists[artist.name];
    return found ? { ...artist, images: found.images } : artist;
  });
  const albums = new Map<string, Album>();
  const tracks = base.tracks.map(item => {
    const { album } = item.track;
    let resolved = albums.get(album.id);
    if (!resolved) {
      const found = artwork.albums[albumKey(item.track.artists[0].name, album.name)];
      resolved = found ? { ...album, images: found.images } : album;
      albums.set(album.id, resolved);
    }
    return { ...item, track: { ...item.track, album: resolved } };
  });
  return { artists, tracks };
}

let baseCatalog: DemoCatalog | null = null;
const catalogsByArtwork = new WeakMap<Artwork, DemoCatalog>();

function getCatalog(artwork?: Artwork | null): DemoCatalog {
  baseCatalog ??= buildCatalog();
  if (!artwork) return baseCatalog;
  let catalog = catalogsByArtwork.get(artwork);
  if (!catalog) {
    catalog = applyArtwork(baseCatalog, artwork);
    catalogsByArtwork.set(artwork, catalog);
  }
  return catalog;
}

// ---------- Listening behavior ----------

function artistScores(range: TimeRange): number[] {
  const rng = createRng(hashString(`artists-${range}`));
  const index = RANGE_INDEX[range];
  return ARTIST_SEEDS.map(seed => seed.affinity[index] * (0.85 + rng() * 0.3));
}

function rankedTopArtists(range: TimeRange, artwork?: Artwork | null): Artist[] {
  const { artists } = getCatalog(artwork);
  const scores = artistScores(range);
  return artists
    .map((artist, i) => ({ artist, score: scores[i] }))
    .sort((a, b) => b.score - a.score)
    .map(({ artist, score }) => ({ ...artist, playcount: Math.max(1, Math.round(score * RANGE_PLAYS[range] * 2.5)) }));
}

function rankedTopTracks(range: TimeRange, artwork?: Artwork | null): Track[] {
  const { tracks } = getCatalog(artwork);
  const scores = artistScores(range);
  const rng = createRng(hashString(`tracks-${range}`));
  return tracks
    .map(item => ({ item, score: scores[item.artistIndex] * item.appeal * (0.8 + rng() * 0.4) }))
    .sort((a, b) => b.score - a.score)
    .map(({ item, score }) => ({ ...item.track, playcount: Math.max(1, Math.round(score * RANGE_PLAYS[range])) }));
}

/**
 * A believable recently-played history: a few listening sessions over the last couple of days,
 * newest first, with favorite tracks on repeat.
 */
function recentlyPlayed(limit: number, now: number, artwork?: Artwork | null): Play[] {
  const { tracks } = getCatalog(artwork);
  const rng = createRng(hashString('recently-played'));
  const scores = artistScores('1month');
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
  const plays: Play[] = [];
  let previous: Track | null = null;
  while (plays.length < Math.max(limit, 50)) {
    let track = pickTrack();
    if (track.id === previous?.id && rng() < 0.7) track = pickTrack();
    plays.push({
      track,
      played_at: new Date(cursor).toISOString(),
    });
    previous = track;
    cursor -= track.duration_ms + Math.round(rng() * 20000);
    // Occasional break between sessions (a commute, a nap, a whole night)
    if (rng() < 0.08) cursor -= Math.round(between(rng, 1, 9) * 3600000);
  }
  return plays.slice(0, limit);
}

/**
 * Data source with the same contract as the live Last.fm one, backed by the example catalog.
 * Pass the result of `getArtwork()` to use real artwork; without it, generated art is used.
 */
export function createDemoDataSource(now: number = Date.now(), artwork?: Artwork | null): ListeningDataSource {
  return {
    getRecentlyPlayed: async limit => recentlyPlayed(limit, now, artwork),
    getTopTracks: async (range, limit) => rankedTopTracks(range, artwork).slice(0, limit),
    getTopArtists: async (range, limit) => rankedTopArtists(range, artwork).slice(0, limit),
    fetchArtists: async refs => {
      const wanted = new Set(refs.map(ref => ref.id));
      return Object.fromEntries(getCatalog(artwork).artists.filter(a => wanted.has(a.id)).map(a => [a.id, a]));
    },
    // Example artists already have rich genres, so there is nothing to enrich
    enhanceArtists: async artists => ({ artists, lastFmUnavailable: [] }),
  };
}

export const DEMO_USER: UserProfile = {
  id: 'demo-listener',
  display_name: 'Sam Pling',
  images: images(coverArt('demo-listener', 150)),
  playcount: 48213,
  registeredAt: '2014-03-09T00:00:00.000Z',
};

export function getDemoNowPlaying(artwork?: Artwork | null): NowPlaying {
  const track = rankedTopTracks('1month', artwork)[0];
  return {
    isPlaying: true,
    track: {
      id: track.id,
      name: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      image: track.album.images[0]?.url,
      url: track.url,
    },
  };
}
