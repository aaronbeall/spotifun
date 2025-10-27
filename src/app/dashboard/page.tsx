'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Music, Users, TrendingUp, Clock, Headphones, Star, LogOut, Settings, User } from 'lucide-react';
import Image from 'next/image';
import FunStats from '@/components/features/FunStats';
import MusicProfile from '@/components/features/MusicProfile';
import Achievements from '@/components/features/Achievements';
import Rankings from '@/components/features/Rankings';

import { UserProfile, Stats, TimeRange } from '@/types';



export default function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingTimeRange, setIsLoadingTimeRange] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
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
        setIsInitialLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleTimeRangeChange = async (newTimeRange: TimeRange) => {
    if (timeRange === newTimeRange) return;

    setTimeRange(newTimeRange);
    setIsLoadingTimeRange(true);

    try {
      const response = await fetch(`/api/stats?timeRange=${newTimeRange}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingTimeRange(false);
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
    return num.toString();
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-8">
              <div className="h-8 bg-gray-700 rounded w-1/4"></div>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-700 rounded-md"></div>
                <div className="w-8 h-8 bg-gray-700 rounded-md"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const handleSettings = () => {
    // TODO: Navigate to settings page when available
    console.log('Settings clicked');
  };

  if (!user || !stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header - Always visible */}
      <div className="bg-gray-800 shadow-lg border-b border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user.images?.[0]?.url ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-green-500">
                  <Image
                    src={user.images[0].url}
                    alt={user.display_name || 'Profile'}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-green-900/30 border-2 border-green-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-green-400" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">Spotifun</h1>
                <p className="text-gray-300">Welcome back, {user.display_name}!</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                {isLoadingTimeRange && (
                  <div className="flex items-center gap-1 mr-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                    <span className="text-sm text-gray-400">Updating...</span>
                  </div>
                )}
                {(['short_term', 'medium_term', 'long_term'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => handleTimeRangeChange(range)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      timeRange === range
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }`}
                    disabled={isLoadingTimeRange}
                  >
                    {range === 'short_term' ? '4 weeks' : range === 'medium_term' ? '6 months' : 'All time'}
                  </button>
                ))}
              </div>

              <div className="h-6 w-px bg-gray-600"></div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSettings}
                  className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5 text-gray-300" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5 text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ${isLoadingTimeRange ? 'opacity-50' : ''}`}>
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Headphones className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Plays</p>
                <p className="text-2xl font-bold text-white">{formatNumber(stats.overview.totalPlays)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Unique Artists</p>
                <p className="text-2xl font-bold text-white">{formatNumber(stats.overview.uniqueArtists)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Unique Tracks</p>
                <p className="text-2xl font-bold text-white">{formatNumber(stats.overview.uniqueTracks)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Minutes Listened</p>
                <p className="text-2xl font-bold text-white">{formatDuration(stats.overview.totalDuration)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Artists */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Top Artists
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.topArtists.map((artist, index) => {
              const recentPlays = stats.artists.find(a => a.artist.id === artist.id)?.playCount || 0;

              return (
                <div key={artist.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {artist.images?.[0]?.url ? (
                      <img
                        src={artist.images[0].url}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{artist.name}</p>
                    {recentPlays > 0 && (
                      <p className="text-sm text-gray-400">{recentPlays} recent plays</p>
                    )}
                  </div>
                  <div className="text-lg font-bold text-gray-300">#{index + 1}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Tracks */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Top Tracks
          </h2>
          <div className="space-y-3">
            {stats.topTracks.map((track, index) => {
              const recentPlays = stats.tracks.find(t => t.track.id === track.id)?.playCount || 0;

              return (
                <div key={track.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {track.album.images?.[0]?.url ? (
                      <img
                        src={track.album.images[0].url}
                        alt={track.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{track.name}</p>
                    <p className="text-sm text-gray-400 truncate">{track.artists.map(a => a.name).join(', ')}</p>
                  </div>
                  {recentPlays > 0 && (
                    <div className="text-sm text-gray-400 whitespace-nowrap">{recentPlays} recent</div>
                  )}
                  <div className="text-lg font-bold text-gray-300">#{index + 1}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Genres */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Top Genres
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from(
              // Count genre occurrences from top artists
              stats.topArtists.flatMap(artist => artist.genres || [])
                .reduce((acc, genre) => {
                  acc.set(genre, (acc.get(genre) || 0) + 1);
                  return acc;
                }, new Map<string, number>())
                .entries()
            )
            .sort((a, b) => b[1] - a[1])
            .slice(0, 9)
            .map(([genre, count], index) => (
              <div 
                key={genre} 
                className="flex items-center justify-between p-4 rounded-lg border border-gray-700 bg-gray-700/50 hover:bg-gray-700/80 transition-colors duration-200"
              >
                <div>
                  <p className="font-medium text-white capitalize">{genre}</p>
                  <p className="text-sm text-gray-400">{count} {count === 1 ? 'artist' : 'artists'}</p>
                </div>
                <div className="text-lg font-bold text-gray-300">#{index + 1}</div>
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
          <MusicProfile stats={stats} />
        </div>

        {/* Achievements */}
        <div className="mb-8">
          <Achievements stats={stats} />
        </div>

        {/* Rankings */}
        <div className="mb-8">
          <Rankings stats={stats} />
        </div>
      </div>
    </div>
  );
}
