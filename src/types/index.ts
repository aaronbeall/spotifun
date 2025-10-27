// App-specific Types (using Spotify API types from spotify-web-api-node)
export interface TrackStats {
  track: SpotifyApi.TrackObjectFull;
  playCount: number;
  firstPlayed: string;
  lastPlayed: string;
  totalDuration: number;
}

export interface ArtistStats {
  artist: SpotifyApi.ArtistObjectSimplified;
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
  progress: number;
  maxProgress: number;
  color: string;
}

export interface UserRanking {
  id: string;
  name: string;
  score: number;
  rank: number;
}
