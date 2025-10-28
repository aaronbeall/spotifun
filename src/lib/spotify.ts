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

// Helper function to fetch artists in batches
export async function fetchArtistsInBatches(artistIds: string[]) {
  const batchSize = 50; // Spotify's limit for getArtists endpoint
  const batches = [];

  for (let i = 0; i < artistIds.length; i += batchSize) {
    const batch = artistIds.slice(i, i + batchSize);
    try {
      const response = await spotifyApi.getArtists(batch);
      batches.push(...response.body.artists);
    } catch (error) {
      console.error('Error fetching artist batch:', error);
      throw error;
    }
  }

  return batches.reduce<Record<string, SpotifyApi.ArtistObjectFull>>((acc, artist) => {
    acc[artist.id] = artist;
    return acc;
  }, {});
}

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
export const calculateArtistStats = (
  playHistory: SpotifyApi.PlayHistoryObject[],
  artistDetails: Record<string, SpotifyApi.ArtistObjectFull> = {}
): ArtistStats[] => {
  const artistMap = new Map<string, ArtistStats & { trackIds: Set<string> }>();

  // Process each play history item
  playHistory.forEach(item => {
    item.track.artists.forEach(artist => {
      const artistId = artist.id;
      const fullArtist = artistDetails[artistId] || artist;

      if (artistMap.has(artistId)) {
        const stats = artistMap.get(artistId)!;
        stats.playCount++;
        stats.totalDuration += item.track.duration_ms;
        stats.trackIds.add(item.track.id);
        stats.uniqueTracks = stats.trackIds.size;
      } else {
        artistMap.set(artistId, {
          artist: fullArtist,
          playCount: 1,
          uniqueTracks: 1,
          totalDuration: item.track.duration_ms,
          genres: fullArtist.genres || [],
          trackIds: new Set([item.track.id])
        });
      }
    });
  });

  return Array.from(artistMap.values())
    .map(stats => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { trackIds: _, ...artistStats } = stats;
      return artistStats;
    })
    .sort((a, b) => b.playCount - a.playCount);
};

// Calculate genre statistics
export const calculateGenreStats = (
  playHistory: SpotifyApi.PlayHistoryObject[],
  artistDetails: Record<string, SpotifyApi.ArtistObjectFull> = {}
): GenreStats[] => {
  const genreMap = new Map<string, GenreStats & { trackIds: Set<string>; artistIds: Set<string> }>();

  // Process each play history item
  playHistory.forEach(item => {
    const trackId = item.track.id;

    // Process each artist in the track
    item.track.artists.forEach(artist => {
      const artistId = artist.id;
      const fullArtist = artistDetails[artistId] || artist;
      const artistGenres = 'genres' in fullArtist ? fullArtist.genres || [] : [];

      // Process each genre of the artist
      artistGenres.forEach(genre => {
        if (genreMap.has(genre)) {
          // Update existing genre stats
          const stats = genreMap.get(genre)!;
          stats.playCount++;
          stats.totalDuration += item.track.duration_ms;

          // Track unique tracks and artists
          stats.trackIds.add(trackId);
          stats.artistIds.add(artistId);

          // Update counts
          stats.uniqueTracks = stats.trackIds.size;
          stats.uniqueArtists = stats.artistIds.size;
        } else {
          // Initialize new genre stats
          genreMap.set(genre, {
            genre,
            playCount: 1,
            uniqueTracks: 1,
            uniqueArtists: 1,
            totalDuration: item.track.duration_ms,
            trackIds: new Set([trackId]),
            artistIds: new Set([artistId])
          });
        }
      });
    });
  });

  return Array.from(genreMap.values())
    .map(stats => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { trackIds: _, artistIds: __, ...genreStats } = stats;
      return genreStats;
    })
    .sort((a, b) => b.playCount - a.playCount);
};

// Calculate top genres from artists
export const calculateTopGenres = (artists: SpotifyApi.ArtistObjectFull[]): Array<{genre: string; count: number}> => {
  const genreCount = new Map<string, number>();

  // Count genre occurrences across all artists
  artists.forEach(artist => {
    artist.genres?.forEach(genre => {
      genreCount.set(genre, (genreCount.get(genre) || 0) + 1);
    });
  });

  // Convert to array and sort by count (descending)
  return Array.from(genreCount.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);
};

