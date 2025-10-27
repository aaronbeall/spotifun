// App-specific Types (using Spotify API types from @types/spotify-api)

export interface TrackStats {
  track: SpotifyApi.TrackObjectFull;
  playCount: number;
  firstPlayed: string;
  lastPlayed: string;
  totalDuration: number;
}

export interface ArtistStats {
  artist: SpotifyApi.ArtistObjectSimplified & {
    images?: SpotifyApi.ImageObject[];
  };
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
  totalDuration: number;
  averageSessionLength: number;
  genreDiversity: number;
  artistDiversity: number;
}

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export interface Stats {
  overview: StatsOverview;
  tracks: TrackStats[];
  artists: ArtistStats[];
  genres: GenreStats[];
  topTracks: SpotifyApi.TrackObjectFull[];
  topArtists: SpotifyApi.ArtistObjectFull[];
  timeRange: TimeRange;
}
