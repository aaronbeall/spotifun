import { describe, it, expect } from 'vitest';
import type { Artist, Play, Track } from '@/types/music';
import {
  calculateTrackStats,
  calculateArtistStats,
  calculateGenreStats,
  calculateTopGenres,
} from './listening';

describe('calculateTrackStats', () => {
  it('returns empty array for empty play history', () => {
    const result = calculateTrackStats([]);
    
    expect(result).toEqual([]);
  });

  it('calculates basic stats for single track', () => {
    const playHistory: Play[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Test Song',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Test Artist' }],
        } as Track,
      } as Play,
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
    const playHistory: Play[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Test Song',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Test Artist' }],
        } as Track,
      } as Play,
      {
        played_at: '2024-01-02T15:00:00Z',
        track: {
          id: 'track1',
          name: 'Test Song',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Test Artist' }],
        } as Track,
      } as Play,
      {
        played_at: '2024-01-01T12:00:00Z',
        track: {
          id: 'track1',
          name: 'Test Song',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Test Artist' }],
        } as Track,
      } as Play,
    ];
    
    const result = calculateTrackStats(playHistory);
    
    expect(result).toHaveLength(1);
    expect(result[0].playCount).toBe(3);
    expect(result[0].totalDuration).toBe(600000);
    expect(result[0].firstPlayed).toBe('2024-01-01T10:00:00Z');
    expect(result[0].lastPlayed).toBe('2024-01-02T15:00:00Z');
  });

  it('tracks multiple different tracks', () => {
    const playHistory: Play[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as Track,
      } as Play,
      {
        played_at: '2024-01-01T11:00:00Z',
        track: {
          id: 'track2',
          name: 'Song 2',
          duration_ms: 180000,
          artists: [{ id: 'artist2', name: 'Artist 2' }],
        } as Track,
      } as Play,
    ];
    
    const result = calculateTrackStats(playHistory);
    
    expect(result).toHaveLength(2);
    expect(result[0].playCount).toBe(1);
    expect(result[1].playCount).toBe(1);
  });

  it('sorts tracks by play count (descending)', () => {
    const playHistory: Play[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Less Popular',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as Track,
      } as Play,
      {
        played_at: '2024-01-01T11:00:00Z',
        track: {
          id: 'track2',
          name: 'Most Popular',
          duration_ms: 180000,
          artists: [{ id: 'artist2', name: 'Artist 2' }],
        } as Track,
      } as Play,
      {
        played_at: '2024-01-01T12:00:00Z',
        track: {
          id: 'track2',
          name: 'Most Popular',
          duration_ms: 180000,
          artists: [{ id: 'artist2', name: 'Artist 2' }],
        } as Track,
      } as Play,
      {
        played_at: '2024-01-01T13:00:00Z',
        track: {
          id: 'track2',
          name: 'Most Popular',
          duration_ms: 180000,
          artists: [{ id: 'artist2', name: 'Artist 2' }],
        } as Track,
      } as Play,
    ];
    
    const result = calculateTrackStats(playHistory);
    
    expect(result[0].track.name).toBe('Most Popular');
    expect(result[0].playCount).toBe(3);
    expect(result[1].track.name).toBe('Less Popular');
    expect(result[1].playCount).toBe(1);
  });

  it('includes artist details when provided', () => {
    const playHistory: Play[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Test Song',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Test Artist' }],
        } as Track,
      } as Play,
    ];
    
    const artistDetails = {
      artist1: {
        id: 'artist1',
        name: 'Test Artist',
        genres: ['rock', 'indie'],
        popularity: 75,
      } as Artist,
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
    const playHistory: Play[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as Track,
      } as Play,
    ];
    
    const result = calculateArtistStats(playHistory);
    
    expect(result).toHaveLength(1);
    expect(result[0].artist.id).toBe('artist1');
    expect(result[0].playCount).toBe(1);
    expect(result[0].uniqueTracks).toBe(1);
    expect(result[0].totalDuration).toBe(200000);
  });

  it('aggregates multiple plays of same artist', () => {
    const playHistory: Play[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as Track,
      } as Play,
      {
        played_at: '2024-01-01T11:00:00Z',
        track: {
          id: 'track2',
          name: 'Song 2',
          duration_ms: 180000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as Track,
      } as Play,
      {
        played_at: '2024-01-01T12:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as Track,
      } as Play,
    ];
    
    const result = calculateArtistStats(playHistory);
    
    expect(result).toHaveLength(1);
    expect(result[0].playCount).toBe(3);
    expect(result[0].uniqueTracks).toBe(2); // track1 and track2
    expect(result[0].totalDuration).toBe(580000);
  });

  it('handles tracks with multiple artists', () => {
    const playHistory: Play[] = [
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
        } as Track,
      } as Play,
    ];
    
    const result = calculateArtistStats(playHistory);
    
    expect(result).toHaveLength(2);
    expect(result[0].playCount).toBe(1);
    expect(result[1].playCount).toBe(1);
  });

  it('sorts artists by play count (descending)', () => {
    const playHistory: Play[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Less Popular' }],
        } as Track,
      } as Play,
      {
        played_at: '2024-01-01T11:00:00Z',
        track: {
          id: 'track2',
          name: 'Song 2',
          duration_ms: 180000,
          artists: [{ id: 'artist2', name: 'Most Popular' }],
        } as Track,
      } as Play,
      {
        played_at: '2024-01-01T12:00:00Z',
        track: {
          id: 'track3',
          name: 'Song 3',
          duration_ms: 190000,
          artists: [{ id: 'artist2', name: 'Most Popular' }],
        } as Track,
      } as Play,
    ];
    
    const result = calculateArtistStats(playHistory);
    
    expect(result[0].artist.name).toBe('Most Popular');
    expect(result[0].playCount).toBe(2);
    expect(result[1].artist.name).toBe('Less Popular');
    expect(result[1].playCount).toBe(1);
  });

  it('includes genres from artist details', () => {
    const playHistory: Play[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as Track,
      } as Play,
    ];
    
    const artistDetails = {
      artist1: {
        id: 'artist1',
        name: 'Artist 1',
        genres: ['rock', 'alternative', 'indie'],
      } as Artist,
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
    const playHistory: Play[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as Track,
      } as Play,
    ];
    
    const result = calculateGenreStats(playHistory);
    
    expect(result).toEqual([]);
  });

  it('calculates stats for single genre', () => {
    const playHistory: Play[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as Track,
      } as Play,
    ];
    
    const artistDetails = {
      artist1: {
        id: 'artist1',
        name: 'Artist 1',
        genres: ['rock'],
      } as Artist,
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
    const playHistory: Play[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as Track,
      } as Play,
      {
        played_at: '2024-01-01T11:00:00Z',
        track: {
          id: 'track2',
          name: 'Song 2',
          duration_ms: 180000,
          artists: [{ id: 'artist2', name: 'Artist 2' }],
        } as Track,
      } as Play,
    ];
    
    const artistDetails = {
      artist1: {
        id: 'artist1',
        name: 'Artist 1',
        genres: ['rock', 'indie'],
      } as Artist,
      artist2: {
        id: 'artist2',
        name: 'Artist 2',
        genres: ['rock'],
      } as Artist,
    };
    
    const result = calculateGenreStats(playHistory, artistDetails);
    
    const rockGenre = result.find(g => g.genre === 'rock');
    expect(rockGenre?.playCount).toBe(2);
    expect(rockGenre?.uniqueTracks).toBe(2);
    expect(rockGenre?.uniqueArtists).toBe(2);
    expect(rockGenre?.totalDuration).toBe(380000);
  });

  it('tracks multiple different genres', () => {
    const playHistory: Play[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as Track,
      } as Play,
    ];
    
    const artistDetails = {
      artist1: {
        id: 'artist1',
        name: 'Artist 1',
        genres: ['rock', 'pop', 'indie'],
      } as Artist,
    };
    
    const result = calculateGenreStats(playHistory, artistDetails);
    
    expect(result).toHaveLength(3);
    expect(result.map(g => g.genre)).toContain('rock');
    expect(result.map(g => g.genre)).toContain('pop');
    expect(result.map(g => g.genre)).toContain('indie');
  });

  it('sorts genres by play count (descending)', () => {
    const playHistory: Play[] = [
      {
        played_at: '2024-01-01T10:00:00Z',
        track: {
          id: 'track1',
          name: 'Song 1',
          duration_ms: 200000,
          artists: [{ id: 'artist1', name: 'Artist 1' }],
        } as Track,
      } as Play,
      {
        played_at: '2024-01-01T11:00:00Z',
        track: {
          id: 'track2',
          name: 'Song 2',
          duration_ms: 180000,
          artists: [{ id: 'artist2', name: 'Artist 2' }],
        } as Track,
      } as Play,
      {
        played_at: '2024-01-01T12:00:00Z',
        track: {
          id: 'track3',
          name: 'Song 3',
          duration_ms: 190000,
          artists: [{ id: 'artist2', name: 'Artist 2' }],
        } as Track,
      } as Play,
    ];
    
    const artistDetails = {
      artist1: {
        id: 'artist1',
        name: 'Artist 1',
        genres: ['jazz'],
      } as Artist,
      artist2: {
        id: 'artist2',
        name: 'Artist 2',
        genres: ['pop'],
      } as Artist,
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
    ] as unknown as Artist[];
    
    const result = calculateTopGenres(artists);
    
    expect(result).toEqual([]);
  });

  it('counts genres across multiple artists', () => {
    const artists = [
      { id: 'artist1', name: 'Artist 1', genres: ['rock', 'indie'] },
      { id: 'artist2', name: 'Artist 2', genres: ['rock', 'alternative'] },
      { id: 'artist3', name: 'Artist 3', genres: ['pop'] },
    ] as unknown as Artist[];
    
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
    ] as unknown as Artist[];
    
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
    ] as unknown as Artist[];
    
    const result = calculateTopGenres(artists);
    
    expect(result).toHaveLength(1);
    expect(result[0].genre).toBe('rock');
  });
});

describe('play-count weighting (Last.fm top lists)', () => {
  const artist = (name: string, extra: Partial<Artist> = {}): Artist => ({ id: name, name, images: [], genres: ['indie rock'], ...extra });
  const track = (id: string, artistName: string, extra: Partial<Track> = {}): Track => ({
    id,
    name: id,
    artists: [{ id: artistName, name: artistName }],
    album: { id: `${id}-album`, name: 'Album', images: [] },
    duration_ms: 200_000,
    ...extra,
  });

  it('weights top tracks by the listener’s play count', async () => {
    const { calculateTopTracksStats } = await import('./listening');
    const result = calculateTopTracksStats(
      [track('a', 'Mitski', { playcount: 30 }), track('b', 'Nujabes', { playcount: 10 })],
      { Mitski: artist('Mitski'), Nujabes: artist('Nujabes', { genres: ['jazz rap'] }) }
    );
    expect(result.totalWeight).toBe(40);
    expect(result.totalDuration).toBe(40 * 200_000);
    expect(result.artistStats.map(a => [a.artist.name, a.playCount])).toEqual([['Mitski', 30], ['Nujabes', 10]]);
    expect(result.genreStats.find(g => g.genre === 'indie rock')?.playCount).toBe(30);
  });

  it('counts each track once when there are no play counts (Loved Tracks)', async () => {
    const { calculateTopTracksStats } = await import('./listening');
    const result = calculateTopTracksStats([track('a', 'Mitski'), track('b', 'Mitski')], { Mitski: artist('Mitski') });
    expect(result.totalWeight).toBe(2);
  });

  it('weights top artists by their play count and estimates listening time', async () => {
    const { calculateTopArtistsStats } = await import('./listening');
    const result = calculateTopArtistsStats(
      [artist('Mitski', { playcount: 50 }), artist('Nujabes', { playcount: 5 })],
      [track('a', 'Mitski', { duration_ms: 180_000 })]
    );
    expect(result.totalWeight).toBe(55);
    expect(result.artistStats[0]).toMatchObject({ playCount: 50, totalDuration: 50 * 180_000 });
    // No known track length for Nujabes, so a typical 3.5 minutes stands in
    expect(result.artistStats[1].totalDuration).toBe(5 * 210_000);
  });
});
