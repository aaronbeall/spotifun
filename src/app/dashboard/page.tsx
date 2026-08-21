'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { BarChart3, ChevronDown, Music, Users, TrendingUp, Clock, Headphones, Star, LogOut, Settings, User } from 'lucide-react';
import { formatDuration, formatNumber, getGenreColorMap, getGenreColorClass } from '@/utils';
import Image from 'next/image';
import FunStats from '@/components/features/FunStats';
import TimeRangeToggle from '@/components/TimeRangeToggle';
import Achievements from '@/components/features/Achievements';
import Rankings from '@/components/features/Rankings';
import MusicProfile from '@/components/features/MusicProfile';
import { SpotifyPlayOverlay } from '@/components/SpotifyPlayOverlay';
import { NowPlayingWidget } from '@/components/NowPlayingWidget';

import { UserProfile, Stats, TimeRange } from '@/types';

export default function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingTimeRange, setIsLoadingTimeRange] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
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

  const fetchAll = useCallback(async (range: TimeRange, limit: number) => {
    const [userResponse, statsResponse] = await Promise.all([
      fetch('/api/user'),
      fetch(`/api/stats?timeRange=${range}&limit=${limit}`)
    ]);

    if (userResponse.ok) {
      const userData = await userResponse.json();
      setUser(userData);
    }

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      setStats(statsData);
    }

    setLastFetched(new Date());
  }, []);

  useEffect(() => {
    fetchAll(timeRange, playLimit)
      .catch((error) => {
        console.error('Error fetching data:', error);
        router.push('/');
      })
      .finally(() => setIsInitialLoading(false));
    // Only run once on mount — timeRange/playLimit changes are handled by their own handlers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAll(timeRange, playLimit);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTimeRangeChange = async (newTimeRange: TimeRange) => {
    if (timeRange === newTimeRange) return;

    setTimeRange(newTimeRange);
    setIsLoadingTimeRange(true);

    try {
      const response = await fetch(`/api/stats?timeRange=${newTimeRange}&limit=${playLimit}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setLastFetched(new Date());
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingTimeRange(false);
    }
  };

  // Format number and duration functions are now imported from @/utils

  // Representative image per genre, pulled from a top artist tagged with that genre
  const genreImages = useMemo(() => {
    const map = new Map<string, string>();
    stats?.artists.forEach(({ artist }) => {
      const imageUrl = artist.images?.[0]?.url;
      if (!imageUrl) return;
      artist.genres?.forEach(genre => {
        if (!map.has(genre)) map.set(genre, imageUrl);
      });
    });
    return map;
  }, [stats]);

  // Ticks periodically just to force a re-render, so the "last fetched"
  // relative-time label (e.g. "5m ago") stays fresh without user interaction.
  const [, setClockTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setClockTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.png"
                  alt="Spotifun logo"
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
              <h1 className="text-2xl font-black italic lowercase tracking-tight text-violet-400">
                Spotifun
              </h1>
            </div>

            <div className="flex-1 flex justify-center min-w-0">
              <NowPlayingWidget />
            </div>

            <div className="flex items-center bg-gray-900/60 border border-gray-700/50 rounded-full p-1.5 shrink-0">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    className="flex items-center gap-2 rounded-full pr-2 py-0.5 hover:bg-gray-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                    aria-label="Account menu"
                  >
                    {user.images?.[0]?.url ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-green-500 shrink-0">
                        <Image
                          src={user.images[0].url}
                          alt={user.display_name || 'Profile'}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-900/30 border-2 border-green-500 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-green-400" />
                      </div>
                    )}
                    <span className="text-sm text-gray-200 hidden sm:inline">
                      {user.display_name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:inline" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="min-w-[180px] bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 z-50"
                  >
                    <div className="px-3 py-2 text-sm text-gray-300 border-b border-gray-700">
                      Welcome, {user.display_name}
                    </div>
                    <DropdownMenu.Item
                      onSelect={handleSettings}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer outline-none"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer outline-none"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
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
            lastFetched={lastFetched}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            onPlayLimitChange={async (newLimit) => {
              setPlayLimit(newLimit);
              setIsLoadingTimeRange(true);
              try {
                const response = await fetch(`/api/stats?timeRange=${timeRange}&limit=${newLimit}`);
                if (response.ok) {
                  const data = await response.json();
                  setStats(data);
                  setLastFetched(new Date());
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
                <a
                  key={artist.id}
                  href={artist.external_urls?.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${artist.name} on Spotify`}
                  className="group relative block h-48 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
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
                  <SpotifyPlayOverlay />
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
                </a>
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
                <a
                  key={track.id}
                  href={track.external_urls?.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${track.name} on Spotify`}
                  className="group relative block h-32 rounded-xl overflow-hidden bg-gray-700/50 hover:bg-gray-700 transition-all duration-300"
                >
                  <div className="absolute inset-0 flex items-center p-4 gap-4">
                    <div className="relative w-16 h-16 rounded-lg bg-gray-600 flex items-center justify-center overflow-hidden shrink-0">
                      {albumImage ? (
                        <img
                          src={albumImage}
                          alt={track.album.name}
                          className="w-full h-full object-cover rounded-lg shadow-md"
                        />
                      ) : (
                        <Music className="w-6 h-6 text-gray-400" />
                      )}
                      <SpotifyPlayOverlay size="sm" />
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
                </a>
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
              const imageUrl = genreImages.get(genre);

              return (
                <a
                  key={genre}
                  href={`https://open.spotify.com/search/${encodeURIComponent(genre)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${genre} on Spotify`}
                  className="bg-gray-800/40 hover:bg-gray-800/80 border border-gray-700/50 rounded-lg p-4 transition-colors group block"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={genre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music className="w-4 h-4 text-gray-400" />
                      )}
                      <SpotifyPlayOverlay size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white capitalize truncate">
                        {genre}
                      </h3>
                      <span className="text-xs text-gray-300">
                        {count} {count === 1 ? 'artist' : 'artists'}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colorClass}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </a>
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
