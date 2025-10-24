import SpotifyWebApi from 'spotify-web-api-node';
import { TrackStats, ArtistStats, GenreStats } from '@/types';

// Initialize Spotify API
export const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// Set access token for API calls
export const setAccessToken = (token: string) => {
  spotifyApi.setAccessToken(token);
};

// Fetch user's recently played tracks
export const getRecentlyPlayed = async (limit: number = 50): Promise<SpotifyApi.PlayHistoryObject[]> => {
  try {
    const response = await spotifyApi.getMyRecentlyPlayedTracks({ limit });
    return response.body.items;
  } catch (error) {
    console.error('Error fetching recently played tracks:', error);
    throw error;
  }
};

// Fetch user's top tracks
export const getTopTracks = async (timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 50): Promise<SpotifyApi.TrackObjectFull[]> => {
  try {
    const response = await spotifyApi.getMyTopTracks({ time_range: timeRange, limit });
    return response.body.items;
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    throw error;
  }
};

// Fetch user's top artists
export const getTopArtists = async (timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 50): Promise<SpotifyApi.ArtistObjectFull[]> => {
  try {
    const response = await spotifyApi.getMyTopArtists({ time_range: timeRange, limit });
    return response.body.items;
  } catch (error) {
    console.error('Error fetching top artists:', error);
    throw error;
  }
};

// Get track details with audio features
export const getTrackDetails = async (trackId: string): Promise<{
  track: SpotifyApi.SingleTrackResponse;
  audioFeatures: SpotifyApi.AudioFeaturesResponse;
}> => {
  try {
    const [track, audioFeatures] = await Promise.all([
      spotifyApi.getTrack(trackId),
      spotifyApi.getAudioFeaturesForTrack(trackId)
    ]);
    
    return {
      track: track.body,
      audioFeatures: audioFeatures.body
    };
  } catch (error) {
    console.error('Error fetching track details:', error);
    throw error;
  }
};

// Get artist details (includes genres)
export const getArtistDetails = async (artistId: string): Promise<SpotifyApi.SingleArtistResponse> => {
  try {
    const response = await spotifyApi.getArtist(artistId);
    return response.body;
  } catch (error) {
    console.error('Error fetching artist details:', error);
    throw error;
  }
};

// Calculate track statistics from play history
export const calculateTrackStats = (playHistory: SpotifyApi.PlayHistoryObject[]): TrackStats[] => {
  const trackMap = new Map<string, TrackStats>();
  
  playHistory.forEach(item => {
    const trackId = item.track.id;
    const playedAt = new Date(item.played_at);
    
    if (trackMap.has(trackId)) {
      const stats = trackMap.get(trackId)!;
      stats.playCount++;
      stats.totalDuration += item.track.duration_ms;
      
      if (playedAt < new Date(stats.firstPlayed)) {
        stats.firstPlayed = item.played_at;
      }
      if (playedAt > new Date(stats.lastPlayed)) {
        stats.lastPlayed = item.played_at;
      }
    } else {
      trackMap.set(trackId, {
        track: item.track,
        playCount: 1,
        firstPlayed: item.played_at,
        lastPlayed: item.played_at,
        totalDuration: item.track.duration_ms
      });
    }
  });
  
  return Array.from(trackMap.values()).sort((a, b) => b.playCount - a.playCount);
};

// Calculate artist statistics
export const calculateArtistStats = (playHistory: SpotifyApi.PlayHistoryObject[]): ArtistStats[] => {
  const artistMap = new Map<string, ArtistStats & { trackIds: Set<string> }>();
  
  playHistory.forEach(item => {
    item.track.artists.forEach(artist => {
      const artistId = artist.id;
      
      if (artistMap.has(artistId)) {
        const stats = artistMap.get(artistId)!;
        stats.playCount++;
        stats.totalDuration += item.track.duration_ms;
        
        // Add unique tracks
        stats.trackIds.add(item.track.id);
        stats.uniqueTracks = stats.trackIds.size;
      } else {
        artistMap.set(artistId, {
          artist,
          playCount: 1,
          uniqueTracks: 1,
          totalDuration: item.track.duration_ms,
          genres: [], // ArtistObjectSimplified doesn't have genres
          trackIds: new Set([item.track.id])
        });
      }
    });
  });
  
  return Array.from(artistMap.values())
    .map(stats => {
      const { trackIds: _, ...artistStats } = stats;
      return artistStats;
    })
    .sort((a, b) => b.playCount - a.playCount);
};

// Calculate genre statistics
export const calculateGenreStats = (playHistory: SpotifyApi.PlayHistoryObject[]): GenreStats[] => {
  const genreMap = new Map<string, GenreStats & { trackIds: Set<string>; artistIds: Set<string> }>();
  
  playHistory.forEach(item => {
    item.track.artists.forEach(artist => {
      // Note: ArtistObjectSimplified doesn't have genres, so we'll skip genre calculation
      // In a real app, you'd need to fetch full artist details to get genres
      if ('genres' in artist && Array.isArray(artist.genres)) {
        artist.genres.forEach((genre: string) => {
          if (genreMap.has(genre)) {
            const stats = genreMap.get(genre)!;
            stats.playCount++;
            stats.totalDuration += item.track.duration_ms;
            
            stats.trackIds.add(item.track.id);
            stats.artistIds.add(artist.id);
            
            stats.uniqueTracks = stats.trackIds.size;
            stats.uniqueArtists = stats.artistIds.size;
          } else {
            genreMap.set(genre, {
              genre,
              playCount: 1,
              uniqueTracks: 1,
              uniqueArtists: 1,
              totalDuration: item.track.duration_ms,
              trackIds: new Set([item.track.id]),
              artistIds: new Set([artist.id])
            });
          }
        });
      }
    });
  });
  
  return Array.from(genreMap.values())
    .map(stats => {
      const { trackIds: _, artistIds: __, ...genreStats } = stats;
      return genreStats;
    })
    .sort((a, b) => b.playCount - a.playCount);
};

// Format duration from milliseconds to readable string
export const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else {
    return `${minutes}m`;
  }
};

// Format play count with appropriate suffixes
export const formatPlayCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};
