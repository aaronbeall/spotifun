// App-specific Types (using Spotify API types from @types/spotify-api)

export interface TrackStats {
  track: SpotifyApi.TrackObjectFull;
  artists: SpotifyApi.ArtistObjectFull[];
  playCount: number;
  firstPlayed: string;
  lastPlayed: string;
  totalDuration: number;
}

export interface ArtistStats {
  artist: SpotifyApi.ArtistObjectFull;
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
  id: string;
  display_name: string;
  images: SpotifyApi.ImageObject[];
  email?: string;
  product?: string;
  followers?: {
    total: number;
  };
  name?: string;          // For compatibility with components that might expect a name
  image?: string;         // For compatibility with components that might expect an image URL
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

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';
export type DataMode = 'recent' | 'topArtists' | 'topTracks';

/** A Spotify top artist plus how many times they appear in the recent-plays window. */
export interface TopArtistItem extends SpotifyApi.ArtistObjectFull {
  recentPlays: number;
}

/** A Spotify top track plus how many times it appears in the recent-plays window. */
export interface TopTrackItem extends SpotifyApi.TrackObjectFull {
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
  recentlyPlayed: SpotifyApi.PlayHistoryObject[];
  tracks: TrackStats[];
  artists: ArtistStats[];
  genres: GenreStats[];
  topTracks: TopTrackItem[];
  topArtists: TopArtistItem[];
  timeRange: TimeRange;
  topGenres: TopGenre[];
  mode: DataMode;
  /** Artists whose genres couldn't be enriched with Last.fm (rate limit or API error); omitted when 0 */
  lastFmUnavailableCount?: number;
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
  source: 'spotify' | 'lastfm';
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
  /** Last.fm returned tags for this artist (it is only queried for artists with 0-2 Spotify genres) */
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
}