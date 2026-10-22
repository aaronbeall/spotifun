'use client';

import { useState } from 'react';
import { Stats, DataMode, TimeRange } from '@/types';
import MusicProfile from '@/components/features/MusicProfile';

// Mock data for testing tooltips
const mockStats: Stats = {
  mode: 'recent' as DataMode,
  timeRange: 'short_term' as TimeRange,
  overview: {
    totalPlays: 50,
    uniqueArtists: 25,
    uniqueTracks: 40,
    uniqueGenres: 15,
    totalDuration: 7200000,
    averageSessionLength: 4.5,
    genreDiversity: 0.65,
    artistDiversity: 0.50,
    averagePopularity: 68,
  },
  genres: [
    { genre: 'indie rock', playCount: 15 },
    { genre: 'electronic', playCount: 12 },
    { genre: 'alternative', playCount: 10 },
    { genre: 'pop', playCount: 8 },
    { genre: 'hip hop', playCount: 5 },
  ],
  artists: [
    {
      artist: {
        id: '1',
        name: 'Test Artist 1',
        genres: ['indie rock', 'alternative'],
        popularity: 75,
        images: [{ url: 'https://via.placeholder.com/64', height: 64, width: 64 }],
        external_urls: { spotify: '#' },
        type: 'artist',
        uri: '',
        href: '',
        followers: { href: null, total: 10000 },
      },
      playCount: 12,
    },
    {
      artist: {
        id: '2',
        name: 'Test Artist 2',
        genres: ['electronic', 'pop'],
        popularity: 82,
        images: [{ url: 'https://via.placeholder.com/64', height: 64, width: 64 }],
        external_urls: { spotify: '#' },
        type: 'artist',
        uri: '',
        href: '',
        followers: { href: null, total: 20000 },
      },
      playCount: 10,
    },
    {
      artist: {
        id: '3',
        name: 'Test Artist 3',
        genres: ['hip hop'],
        popularity: 90,
        images: [{ url: 'https://via.placeholder.com/64', height: 64, width: 64 }],
        external_urls: { spotify: '#' },
        type: 'artist',
        uri: '',
        href: '',
        followers: { href: null, total: 50000 },
      },
      playCount: 8,
    },
  ],
  tracks: [
    {
      track: {
        id: '1',
        name: 'Test Track 1',
        popularity: 75,
        duration_ms: 180000,
        artists: [{ id: '1', name: 'Test Artist 1', type: 'artist', uri: '', href: '', external_urls: { spotify: '#' } }],
        album: {
          id: '1',
          name: 'Test Album 1',
          images: [{ url: 'https://via.placeholder.com/64', height: 64, width: 64 }],
          album_type: 'album',
          release_date: '2023',
          total_tracks: 10,
          type: 'album',
          uri: '',
          href: '',
          external_urls: { spotify: '#' },
          artists: [],
        },
        external_urls: { spotify: '#' },
        uri: '',
        href: '',
        type: 'track',
        explicit: false,
        is_local: false,
        track_number: 1,
        disc_number: 1,
        available_markets: [],
        external_ids: { isrc: '' },
        preview_url: null,
      },
      playCount: 8,
    },
    {
      track: {
        id: '2',
        name: 'Test Track 2',
        popularity: 82,
        duration_ms: 200000,
        artists: [{ id: '2', name: 'Test Artist 2', type: 'artist', uri: '', href: '', external_urls: { spotify: '#' } }],
        album: {
          id: '2',
          name: 'Test Album 2',
          images: [{ url: 'https://via.placeholder.com/64', height: 64, width: 64 }],
          album_type: 'album',
          release_date: '2024',
          total_tracks: 12,
          type: 'album',
          uri: '',
          href: '',
          external_urls: { spotify: '#' },
          artists: [],
        },
        external_urls: { spotify: '#' },
        uri: '',
        href: '',
        type: 'track',
        explicit: false,
        is_local: false,
        track_number: 1,
        disc_number: 1,
        available_markets: [],
        external_ids: { isrc: '' },
        preview_url: null,
      },
      playCount: 7,
    },
  ],
  recentlyPlayed: [],
  topTracks: [],
  topArtists: [],
  topGenres: [],
};

export default function TooltipTestPage() {
  const [dataMode, setDataMode] = useState<DataMode>('recent');
  const [timeRange, setTimeRange] = useState<TimeRange>('short_term');
  const [playLimit, setPlayLimit] = useState(50);
  const [isLoading, setIsLoading] = useState(false);

  const testStats = { ...mockStats, mode: dataMode, timeRange };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="container mx-auto p-4">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 mb-4">
          <h1 className="text-2xl font-bold text-white mb-2">Tooltip Test Page</h1>
          <p className="text-gray-400 text-sm mb-4">
            This page uses mock data to test tooltip positioning. Hover/click on info icons (ⓘ) to see tooltips.
            Test near card edges and inside stat tiles below the visualizations.
          </p>
          <div className="flex gap-4 text-white">
            <button
              onClick={() => setDataMode('recent')}
              className={`px-4 py-2 rounded ${dataMode === 'recent' ? 'bg-pink-500' : 'bg-white/10'}`}
            >
              Recent Mode
            </button>
            <button
              onClick={() => setDataMode('topTracks')}
              className={`px-4 py-2 rounded ${dataMode === 'topTracks' ? 'bg-pink-500' : 'bg-white/10'}`}
            >
              Top Tracks Mode
            </button>
            <button
              onClick={() => setDataMode('topArtists')}
              className={`px-4 py-2 rounded ${dataMode === 'topArtists' ? 'bg-pink-500' : 'bg-white/10'}`}
            >
              Top Artists Mode
            </button>
          </div>
        </div>

        <MusicProfile
          stats={testStats}
          dataMode={dataMode}
          timeRange={timeRange}
          playLimit={playLimit}
          isLoadingTimeRange={isLoading}
          isRefreshing={false}
          lastFetched={Date.now()}
          onDataModeChange={setDataMode}
          onTimeRangeChange={setTimeRange}
          onPlayLimitChange={setPlayLimit}
          onRefresh={() => {}}
        />
      </div>
    </div>
  );
}
