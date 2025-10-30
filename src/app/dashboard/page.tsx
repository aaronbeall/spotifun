'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Music, Users, TrendingUp, Clock, Headphones, Star, LogOut, Settings, User } from 'lucide-react';
import { formatDuration, formatNumber, getGenreColorMap, getGenreColorClass } from '@/utils';
import Image from 'next/image';
import FunStats from '@/components/features/FunStats';
import TimeRangeToggle from '@/components/TimeRangeToggle';
import Achievements from '@/components/features/Achievements';
import Rankings from '@/components/features/Rankings';
import MusicProfile from '@/components/features/MusicProfile';

import { UserProfile, Stats, TimeRange } from '@/types';



export default function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingTimeRange, setIsLoadingTimeRange] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [playLimit, setPlayLimit] = useState<number>(50);
  const [showAllArtists, setShowAllArtists] = useState(false);
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const router = useRouter();

  // Constants for number of items to show
  const ARTISTS_TO_SHOW = 8;
  const TRACKS_TO_SHOW = 16;
  const GENRES_TO_SHOW = 12;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, statsResponse] = await Promise.all([
          fetch('/api/user'),
          fetch(`/api/stats?timeRange=medium_term&limit=${playLimit}`)
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
      const response = await fetch(`/api/stats?timeRange=${newTimeRange}&limit=${playLimit}`);
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

  // Format number and duration functions are now imported from @/utils

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
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Unable to load your data</h2>
          <p className="text-gray-300 mb-6">
            We couldn't load your Spotify data. Please try refreshing the page or return to the home page to sign in again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Refresh Page
            </button>
            <a
              href="/"
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-center"
            >
              Return Home
            </a>
          </div>
        </div>
      </div>
    );
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
        {/* Recently Played Stats */}
        <div className="mb-8">
          <MusicProfile
            stats={stats}
            isLoadingTimeRange={isLoadingTimeRange}
            playLimit={playLimit}
            onPlayLimitChange={async (newLimit) => {
              setPlayLimit(newLimit);
              setIsLoadingTimeRange(true);
              try {
                const response = await fetch(`/api/stats?timeRange=${timeRange}&limit=${newLimit}`);
                if (response.ok) {
                  const data = await response.json();
                  setStats(data);
                }
              } catch (error) {
                console.error('Error fetching stats with new limit:', error);
              } finally {
                setIsLoadingTimeRange(false);
              }
            }}
          />
        </div>

        {/* Top Artists */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Top Artists
            </h2>
            <TimeRangeToggle
              value={timeRange}
              onChange={handleTimeRangeChange}
              disabled={isLoadingTimeRange}
              isLoading={isLoadingTimeRange}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-4">
            {stats.topArtists.slice(0, showAllArtists ? stats.topArtists.length : ARTISTS_TO_SHOW).map((artist, index) => {
              const recentPlays = stats.artists.find(a => a.artist.id === artist.id)?.playCount || 0;
              const imageUrl = artist.images?.[0]?.url;

              return (
                <div
                  key={artist.id}
                  className="group relative h-48 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={artist.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                      <Music className="w-12 h-12 text-white opacity-70" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-white text-lg">{artist.name}</h3>
                        {recentPlays > 0 && (
                          <p className="text-sm text-gray-300">{recentPlays} recent plays</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowAllArtists(!showAllArtists)}
              className="text-sm text-gray-300 hover:text-white px-4 py-2 rounded-full border border-gray-600 hover:border-gray-400 transition-colors bg-gray-800/50 hover:bg-gray-700/50"
            >
              {showAllArtists ? 'Show Less' : `Show All ${stats.topArtists.length} Artists`}
            </button>
          </div>
        </div>

        {/* Top Tracks */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Top Tracks
            </h2>
            <TimeRangeToggle
              value={timeRange}
              onChange={handleTimeRangeChange}
              disabled={isLoadingTimeRange}
              isLoading={isLoadingTimeRange}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
            {stats.topTracks.slice(0, showAllTracks ? stats.topTracks.length : TRACKS_TO_SHOW).map((track, index) => {
              const trackStats = stats.tracks.find(t => t.track.id === track.id);
              const recentPlays = trackStats?.playCount || 0;
              const lastPlayed = trackStats?.lastPlayed ? new Date(trackStats.lastPlayed) : null;
              const daysAgo = lastPlayed ? Math.floor((Date.now() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24)) : null;
              const albumImage = track.album?.images?.[0]?.url;

              return (
                <div
                  key={track.id}
                  className="group relative h-32 rounded-xl overflow-hidden bg-gray-700/50 hover:bg-gray-700 transition-all duration-300"
                >
                  <div className="absolute inset-0 flex items-center p-4 gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-600 flex items-center justify-center">
                      {albumImage ? (
                        <img
                          src={albumImage}
                          alt={track.album.name}
                          className="w-full h-full object-cover rounded-lg shadow-md"
                        />
                      ) : (
                        <Music className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{track.name}</h3>
                      <p className="text-sm text-gray-300 truncate">
                        {track.artists.map(a => a.name).join(', ')}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {recentPlays > 0 && (
                          <span className="text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded-full">
                            {recentPlays} play{recentPlays !== 1 ? 's' : ''}
                          </span>
                        )}
                        {daysAgo !== null && (
                          <span className="text-xs bg-gray-700/80 text-gray-300 px-2 py-0.5 rounded-full">
                            {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowAllTracks(!showAllTracks)}
              className="text-sm text-gray-300 hover:text-white px-4 py-2 rounded-full border border-gray-600 hover:border-gray-400 transition-colors bg-gray-800/50 hover:bg-gray-700/50"
            >
              {showAllTracks ? 'Show Less' : `Show All ${stats.topTracks.length} Tracks`}
            </button>
          </div>
        </div>

        {/* Top Genres */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Top Genres
            </h2>
            <TimeRangeToggle
              value={timeRange}
              onChange={handleTimeRangeChange}
              disabled={isLoadingTimeRange}
              isLoading={isLoadingTimeRange}
              className="mr-2"
            />
          </div>

          {/* Genre Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
            {stats.topGenres.slice(0, showAllGenres ? stats.topGenres.length : GENRES_TO_SHOW).map(({ genre, count }) => {
              const colorClass = getGenreColorClass(genre, 'bg');
              const percentage = Math.round((count / stats.topGenres[0]?.count) * 100);

              return (
                <div
                  key={genre}
                  className="bg-gray-800/40 hover:bg-gray-800/80 border border-gray-700/50 rounded-lg p-4 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white capitalize">
                      {genre.replace(/-/g, ' ')}
                    </h3>
                    <span className="text-sm text-gray-300">
                      {count} {count === 1 ? 'artist' : 'artists'}
                    </span>
                  </div>

                  <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colorClass}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show More/Less Button */}
          {stats.topGenres.length > GENRES_TO_SHOW && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowAllGenres(!showAllGenres)}
                className="text-sm text-gray-300 hover:text-white px-4 py-2 rounded-full border border-gray-600 hover:border-gray-400 transition-colors bg-gray-800/50 hover:bg-gray-700/50"
              >
                {showAllGenres ? 'Show Less' : `Show All ${stats.topGenres.length} Genres`}
              </button>
            </div>
          )}
        </div>

        {/* Fun Stats */}
        <div className="mb-8">
          <FunStats stats={stats} />
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
