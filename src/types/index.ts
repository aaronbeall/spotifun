// App-specific Types. Music shapes live in ./music.
import type { Artist, MusicImage, Play, Track } from './music';

export type { Album, Artist, ArtistRef, MusicImage, Play, Track } from './music';

export interface TrackStats {
  track: Track;
  artists: Artist[];
  playCount: number;
  firstPlayed: string;
  lastPlayed: string;
  totalDuration: number;
}

export interface ArtistStats {
  artist: Artist;
  playCount: number;
  uniqueTracks: number;
  totalDuration: number;
  genres: string[];
}

export interface GenreStats {
  genre: string;
  playCount: number;
  uniqueTracks: number;
  uniqueArtists: number;
  totalDuration: number;
}

export interface MusicProfileStats {
  personality: {
    name: string;
    description: string;
    color: string;
    score: number;
  };
  mood: {
    name: string;
    color: string;
    score: number;
  };
  discoveryScore: number;
  consistencyScore: number;
  peakHours: number[];
  averageSessionLength: number;
  primaryGenres: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  totalRequired?: number;
  maxProgress?: number;
  color?: string;
}

export interface UserRanking {
  id: string;
  name: string;
  score: number;
  rank: number;
  image?: string;
}

// API Response Types
export interface UserProfile {
  /** Last.fm username, lowercased: the key for this browser's saved badges and unlocks */
  id: string;
  display_name: string;
  /** Last.fm doesn't license its avatars to apps, so this is usually empty */
  images: MusicImage[];
  /** Last.fm profile page */
  url?: string;
  /** Lifetime scrobbles */
  playcount?: number;
  /** When the listener started scrobbling (ISO) */
  registeredAt?: string;
}

export interface StatsOverview {
  totalPlays: number;
  uniqueArtists: number;
  uniqueTracks: number;
  uniqueGenres: number;
  totalDuration: number;
  averageSessionLength: number;
  genreDiversity: number;
  artistDiversity: number;
  averagePopularity: number; // 0-100 scale
  genreCoverage?: number; // 0-1 scale: proportion of genre weight successfully classified
}

/** Last.fm's top-list periods */
export type TimeRange = '7day' | '1month' | '3month' | '6month' | '12month' | 'overall';

export const TIME_RANGES: TimeRange[] = ['7day', '1month', '3month', '6month', '12month', 'overall'];

export const DEFAULT_TIME_RANGE: TimeRange = '6month';
export type DataMode = 'recent' | 'topArtists' | 'topTracks' | 'playlist';

/** One Last.fm period, summarized so a view can be set next to the others. */
export interface EraSnapshot {
  timeRange: TimeRange;
  label: string;
  /** Average popularity, 0–100. Top tracks when they could be matched, otherwise top artists. */
  popularity: number;
  /** Share of artists outside the biggest genre family, same ratio as the profile overview. */
  genreDiversity: number;
  valence: number;
  arousal: number;
  artists: number;
  tracks: number;
}

export interface ErasResponse {
  eras: EraSnapshot[];
}

/** The listener's Last.fm Loved Tracks, the one collection playlist mode can analyze. */
export const LIKED_SONGS_ID = 'liked';

export const LIKED_SONGS_NAME = 'Loved Tracks';

/** How many songs from a playlist are included in profile stats. */
export const PLAYLIST_ANALYSIS_CAP = 500;

export interface PlaylistSelection {
  id: string;
  name: string;
  image?: string;
}

export interface PlaylistSummary extends PlaylistSelection {
  trackCount: number;
}

export interface PlaylistsResponse {
  likedSongs: PlaylistSummary | null;
  likedSongsNeedsReconnect: boolean;
  playlists: PlaylistSummary[];
}

/** The collection currently driving playlist mode, including how much of it was analyzed. */
export interface PlaylistAnalysis extends PlaylistSelection {
  total: number;
  analyzed: number;
}

/** A top artist plus how many times they appear in the recent-plays window. */
export interface TopArtistItem extends Artist {
  recentPlays: number;
}

/** A top track plus how many times it appears in the recent-plays window. */
export interface TopTrackItem extends Track {
  recentPlays: number;
  /** Latest play in that window. Absent when the track was not played recently. */
  lastPlayed?: string;
}

export interface NowPlaying {
  isPlaying: boolean;
  track: {
    id: string;
    name: string;
    artist: string;
    image?: string;
    url?: string;
  } | null;
}

export interface Stats {
  overview: StatsOverview;
  recentlyPlayed: Play[];
  tracks: TrackStats[];
  artists: ArtistStats[];
  genres: GenreStats[];
  topTracks: TopTrackItem[];
  topArtists: TopArtistItem[];
  timeRange: TimeRange;
  topGenres: TopGenre[];
  mode: DataMode;
  /** Present when `mode` is `playlist`. */
  playlist?: PlaylistAnalysis;
  /** Artists whose genres couldn't be enriched with Last.fm (rate limit or API error); omitted when 0 */
  lastFmUnavailableCount?: number;
  /** Genre labels from this view that matched neither the taxonomy nor the mood vocabulary. */
  unmatchedGenres?: string[];
  debugGenreData?: ArtistGenreDebugInfo[]; // Dev-only: always returned when NODE_ENV=development
  debugLastFmStatus?: LastFmDebugStatus;
}

/**
 * How a single genre/tag string was resolved:
 * - exact: string is a taxonomy node name
 * - alias: string is a listed alias of a node
 * - partial: a node alias appears as whole words inside the string
 * - keyword: only the last word matched a node
 * - descriptor: not a genre, but a mood/descriptor in the descriptor vocabulary
 * - unknown: nothing matched
 */
export type GenreMatchKind = 'exact' | 'alias' | 'partial' | 'keyword' | 'descriptor' | 'unknown';

export interface GenreTagDebugInfo {
  tag: string;
  source: 'seed' | 'lastfm';
  kind: GenreMatchKind;
  /** Taxonomy node the tag resolved to */
  node: string | null;
  /** Node whose scores were actually used (differs from `node` when inherited from a parent) */
  scoresFrom: string | null;
  /** Last.fm tag weight (0-100, relative to the artist's top tag) */
  weight?: number;
  /** Dropped by the Last.fm junk-tag filter before classification */
  filteredAsJunk?: boolean;
  usedInScoring: boolean;
}

export type LastFmDebugStatus = 'on' | 'disabled' | 'no-api-key';

interface TopGenre {
  genre: string;
  count: number;
}

export interface ArtistGenreDebugInfo {
  artistName: string;
  /** Last.fm returned tags for this artist (it is only queried for artists with 0-2 seeded genres) */
  hasLastFmData: boolean;
  tags: GenreTagDebugInfo[];
  vacrsScores: VACRSScore | null;
  coverage: number; // 0-1 scale
}

export interface VACRSScore {
  valence: number;      // 0 (unpleasant) to 1 (pleasant)
  arousal: number;      // 0 (calm) to 1 (energetic)
  complexity: number;   // 0 (simple) to 1 (complex)
  rawness: number;      // 0 (polished) to 1 (raw)
  socialPresence: number; // 0 (solitary) to 1 (communal)
}

export interface GenreProfile extends VACRSScore {
  aliases: string[];
  description: string;
}

export interface MusicVibe {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  image?: string;
  color: {
    light: string;
    dark: string;
  };
  targetScore: VACRSScore;
  /**
   * 0–1 rarity from the 12 Nov 2026 coverage sample.
   * 0 is the largest song share. 1 would be a vibe with no classified songs.
   */
  rarity?: number;
}