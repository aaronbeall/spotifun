'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Music, Trophy, Users, TrendingUp, Clock, Headphones, Star } from 'lucide-react';
import FunStats from '@/components/features/FunStats';
import MusicProfilePage from '@/components/features/MusicProfilePage';
import AchievementsPage from '@/components/features/AchievementsPage';
import RankingsPage from '@/components/features/RankingsPage';

interface User {
  id: string;
  display_name: string;
  images: Array<{ url: string }>;
}

interface Stats {
  overview: {
    totalPlays: number;
    uniqueArtists: number;
    uniqueTracks: number;
    totalDuration: number;
    averageSessionLength: number;
    genreDiversity: number;
    artistDiversity: number;
  };
  tracks: Array<{
    track: {
      name: string;
      artists: Array<{ name: string }>;
      album: { images: Array<{ url: string }> };
    };
    playCount: number;
  }>;
  artists: Array<{
    artist: {
      name: string;
      images: Array<{ url: string }>;
    };
    playCount: number;
  }>;
  genres: Array<{
    genre: string;
    playCount: number;
  }>;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('medium_term');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, statsResponse] = await Promise.all([
          fetch('/api/user'),
          fetch('/api/stats')
        ]);

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleTimeRangeChange = async (newTimeRange: 'short_term' | 'medium_term' | 'long_term') => {
    setTimeRange(newTimeRange);
    setLoading(true);
    
    try {
      const response = await fetch(`/api/stats?timeRange=${newTimeRange}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your music data...</p>
        </div>
      </div>
    );
  }

  if (!user || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load data</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Spotifun</h1>
                <p className="text-gray-600">Welcome back, {user.display_name}!</p>
              </div>
            </div>
            <div className="flex gap-2">
              {(['short_term', 'medium_term', 'long_term'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {range === 'short_term' ? '4 weeks' : range === 'medium_term' ? '6 months' : 'All time'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Headphones className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Plays</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.overview.totalPlays)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unique Artists</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.overview.uniqueArtists)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unique Tracks</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.overview.uniqueTracks)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Duration</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.overview.totalDuration)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Artists */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Top Artists
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.artists.slice(0, 6).map((artist, index) => (
              <div key={artist.artist.name} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  {artist.artist.images?.[0] ? (
                    <img 
                      src={artist.artist.images[0].url} 
                      alt={artist.artist.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <Music className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{artist.artist.name}</p>
                  <p className="text-sm text-gray-600">{formatNumber(artist.playCount)} plays</p>
                </div>
                <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tracks */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Top Tracks
          </h2>
          <div className="space-y-3">
            {stats.tracks.slice(0, 10).map((track, index) => (
              <div key={track.track.name} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  {track.track.album.images?.[0] ? (
                    <img 
                      src={track.track.album.images[0].url} 
                      alt={track.track.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <Music className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{track.track.name}</p>
                  <p className="text-sm text-gray-600">{track.track.artists.map(a => a.name).join(', ')}</p>
                </div>
                <div className="text-sm text-gray-600">{formatNumber(track.playCount)} plays</div>
                <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Genres */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            Top Genres
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.genres.slice(0, 9).map((genre, index) => (
              <div key={genre.genre} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900 capitalize">{genre.genre}</p>
                  <p className="text-sm text-gray-600">{formatNumber(genre.playCount)} plays</p>
                </div>
                <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Fun Stats */}
        <div className="mb-8">
          <FunStats stats={stats} />
        </div>

        {/* Music Profile */}
        <div className="mb-8">
          <MusicProfilePage stats={stats} />
        </div>

        {/* Achievements */}
        <div className="mb-8">
          <AchievementsPage stats={stats} />
        </div>

        {/* Rankings */}
        <div className="mb-8">
          <RankingsPage stats={stats} />
        </div>
      </div>
    </div>
  );
}
