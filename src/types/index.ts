// Spotify API Types
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  popularity: number;
  external_urls: {
    spotify: string;
  };
  preview_url?: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  external_urls: {
    spotify: string;
  };
  images: SpotifyImage[];
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: SpotifyImage[];
  country: string;
  product: string;
}

export interface SpotifyPlayHistoryItem {
  track: SpotifyTrack;
  played_at: string;
  context?: {
    type: string;
    href: string;
    external_urls: {
      spotify: string;
    };
    uri: string;
  };
}

// App-specific Types
export interface TrackStats {
  track: SpotifyTrack;
  playCount: number;
  firstPlayed: string;
  lastPlayed: string;
  totalDuration: number;
}

export interface ArtistStats {
  artist: SpotifyArtist;
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

export interface TimeFrame {
  start: Date;
  end: Date;
  label: string;
}

export interface MusicProfile {
  primaryGenres: string[];
  listeningPersonality: string;
  topMood: string;
  discoveryScore: number;
  consistencyScore: number;
  peakHours: number[];
  averageSessionLength: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export interface UserRanking {
  userId: string;
  username: string;
  score: number;
  rank: number;
  category: string;
}

