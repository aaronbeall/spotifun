import { describe, it, expect } from 'vitest';
import {
  computePersonaInput,
  classifyPersona,
  personaToArtProfile,
  MUSIC_PERSONAS,
} from './musicPersonas';
import { Stats, TopTrackItem } from '@/types';

describe('computePersonaInput', () => {
  it('classifies high genre diversity correctly', () => {
    const stats: Stats = {
      overview: {
        genreDiversity: 0.7,
        averagePopularity: 60,
        artistDiversity: 0.3,
        totalPlays: 100,
        uniqueArtists: 20,
        uniqueTracks: 50,
        uniqueGenres: 15,
        totalDuration: 1000000,
        averageSessionLength: 10,
      },
      genres: [
        { genre: 'pop', playCount: 50, uniqueTracks: 20, uniqueArtists: 10, totalDuration: 500000 },
      ],
      topTracks: [
        {
          id: 'track1',
          name: 'Modern Song',
          album: { release_date: '2024-01-01' },
          recentPlays: 1,
        } as TopTrackItem,
      ],
      recentlyPlayed: [],
      tracks: [],
      artists: [],
      topArtists: [],
      topGenres: [],
      timeRange: 'medium_term',
      mode: 'recent',
    };
    
    const result = computePersonaInput(stats);
    
    expect(result.genreDiversity).toBe('high');
  });

  it('classifies low genre diversity correctly', () => {
    const stats: Stats = {
      overview: {
        genreDiversity: 0.3,
        averagePopularity: 60,
        artistDiversity: 0.3,
        totalPlays: 100,
        uniqueArtists: 20,
        uniqueTracks: 50,
        uniqueGenres: 15,
        totalDuration: 1000000,
        averageSessionLength: 10,
      },
      genres: [
        { genre: 'pop', playCount: 50, uniqueTracks: 20, uniqueArtists: 10, totalDuration: 500000 },
      ],
      topTracks: [
        {
          id: 'track1',
          name: 'Modern Song',
          album: { release_date: '2024-01-01' },
          recentPlays: 1,
        } as TopTrackItem,
      ],
      recentlyPlayed: [],
      tracks: [],
      artists: [],
      topArtists: [],
      topGenres: [],
      timeRange: 'medium_term',
      mode: 'recent',
    };
    
    const result = computePersonaInput(stats);
    
    expect(result.genreDiversity).toBe('low');
  });

  it('classifies high track popularity correctly', () => {
    const stats: Stats = {
      overview: {
        genreDiversity: 0.5,
        averagePopularity: 75,
        artistDiversity: 0.5,
        totalPlays: 100,
        uniqueArtists: 20,
        uniqueTracks: 50,
        uniqueGenres: 15,
        totalDuration: 1000000,
        averageSessionLength: 10,
      },
      genres: [
        { genre: 'pop', playCount: 50, uniqueTracks: 20, uniqueArtists: 10, totalDuration: 500000 },
      ],
      topTracks: [
        {
          id: 'track1',
          name: 'Modern Song',
          album: { release_date: '2024-01-01' },
          recentPlays: 1,
        } as TopTrackItem,
      ],
      recentlyPlayed: [],
      tracks: [],
      artists: [],
      topArtists: [],
      topGenres: [],
      timeRange: 'medium_term',
      mode: 'recent',
    };
    
    const result = computePersonaInput(stats);
    
    expect(result.trackPopularity).toBe('high');
  });

  it('classifies low track popularity correctly', () => {
    const stats: Stats = {
      overview: {
        genreDiversity: 0.5,
        averagePopularity: 35,
        artistDiversity: 0.5,
        totalPlays: 100,
        uniqueArtists: 20,
        uniqueTracks: 50,
        uniqueGenres: 15,
        totalDuration: 1000000,
        averageSessionLength: 10,
      },
      genres: [
        { genre: 'pop', playCount: 50, uniqueTracks: 20, uniqueArtists: 10, totalDuration: 500000 },
      ],
      topTracks: [
        {
          id: 'track1',
          name: 'Modern Song',
          album: { release_date: '2024-01-01' },
          recentPlays: 1,
        } as TopTrackItem,
      ],
      recentlyPlayed: [],
      tracks: [],
      artists: [],
      topArtists: [],
      topGenres: [],
      timeRange: 'medium_term',
      mode: 'recent',
    };
    
    const result = computePersonaInput(stats);
    
    expect(result.trackPopularity).toBe('low');
  });

  it('classifies high artist consistency (low diversity) correctly', () => {
    const stats: Stats = {
      overview: {
        genreDiversity: 0.5,
        averagePopularity: 50,
        artistDiversity: 0.3, // Low artist diversity = high consistency
        totalPlays: 100,
        uniqueArtists: 20,
        uniqueTracks: 50,
        uniqueGenres: 15,
        totalDuration: 1000000,
        averageSessionLength: 10,
      },
      genres: [
        { genre: 'pop', playCount: 50, uniqueTracks: 20, uniqueArtists: 10, totalDuration: 500000 },
      ],
      topTracks: [
        {
          id: 'track1',
          name: 'Modern Song',
          album: { release_date: '2024-01-01' },
          recentPlays: 1,
        } as TopTrackItem,
      ],
      recentlyPlayed: [],
      tracks: [],
      artists: [],
      topArtists: [],
      topGenres: [],
      timeRange: 'medium_term',
      mode: 'recent',
    };
    
    const result = computePersonaInput(stats);
    
    expect(result.artistConsistency).toBe('high');
  });

  it('classifies low artist consistency (high diversity) correctly', () => {
    const stats: Stats = {
      overview: {
        genreDiversity: 0.5,
        averagePopularity: 50,
        artistDiversity: 0.7, // High artist diversity = low consistency
        totalPlays: 100,
        uniqueArtists: 20,
        uniqueTracks: 50,
        uniqueGenres: 15,
        totalDuration: 1000000,
        averageSessionLength: 10,
      },
      genres: [
        { genre: 'pop', playCount: 50, uniqueTracks: 20, uniqueArtists: 10, totalDuration: 500000 },
      ],
      topTracks: [
        {
          id: 'track1',
          name: 'Modern Song',
          album: { release_date: '2024-01-01' },
          recentPlays: 1,
        } as TopTrackItem,
      ],
      recentlyPlayed: [],
      tracks: [],
      artists: [],
      topArtists: [],
      topGenres: [],
      timeRange: 'medium_term',
      mode: 'recent',
    };
    
    const result = computePersonaInput(stats);
    
    expect(result.artistConsistency).toBe('low');
  });

  it('classifies new era correctly (recent music)', () => {
    const currentYear = new Date().getFullYear();
    const stats: Stats = {
      overview: {
        genreDiversity: 0.5,
        averagePopularity: 50,
        artistDiversity: 0.5,
        totalPlays: 100,
        uniqueArtists: 20,
        uniqueTracks: 50,
        uniqueGenres: 15,
        totalDuration: 1000000,
        averageSessionLength: 10,
      },
      genres: [
        { genre: 'pop', playCount: 50, uniqueTracks: 20, uniqueArtists: 10, totalDuration: 500000 },
      ],
      topTracks: [
        {
          id: 'track1',
          name: 'Recent Song',
          album: { release_date: `${currentYear - 2}-01-01` }, // 2 years ago
          recentPlays: 1,
        } as TopTrackItem,
      ],
      recentlyPlayed: [],
      tracks: [],
      artists: [],
      topArtists: [],
      topGenres: [],
      timeRange: 'medium_term',
      mode: 'recent',
    };
    
    const result = computePersonaInput(stats);
    
    expect(result.era).toBe('new');
  });

  it('classifies old era correctly (older music)', () => {
    const currentYear = new Date().getFullYear();
    const stats: Stats = {
      overview: {
        genreDiversity: 0.5,
        averagePopularity: 50,
        artistDiversity: 0.5,
        totalPlays: 100,
        uniqueArtists: 20,
        uniqueTracks: 50,
        uniqueGenres: 15,
        totalDuration: 1000000,
        averageSessionLength: 10,
      },
      genres: [
        { genre: 'pop', playCount: 50, uniqueTracks: 20, uniqueArtists: 10, totalDuration: 500000 },
      ],
      topTracks: [
        {
          id: 'track1',
          name: 'Old Song',
          album: { release_date: `${currentYear - 10}-01-01` }, // 10 years ago
          recentPlays: 1,
        } as TopTrackItem,
      ],
      recentlyPlayed: [],
      tracks: [],
      artists: [],
      topArtists: [],
      topGenres: [],
      timeRange: 'medium_term',
      mode: 'recent',
    };
    
    const result = computePersonaInput(stats);
    
    expect(result.era).toBe('old');
  });

  it('handles tracks without release dates', () => {
    const stats: Stats = {
      overview: {
        genreDiversity: 0.5,
        averagePopularity: 50,
        artistDiversity: 0.5,
        totalPlays: 100,
        uniqueArtists: 20,
        uniqueTracks: 50,
        uniqueGenres: 15,
        totalDuration: 1000000,
        averageSessionLength: 10,
      },
      genres: [
        { genre: 'pop', playCount: 50, uniqueTracks: 20, uniqueArtists: 10, totalDuration: 500000 },
      ],
      topTracks: [
        {
          id: 'track1',
          name: 'Song',
          album: { release_date: undefined },
          recentPlays: 1,
        } as unknown as TopTrackItem,
      ],
      recentlyPlayed: [],
      tracks: [],
      artists: [],
      topArtists: [],
      topGenres: [],
      timeRange: 'medium_term',
      mode: 'recent',
    };
    
    const result = computePersonaInput(stats);
    
    // Should default to current year (new)
    expect(result.era).toBe('new');
  });

  it('classifies positive valence correctly', () => {
    const stats: Stats = {
      overview: {
        genreDiversity: 0.5,
        averagePopularity: 50,
        artistDiversity: 0.5,
        totalPlays: 100,
        uniqueArtists: 20,
        uniqueTracks: 50,
        uniqueGenres: 15,
        totalDuration: 1000000,
        averageSessionLength: 10,
      },
      genres: [
        { genre: 'pop', playCount: 90, uniqueTracks: 20, uniqueArtists: 10, totalDuration: 500000 },
        { genre: 'edm', playCount: 10, uniqueTracks: 5, uniqueArtists: 3, totalDuration: 100000 },
      ],
      topTracks: [
        {
          id: 'track1',
          name: 'Song',
          album: { release_date: '2024-01-01' },
          recentPlays: 1,
        } as TopTrackItem,
      ],
      recentlyPlayed: [],
      tracks: [],
      artists: [],
      topArtists: [],
      topGenres: [],
      timeRange: 'medium_term',
      mode: 'recent',
    };
    
    const result = computePersonaInput(stats);
    
    expect(result.valence).toBe('positive');
  });

  it('classifies negative valence correctly', () => {
    const stats: Stats = {
      overview: {
        genreDiversity: 0.5,
        averagePopularity: 50,
        artistDiversity: 0.5,
        totalPlays: 100,
        uniqueArtists: 20,
        uniqueTracks: 50,
        uniqueGenres: 15,
        totalDuration: 1000000,
        averageSessionLength: 10,
      },
      genres: [
        { genre: 'metal', playCount: 90, uniqueTracks: 20, uniqueArtists: 10, totalDuration: 500000 },
      ],
      topTracks: [
        {
          id: 'track1',
          name: 'Song',
          album: { release_date: '2024-01-01' },
          recentPlays: 1,
        } as TopTrackItem,
      ],
      recentlyPlayed: [],
      tracks: [],
      artists: [],
      topArtists: [],
      topGenres: [],
      timeRange: 'medium_term',
      mode: 'recent',
    };
    
    const result = computePersonaInput(stats);
    
    expect(result.valence).toBe('negative');
  });

  it('classifies energetic arousal correctly', () => {
    const stats: Stats = {
      overview: {
        genreDiversity: 0.5,
        averagePopularity: 50,
        artistDiversity: 0.5,
        totalPlays: 100,
        uniqueArtists: 20,
        uniqueTracks: 50,
        uniqueGenres: 15,
        totalDuration: 1000000,
        averageSessionLength: 10,
      },
      genres: [
        { genre: 'metal', playCount: 90, uniqueTracks: 20, uniqueArtists: 10, totalDuration: 500000 },
      ],
      topTracks: [
        {
          id: 'track1',
          name: 'Song',
          album: { release_date: '2024-01-01' },
          recentPlays: 1,
        } as TopTrackItem,
      ],
      recentlyPlayed: [],
      tracks: [],
      artists: [],
      topArtists: [],
      topGenres: [],
      timeRange: 'medium_term',
      mode: 'recent',
    };
    
    const result = computePersonaInput(stats);
    
    expect(result.arousal).toBe('energetic');
  });

  it('classifies calm arousal correctly', () => {
    const stats: Stats = {
      overview: {
        genreDiversity: 0.5,
        averagePopularity: 50,
        artistDiversity: 0.5,
        totalPlays: 100,
        uniqueArtists: 20,
        uniqueTracks: 50,
        uniqueGenres: 15,
        totalDuration: 1000000,
        averageSessionLength: 10,
      },
      genres: [
        { genre: 'ambient', playCount: 90, uniqueTracks: 20, uniqueArtists: 10, totalDuration: 500000 },
      ],
      topTracks: [
        {
          id: 'track1',
          name: 'Song',
          album: { release_date: '2024-01-01' },
          recentPlays: 1,
        } as TopTrackItem,
      ],
      recentlyPlayed: [],
      tracks: [],
      artists: [],
      topArtists: [],
      topGenres: [],
      timeRange: 'medium_term',
      mode: 'recent',
    };
    
    const result = computePersonaInput(stats);
    
    expect(result.arousal).toBe('calm');
  });
});

describe('classifyPersona', () => {
  it('always returns a valid persona from the table', () => {
    const input = {
      genreDiversity: 'high' as const,
      trackPopularity: 'high' as const,
      artistConsistency: 'high' as const,
      era: 'new' as const,
      valence: 'positive' as const,
      arousal: 'energetic' as const,
    };
    
    const result = classifyPersona(input);
    
    expect(result).toBeDefined();
    expect(result.name).toBeDefined();
    expect(result.description).toBeDefined();
    expect(result.color).toBeDefined();
  });

  it('returns consistent results for same input', () => {
    const input = {
      genreDiversity: 'low' as const,
      trackPopularity: 'low' as const,
      artistConsistency: 'low' as const,
      era: 'old' as const,
      valence: 'negative' as const,
      arousal: 'calm' as const,
    };
    
    const result1 = classifyPersona(input);
    const result2 = classifyPersona(input);
    
    expect(result1.id).toBe(result2.id);
    expect(result1.name).toBe(result2.name);
  });

  it('returns different personas for different inputs', () => {
    const input1 = {
      genreDiversity: 'high' as const,
      trackPopularity: 'high' as const,
      artistConsistency: 'high' as const,
      era: 'new' as const,
      valence: 'positive' as const,
      arousal: 'energetic' as const,
    };
    
    const input2 = {
      genreDiversity: 'low' as const,
      trackPopularity: 'low' as const,
      artistConsistency: 'low' as const,
      era: 'old' as const,
      valence: 'negative' as const,
      arousal: 'calm' as const,
    };
    
    const result1 = classifyPersona(input1);
    const result2 = classifyPersona(input2);
    
    expect(result1.id).not.toBe(result2.id);
  });

  it('validates that all personas have unique IDs', () => {
    const ids = MUSIC_PERSONAS.map(p => p.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('validates that the persona table is complete (64 personas)', () => {
    // 2^6 = 64 combinations
    expect(MUSIC_PERSONAS).toHaveLength(64);
  });
});

describe('personaToArtProfile', () => {
  it('maps positive valence to high value (0.85)', () => {
    const persona = MUSIC_PERSONAS.find(
      p => p.dimensions.valence === 'positive'
    )!;
    
    const result = personaToArtProfile(persona);
    
    expect(result.valence).toBe(0.85);
  });

  it('maps negative valence to low value (0.15)', () => {
    const persona = MUSIC_PERSONAS.find(
      p => p.dimensions.valence === 'negative'
    )!;
    
    const result = personaToArtProfile(persona);
    
    expect(result.valence).toBe(0.15);
  });

  it('maps energetic arousal to high value (0.85)', () => {
    const persona = MUSIC_PERSONAS.find(
      p => p.dimensions.arousal === 'energetic'
    )!;
    
    const result = personaToArtProfile(persona);
    
    expect(result.arousal).toBe(0.85);
  });

  it('maps calm arousal to low value (0.15)', () => {
    const persona = MUSIC_PERSONAS.find(
      p => p.dimensions.arousal === 'calm'
    )!;
    
    const result = personaToArtProfile(persona);
    
    expect(result.arousal).toBe(0.15);
  });

  it('maps high genre diversity to high complexity (0.85)', () => {
    const persona = MUSIC_PERSONAS.find(
      p => p.dimensions.genreDiversity === 'high'
    )!;
    
    const result = personaToArtProfile(persona);
    
    expect(result.complexity).toBe(0.85);
  });

  it('maps low genre diversity to low complexity (0.15)', () => {
    const persona = MUSIC_PERSONAS.find(
      p => p.dimensions.genreDiversity === 'low'
    )!;
    
    const result = personaToArtProfile(persona);
    
    expect(result.complexity).toBe(0.15);
  });

  it('maps low track popularity to high rawness (0.85)', () => {
    const persona = MUSIC_PERSONAS.find(
      p => p.dimensions.trackPopularity === 'low'
    )!;
    
    const result = personaToArtProfile(persona);
    
    expect(result.rawness).toBe(0.85);
  });

  it('maps high track popularity to low rawness (0.15)', () => {
    const persona = MUSIC_PERSONAS.find(
      p => p.dimensions.trackPopularity === 'high'
    )!;
    
    const result = personaToArtProfile(persona);
    
    expect(result.rawness).toBe(0.15);
  });

  it('maps low artist consistency to high social presence (0.85)', () => {
    const persona = MUSIC_PERSONAS.find(
      p => p.dimensions.artistConsistency === 'low'
    )!;
    
    const result = personaToArtProfile(persona);
    
    expect(result.socialPresence).toBe(0.85);
  });

  it('maps high artist consistency to low social presence (0.15)', () => {
    const persona = MUSIC_PERSONAS.find(
      p => p.dimensions.artistConsistency === 'high'
    )!;
    
    const result = personaToArtProfile(persona);
    
    expect(result.socialPresence).toBe(0.15);
  });

  it('produces consistent results for same persona', () => {
    const persona = MUSIC_PERSONAS[0];
    
    const result1 = personaToArtProfile(persona);
    const result2 = personaToArtProfile(persona);
    
    expect(result1).toEqual(result2);
  });
});
