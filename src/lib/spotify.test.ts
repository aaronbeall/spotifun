import { describe, it, expect } from 'vitest';
import {
  calculateTrackStats,
  calculateArtistStats,
  calculateGenreStats,
  calculateTopGenres,
} from './spotify';

describe('calculateTrackStats', () => {
  it('returns empty array for empty play history', () => {
    const result = calculateTrackStats([]);
    
    expect(result).toEqual([]);
  });

  it('calculates basic stats for single track', () => {
    const playHistory: SpotifyApi.PlayHistoryObject[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Test Song',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Test Artist' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
    ];
    
    const result = calculateTrackStats(playHistory);
    
    expect(result).toHaveLength(1);
    expect(result[0].track.id).toBe('track1');
    expect(result[0].playCount).toBe(1);
    expect(result[0].firstPlayed).toBe('2024-01-01T10:00:00Z');
    expect(result[0].lastPlayed).toBe('2024-01-01T10:00:00Z');
    expect(result[0].totalDuration).toBe(200000);
  });

  it('aggregates multiple plays of same track', () => {
    const playHistory: SpotifyApi.PlayHistoryObject[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Test Song',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Test Artist' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
      {
        played_at: '2024-01-02T15:00:00Z',
        track: {
          id: 'track1',
          name: 'Test Song',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Test Artist' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
      {
        played_at: '2024-01-01T12:00:00Z',
        track: {
          id: 'track1',
          name: 'Test Song',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Test Artist' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
    ];
    
    const result = calculateTrackStats(playHistory);
    
    expect(result).toHaveLength(1);
    expect(result[0].playCount).toBe(3);
    expect(result[0].totalDuration).toBe(600000);
    expect(result[0].firstPlayed).toBe('2024-01-01T10:00:00Z');
    expect(result[0].lastPlayed).toBe('2024-01-02T15:00:00Z');
  });

  it('tracks multiple different tracks', () => {
    const playHistory: SpotifyApi.PlayHistoryObject[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
      {
        played_at: '2024-01-01T11:00:00Z',
        track: {
          id: 'track2',
          name: 'Song 2',
          duration_ms: 180000,
          artists: [{ id: 'artist2', name: 'Artist 2' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
    ];
    
    const result = calculateTrackStats(playHistory);
    
    expect(result).toHaveLength(2);
    expect(result[0].playCount).toBe(1);
    expect(result[1].playCount).toBe(1);
  });

  it('sorts tracks by play count (descending)', () => {
    const playHistory: SpotifyApi.PlayHistoryObject[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Less Popular',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
      {
        played_at: '2024-01-01T11:00:00Z',
        track: {
          id: 'track2',
          name: 'Most Popular',
          duration_ms: 180000,
          artists: [{ id: 'artist2', name: 'Artist 2' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
      {
        played_at: '2024-01-01T12:00:00Z',
        track: {
          id: 'track2',
          name: 'Most Popular',
          duration_ms: 180000,
          artists: [{ id: 'artist2', name: 'Artist 2' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
      {
        played_at: '2024-01-01T13:00:00Z',
        track: {
          id: 'track2',
          name: 'Most Popular',
          duration_ms: 180000,
          artists: [{ id: 'artist2', name: 'Artist 2' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
    ];
    
    const result = calculateTrackStats(playHistory);
    
    expect(result[0].track.name).toBe('Most Popular');
    expect(result[0].playCount).toBe(3);
    expect(result[1].track.name).toBe('Less Popular');
    expect(result[1].playCount).toBe(1);
  });

  it('includes artist details when provided', () => {
    const playHistory: SpotifyApi.PlayHistoryObject[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Test Song',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Test Artist' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
    ];
    
    const artistDetails = {
      artist1: {
        id: 'artist1',
        name: 'Test Artist',
        genres: ['rock', 'indie'],
        popularity: 75,
      } as SpotifyApi.ArtistObjectFull,
    };
    
    const result = calculateTrackStats(playHistory, artistDetails);
    
    expect(result[0].artists[0].genres).toEqual(['rock', 'indie']);
    expect(result[0].artists[0].popularity).toBe(75);
  });
});

describe('calculateArtistStats', () => {
  it('returns empty array for empty play history', () => {
    const result = calculateArtistStats([]);
    
    expect(result).toEqual([]);
  });

  it('calculates stats for single artist', () => {
    const playHistory: SpotifyApi.PlayHistoryObject[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
    ];
    
    const result = calculateArtistStats(playHistory);
    
    expect(result).toHaveLength(1);
    expect(result[0].artist.id).toBe('artist1');
    expect(result[0].playCount).toBe(1);
    expect(result[0].uniqueTracks).toBe(1);
    expect(result[0].totalDuration).toBe(200000);
  });

  it('aggregates multiple plays of same artist', () => {
    const playHistory: SpotifyApi.PlayHistoryObject[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
      {
        played_at: '2024-01-01T11:00:00Z',
        track: {
          id: 'track2',
          name: 'Song 2',
          duration_ms: 180000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
      {
        played_at: '2024-01-01T12:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
    ];
    
    const result = calculateArtistStats(playHistory);
    
    expect(result).toHaveLength(1);
    expect(result[0].playCount).toBe(3);
    expect(result[0].uniqueTracks).toBe(2); // track1 and track2
    expect(result[0].totalDuration).toBe(580000);
  });

  it('handles tracks with multiple artists', () => {
    const playHistory: SpotifyApi.PlayHistoryObject[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Collab Song',
          duration_ms: 200000,
          artists: [
            { id: 'artist1', name: 'Artist 1' },
            { id: 'artist2', name: 'Artist 2' },
          ],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
    ];
    
    const result = calculateArtistStats(playHistory);
    
    expect(result).toHaveLength(2);
    expect(result[0].playCount).toBe(1);
    expect(result[1].playCount).toBe(1);
  });

  it('sorts artists by play count (descending)', () => {
    const playHistory: SpotifyApi.PlayHistoryObject[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Less Popular' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
      {
        played_at: '2024-01-01T11:00:00Z',
        track: {
          id: 'track2',
          name: 'Song 2',
          duration_ms: 180000,
          artists: [{ id: 'artist2', name: 'Most Popular' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
      {
        played_at: '2024-01-01T12:00:00Z',
        track: {
          id: 'track3',
          name: 'Song 3',
          duration_ms: 190000,
          artists: [{ id: 'artist2', name: 'Most Popular' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
    ];
    
    const result = calculateArtistStats(playHistory);
    
    expect(result[0].artist.name).toBe('Most Popular');
    expect(result[0].playCount).toBe(2);
    expect(result[1].artist.name).toBe('Less Popular');
    expect(result[1].playCount).toBe(1);
  });

  it('includes genres from artist details', () => {
    const playHistory: SpotifyApi.PlayHistoryObject[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
    ];
    
    const artistDetails = {
      artist1: {
        id: 'artist1',
        name: 'Artist 1',
        genres: ['rock', 'alternative', 'indie'],
      } as SpotifyApi.ArtistObjectFull,
    };
    
    const result = calculateArtistStats(playHistory, artistDetails);
    
    expect(result[0].genres).toEqual(['rock', 'alternative', 'indie']);
  });
});

describe('calculateGenreStats', () => {
  it('returns empty array for empty play history', () => {
    const result = calculateGenreStats([]);
    
    expect(result).toEqual([]);
  });

  it('returns empty array when artists have no genres', () => {
    const playHistory: SpotifyApi.PlayHistoryObject[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
    ];
    
    const result = calculateGenreStats(playHistory);
    
    expect(result).toEqual([]);
  });

  it('calculates stats for single genre', () => {
    const playHistory: SpotifyApi.PlayHistoryObject[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
    ];
    
    const artistDetails = {
      artist1: {
        id: 'artist1',
        name: 'Artist 1',
        genres: ['rock'],
      } as SpotifyApi.ArtistObjectFull,
    };
    
    const result = calculateGenreStats(playHistory, artistDetails);
    
    expect(result).toHaveLength(1);
    expect(result[0].genre).toBe('rock');
    expect(result[0].playCount).toBe(1);
    expect(result[0].uniqueTracks).toBe(1);
    expect(result[0].uniqueArtists).toBe(1);
    expect(result[0].totalDuration).toBe(200000);
  });

  it('aggregates multiple plays of same genre', () => {
    const playHistory: SpotifyApi.PlayHistoryObject[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
      {
        played_at: '2024-01-01T11:00:00Z',
        track: {
          id: 'track2',
          name: 'Song 2',
          duration_ms: 180000,
          artists: [{ id: 'artist2', name: 'Artist 2' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
    ];
    
    const artistDetails = {
      artist1: {
        id: 'artist1',
        name: 'Artist 1',
        genres: ['rock', 'indie'],
      } as SpotifyApi.ArtistObjectFull,
      artist2: {
        id: 'artist2',
        name: 'Artist 2',
        genres: ['rock'],
      } as SpotifyApi.ArtistObjectFull,
    };
    
    const result = calculateGenreStats(playHistory, artistDetails);
    
    const rockGenre = result.find(g => g.genre === 'rock');
    expect(rockGenre?.playCount).toBe(2);
    expect(rockGenre?.uniqueTracks).toBe(2);
    expect(rockGenre?.uniqueArtists).toBe(2);
    expect(rockGenre?.totalDuration).toBe(380000);
  });

  it('tracks multiple different genres', () => {
    const playHistory: SpotifyApi.PlayHistoryObject[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
    ];
    
    const artistDetails = {
      artist1: {
        id: 'artist1',
        name: 'Artist 1',
        genres: ['rock', 'pop', 'indie'],
      } as SpotifyApi.ArtistObjectFull,
    };
    
    const result = calculateGenreStats(playHistory, artistDetails);
    
    expect(result).toHaveLength(3);
    expect(result.map(g => g.genre)).toContain('rock');
    expect(result.map(g => g.genre)).toContain('pop');
    expect(result.map(g => g.genre)).toContain('indie');
  });

  it('sorts genres by play count (descending)', () => {
    const playHistory: SpotifyApi.PlayHistoryObject[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
      {
        played_at: '2024-01-01T11:00:00Z',
        track: {
          id: 'track2',
          name: 'Song 2',
          duration_ms: 180000,
          artists: [{ id: 'artist2', name: 'Artist 2' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
      {
        played_at: '2024-01-01T12:00:00Z',
        track: {
          id: 'track3',
          name: 'Song 3',
          duration_ms: 190000,
          artists: [{ id: 'artist2', name: 'Artist 2' }],
        } as SpotifyApi.TrackObjectFull,
      } as SpotifyApi.PlayHistoryObject,
    ];
    
    const artistDetails = {
      artist1: {
        id: 'artist1',
        name: 'Artist 1',
        genres: ['jazz'],
      } as SpotifyApi.ArtistObjectFull,
      artist2: {
        id: 'artist2',
        name: 'Artist 2',
        genres: ['pop'],
      } as SpotifyApi.ArtistObjectFull,
    };
    
    const result = calculateGenreStats(playHistory, artistDetails);
    
    expect(result[0].genre).toBe('pop');
    expect(result[0].playCount).toBe(2);
    expect(result[1].genre).toBe('jazz');
    expect(result[1].playCount).toBe(1);
  });
});

describe('calculateTopGenres', () => {
  it('returns empty array for empty artists array', () => {
    const result = calculateTopGenres([]);
    
    expect(result).toEqual([]);
  });

  it('returns empty array when artists have no genres', () => {
    const artists = [
      { id: 'artist1', name: 'Artist 1', genres: [] },
    ] as unknown as SpotifyApi.ArtistObjectFull[];
    
    const result = calculateTopGenres(artists);
    
    expect(result).toEqual([]);
  });

  it('counts genres across multiple artists', () => {
    const artists = [
      { id: 'artist1', name: 'Artist 1', genres: ['rock', 'indie'] },
      { id: 'artist2', name: 'Artist 2', genres: ['rock', 'alternative'] },
      { id: 'artist3', name: 'Artist 3', genres: ['pop'] },
    ] as unknown as SpotifyApi.ArtistObjectFull[];
    
    const result = calculateTopGenres(artists);
    
    expect(result).toHaveLength(4);
    const rockGenre = result.find(g => g.genre === 'rock');
    expect(rockGenre?.count).toBe(2);
  });

  it('sorts genres by count (descending)', () => {
    const artists = [
      { id: 'artist1', name: 'Artist 1', genres: ['rock'] },
      { id: 'artist2', name: 'Artist 2', genres: ['rock'] },
      { id: 'artist3', name: 'Artist 3', genres: ['rock', 'pop'] },
      { id: 'artist4', name: 'Artist 4', genres: ['jazz'] },
    ] as unknown as SpotifyApi.ArtistObjectFull[];
    
    const result = calculateTopGenres(artists);
    
    expect(result[0].genre).toBe('rock');
    expect(result[0].count).toBe(3);
    expect(result[1].genre).toBe('pop');
    expect(result[1].count).toBe(1);
    expect(result[2].genre).toBe('jazz');
    expect(result[2].count).toBe(1);
  });

  it('handles artists with undefined genres field', () => {
    const artists = [
      { id: 'artist1', name: 'Artist 1', genres: ['rock'] },
      { id: 'artist2', name: 'Artist 2', genres: undefined },
    ] as unknown as SpotifyApi.ArtistObjectFull[];
    
    const result = calculateTopGenres(artists);
    
    expect(result).toHaveLength(1);
    expect(result[0].genre).toBe('rock');
  });
});
