import { Headphones, Users, Music, Clock, Sparkles, Palette, Disc, Disc3, Disc2, TrendingUp, Star, RefreshCw, CloudAlert, Heart, ChevronDown, ListMusic, Check, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Stats, TimeRange, DataMode, PlaylistSelection, PlaylistSummary, PlaylistsResponse, LIKED_SONGS_ID } from '@/types';
import { formatNumber, formatDuration, formatRelativeTime, getGenreColorClass, cn } from "@/utils";
import { analyzePopularity } from "@/utils/popularity";
import { WrappedMusicProfile } from "./WrappedMusicProfile";
import { StatCard } from './StatCard';
import { MetricInfo } from '../MetricInfo';
import { getMetricDescription } from '@/utils/metricDescriptions';

const DATA_MODES = [
  { id: 'recent' as const, label: 'Recently Played', icon: Clock },
  { id: 'topArtists' as const, label: 'Top Artists', icon: Users },
  { id: 'topTracks' as const, label: 'Top Tracks', icon: Music },
] as const;

const PLAY_LIMITS = [50, 25, 10, 5] as const;

// Time ranges for Top modes
const TOP_RANGES: { value: TimeRange; label: string }[] = [
  { value: 'short_term', label: '4 Weeks' },
  { value: 'medium_term', label: '6 Months' },
  { value: 'long_term', label: 'All Time' },
];

interface MusicProfileProps {
  stats: Stats;
  isLoadingTimeRange: boolean;
  playLimit: number;
  onPlayLimitChange: (limit: number) => void;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  dataMode: DataMode;
  onDataModeChange: (mode: DataMode) => void;
  selectedPlaylist: PlaylistSelection;
  onPlaylistSelect: (playlist: PlaylistSelection) => void;
  onPlaylistResolved: (playlist: PlaylistSelection) => void;
  likedSongsNeedsReconnect: boolean;
  onLikedSongsNeedsReconnect: (needsReconnect: boolean) => void;
  lastFetched: Date | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

function formatTrackCount(count: number): string {
  return count.toLocaleString('en-US');
}

function PlaylistMark({ playlist, className }: { playlist: PlaylistSelection; className: string }) {
  if (playlist.id === LIKED_SONGS_ID) return <Heart className={className} />;
  if (playlist.image) {
    return <img src={playlist.image} alt="" className={`${className} rounded-sm object-cover`} />;
  }
  return <ListMusic className={className} />;
}

function PlaylistMenuItem({
  playlist,
  selected,
  needsReconnect = false,
  hideCount = false,
  onSelect,
}: {
  playlist: PlaylistSummary;
  selected: boolean;
  needsReconnect?: boolean;
  hideCount?: boolean;
  onSelect: (playlist: PlaylistSelection) => void;
}) {
  return (
    <DropdownMenu.Item
      onSelect={() => {
        if (needsReconnect) {
          window.location.href = '/api/auth/spotify';
          return;
        }
        onSelect(playlist);
      }}
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white outline-none cursor-pointer"
    >
      <PlaylistMark playlist={playlist} className="w-4 h-4 shrink-0" />
      <span className="flex-1 truncate">{playlist.name}</span>
      {needsReconnect ? (
        <span className="text-[11px] text-amber-300/80">Reconnect</span>
      ) : hideCount ? null : (
        <span className="text-[11px] text-white/35">{formatTrackCount(playlist.trackCount)}</span>
      )}
      {selected && !needsReconnect && <Check className="w-3.5 h-3.5 text-pink-400 shrink-0" />}
    </DropdownMenu.Item>
  );
}

export default function MusicProfile({ 
  stats, 
  isLoadingTimeRange, 
  playLimit, 
  onPlayLimitChange, 
  timeRange,
  onTimeRangeChange,
  dataMode,
  onDataModeChange,
  selectedPlaylist,
  onPlaylistSelect,
  onPlaylistResolved,
  likedSongsNeedsReconnect,
  onLikedSongsNeedsReconnect,
  lastFetched, 
  isRefreshing, 
  onRefresh 
}: MusicProfileProps) {
  // The switcher can move to the requested source immediately. Card content stays
  // on the last loaded stats until the request finishes, so the section doesn't blank out.
  const displayedMode = stats.mode;
  const playlistSelected = dataMode === 'playlist';
  const isPlaylistMode = displayedMode === 'playlist';
  const isTopMode = displayedMode === 'topArtists' || displayedMode === 'topTracks';
  const sourceChanged = dataMode !== displayedMode
    || (dataMode === 'playlist' && selectedPlaylist.id !== stats.playlist?.id);
  const loadingLabel = !sourceChanged
    ? 'Updating'
    : dataMode === 'playlist'
    ? `Loading ${selectedPlaylist.name}`
    : dataMode === 'topArtists'
    ? 'Loading top artists'
    : dataMode === 'topTracks'
    ? 'Loading top tracks'
    : 'Loading recently played';
  const limitIndex = Math.max(0, PLAY_LIMITS.indexOf(playLimit as typeof PLAY_LIMITS[number]));
  const [playlistMenuOpen, setPlaylistMenuOpen] = useState(false);
  const [playlistMenu, setPlaylistMenu] = useState<{
    status: 'idle' | 'loading' | 'ready' | 'error';
    likedSongs: PlaylistSummary | null;
    playlists: PlaylistSummary[];
  }>({ status: 'idle', likedSongs: null, playlists: [] });

  const playlistCountLabel = useMemo(() => {
    const source = stats.playlist;
    if (!source) return 'Playlist';
    if (source.analyzed < source.total) {
      return `${formatTrackCount(source.analyzed)} of ${formatTrackCount(source.total)}`;
    }
    return `${formatTrackCount(source.analyzed)} ${source.analyzed === 1 ? 'track' : 'tracks'}`;
  }, [stats.playlist]);

  const loadPlaylists = async () => {
    if (playlistMenu.status === 'loading' || playlistMenu.status === 'ready') return;
    setPlaylistMenu(menu => ({ ...menu, status: 'loading' }));
    try {
      const response = await fetch('/api/playlists');
      if (!response.ok) throw new Error('Failed to load playlists');
      const data: PlaylistsResponse = await response.json();
      setPlaylistMenu({ status: 'ready', likedSongs: data.likedSongs, playlists: data.playlists });
      if (data.likedSongsNeedsReconnect) onLikedSongsNeedsReconnect(true);
      const match = data.playlists.find(playlist => playlist.id === selectedPlaylist.id)
        ?? (selectedPlaylist.id === LIKED_SONGS_ID ? data.likedSongs : null);
      if (match) onPlaylistResolved(match);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setPlaylistMenu(menu => ({ ...menu, status: 'error' }));
    }
  };
  
  // Calculate metrics and labels based on mode
  const { avgMetric, avgMetricLabel, uniquenessDescription, totalListeningLabel } = useMemo(() => {
    if (displayedMode === 'recent') {
      return {
        avgMetric: Math.round(stats.overview.totalPlays / 30),
        avgMetricLabel: 'plays per day',
        uniquenessDescription: `${Math.round((stats.overview.uniqueTracks / Math.max(stats.overview.totalPlays, 1)) * 100)}% unique`,
        totalListeningLabel: 'total listening'
      };
    }
    if (displayedMode === 'playlist') {
      return {
        avgMetric: null,
        avgMetricLabel: 'in this playlist',
        uniquenessDescription: `${stats.overview.uniqueTracks} tracks`,
        totalListeningLabel: 'in this playlist'
      };
    }
    return {
      avgMetric: null,
      avgMetricLabel: 'ranked by Spotify',
      uniquenessDescription: `${stats.overview.uniqueTracks} tracks`,
      totalListeningLabel: 'total duration'
    };
  }, [displayedMode, stats.overview]);

  const popularity = analyzePopularity(stats.tracks.map(track => track.track));

  // Representative image per genre, pulled from a top artist tagged with that genre
  const genreImages = useMemo(() => {
    const map = new Map<string, string>();
    stats.artists.forEach(({ artist }) => {
      const imageUrl = artist.images?.[0]?.url;
      if (!imageUrl) return;
      artist.genres?.forEach(genre => {
        if (!map.has(genre)) map.set(genre, imageUrl);
      });
    });
    return map;
  }, [stats.artists]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700/50 overflow-hidden">
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-pink-500/10 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-blue-500/10 rounded-full filter blur-3xl"></div>

          {/* Data nav */}
          <div className="relative z-10 -mx-6 -mt-6 mb-6 bg-black/20 rounded-t-2xl border-b border-white/5 p-4 flex flex-wrap items-center gap-3">
            <div className="relative inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1">
              {DATA_MODES.map(({ id, label, icon: Icon }) => {
                const isActive = dataMode === id;
                return (
                  <button
                    key={id}
                    onClick={() => onDataModeChange(id)}
                    disabled={isLoadingTimeRange}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors focus:outline-none disabled:opacity-50 ${
                      isActive ? 'text-white' : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute inset-0 -z-10 rounded-full bg-pink-500 shadow-md" />
                    )}
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                );
              })}
              <div className={`relative flex items-center rounded-full ${playlistSelected ? 'text-white' : 'text-white/50'}`}>
                {playlistSelected && (
                  <span className="absolute inset-0 -z-10 rounded-full bg-pink-500 shadow-md" />
                )}
                <button
                  onClick={() => onPlaylistSelect(selectedPlaylist)}
                  disabled={isLoadingTimeRange}
                  className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-l-full text-xs font-medium transition-colors focus:outline-none disabled:opacity-50 hover:text-white"
                >
                  <PlaylistMark playlist={selectedPlaylist} className="w-3.5 h-3.5 shrink-0" />
                  <span className="max-w-[9rem] truncate">{selectedPlaylist.name}</span>
                </button>
                <span className={`w-px h-3 ${playlistSelected ? 'bg-white/30' : 'bg-white/15'}`} />
                <DropdownMenu.Root
                  open={playlistMenuOpen}
                  onOpenChange={(open) => {
                    setPlaylistMenuOpen(open);
                    if (open) loadPlaylists();
                  }}
                >
                  <DropdownMenu.Trigger
                    disabled={isLoadingTimeRange}
                    aria-label="Choose a playlist"
                    className="flex items-center justify-center w-7 h-7 rounded-r-full focus:outline-none disabled:opacity-50 hover:text-white"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      align="start"
                      sideOffset={8}
                      className="z-50 w-72 max-h-80 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1"
                    >
                      <PlaylistMenuItem
                        playlist={playlistMenu.likedSongs ?? { id: LIKED_SONGS_ID, name: 'Liked Songs', trackCount: 0 }}
                        selected={selectedPlaylist.id === LIKED_SONGS_ID}
                        needsReconnect={likedSongsNeedsReconnect}
                        hideCount={playlistMenu.likedSongs == null && !likedSongsNeedsReconnect}
                        onSelect={onPlaylistSelect}
                      />
                      <DropdownMenu.Separator className="h-px bg-gray-700 my-1" />
                      {playlistMenu.status === 'loading' && (
                        <div className="px-3 py-2 text-xs text-white/40">Loading playlists…</div>
                      )}
                      {playlistMenu.status === 'error' && (
                        <div className="px-3 py-2 text-xs text-white/40">Could not load playlists</div>
                      )}
                      {playlistMenu.playlists.map(playlist => (
                        <PlaylistMenuItem
                          key={playlist.id}
                          playlist={playlist}
                          selected={selectedPlaylist.id === playlist.id}
                          onSelect={onPlaylistSelect}
                        />
                      ))}
                      {playlistMenu.status === 'ready' && playlistMenu.playlists.length === 0 && (
                        <div className="px-3 py-2 text-xs text-white/40">No playlists yet</div>
                      )}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            </div>

            {likedSongsNeedsReconnect && (
              <button
                type="button"
                onClick={() => { window.location.href = '/api/auth/spotify'; }}
                className="text-xs text-amber-300/80 hover:text-amber-200 transition-colors"
              >
                Reconnect Spotify to read Liked Songs
              </button>
            )}

            {isTopMode ? (
              <div className="inline-flex items-center gap-0.5 bg-white/[0.03] rounded-full p-0.5">
                {TOP_RANGES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => onTimeRangeChange(value)}
                    disabled={isLoadingTimeRange}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors disabled:opacity-50 ${
                      value === timeRange ? 'bg-white/10 text-white/70' : 'text-white/35 hover:text-white/60'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : isPlaylistMode ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/[0.03] text-[11px] font-medium text-white/50">
                {playlistCountLabel}
              </span>
            ) : (
              <div className="inline-flex items-center gap-0.5 bg-white/[0.03] rounded-full p-0.5">
                {PLAY_LIMITS.map((limit, i) => (
                  <button
                    key={limit}
                    onClick={() => onPlayLimitChange(limit)}
                    disabled={isLoadingTimeRange}
                    className={`w-6 h-6 rounded-full text-[11px] font-medium transition-colors disabled:opacity-50 ${
                      i === limitIndex ? 'bg-white/10 text-white/70' : 'text-white/35 hover:text-white/60'
                    }`}
                  >
                    {limit}
                  </button>
                ))}
              </div>
            )}

            <span className="flex items-center gap-1.5 text-xs text-white/40 shrink-0">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(stats.overview.totalDuration)} {totalListeningLabel}
            </span>

            <div className="flex items-center gap-3 ml-auto">
              {stats.lastFmUnavailableCount ? (
                <span
                  className="flex items-center gap-1.5 text-xs text-amber-400/60 cursor-help"
                  title={`Last.fm couldn't be reached for ${stats.lastFmUnavailableCount} artist${stats.lastFmUnavailableCount === 1 ? '' : 's'} (likely rate limited), so their genres are Spotify-only. Refresh in a minute to fill them in.`}
                >
                  <CloudAlert className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Genres partially enriched</span>
                </span>
              ) : null}

              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                aria-label="Refresh data"
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin')} />
                {lastFetched ? formatRelativeTime(lastFetched) : ''}
              </button>

              <div className="h-4 w-px bg-white/10" />

              <span className="text-xs text-white/40">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="relative" aria-busy={isLoadingTimeRange}>
          <div className={isLoadingTimeRange ? 'opacity-70 pointer-events-none select-none transition-opacity' : 'transition-opacity'}>
            <div className="mb-6">
              <WrappedMusicProfile
                stats={stats}
                isLoadingTimeRange={isLoadingTimeRange}
                playLimit={playLimit}
                onPlayLimitChange={onPlayLimitChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Artist Card */}
          <StatCard
            icon={Users}
            title="Artists"
            value={stats.overview.uniqueArtists}
            description={avgMetric == null ? avgMetricLabel : `${avgMetric} ${avgMetricLabel}`}
            gradient="bg-gradient-to-br from-purple-900/80 to-indigo-900/80"
            iconColor="#a78bfa"
            items={stats.artists
              .sort((a, b) => b.playCount - a.playCount)
              .map(artist => ({
                name: artist.artist.name,
                count: artist.playCount,
                image: artist.artist.images?.[0]?.url
              }))}
            score={stats.overview.artistDiversity}
            scoreLabel="Diversity"
            scoreMetricKey="artist-diversity"
            listLabel={isPlaylistMode ? 'In Playlist' : isTopMode ? 'Top' : undefined}
            showCounts={!isTopMode}
            countLabel={isPlaylistMode ? 'songs' : 'plays'}
            mostPlayed={stats.artists
              .sort((a, b) => b.playCount - a.playCount)
              .map(artist => ({
                name: artist.artist.name,
                count: artist.playCount,
                image: artist.artist.images?.[0]?.url,
                url: artist.artist.external_urls?.spotify
              }))}
          />

          {/* Track Card */}
          <StatCard
            icon={Music}
            title="Tracks"
            value={stats.overview.uniqueTracks}
            description={uniquenessDescription}
            gradient="bg-gradient-to-br from-amber-900/80 to-pink-900/80"
            iconColor="#f59e0b"
            items={stats.tracks
              .sort((a, b) => b.playCount - a.playCount)
              .map(track => ({
                name: track.track.name,
                count: track.playCount,
                image: track.track.album?.images?.[0]?.url
              }))}
            score={stats.overview.uniqueTracks / Math.max(stats.overview.totalPlays, 1)}
            scoreLabel="Uniqueness"
            scoreMetricKey="track-uniqueness"
            listLabel={isPlaylistMode ? 'In Playlist' : isTopMode ? 'Top' : undefined}
            showCounts={!isTopMode}
            countLabel={isPlaylistMode ? 'songs' : 'plays'}
            mostPlayed={stats.tracks
              .sort((a, b) => b.playCount - a.playCount)
              .map(track => ({
                name: track.track.name,
                count: track.playCount,
                image: track.track.album?.images?.[0]?.url,
                url: track.track.external_urls?.spotify
              }))}
          />

          {/* Genre Card */}
          <StatCard
            icon={Palette}
            title="Genres"
            value={stats.overview.uniqueGenres}
            description={
              <div className="space-y-0.5">
                <div>{Math.round(stats.overview.genreDiversity * 100)}% diverse</div>
                {stats.overview.genreCoverage !== undefined && (
                  <div className="flex items-center justify-center text-xs text-gray-400">
                    {Math.round(stats.overview.genreCoverage * 100)}% coverage
                    <MetricInfo description={getMetricDescription('genre-coverage')!} />
                  </div>
                )}
              </div>
            }
            gradient="bg-gradient-to-br from-blue-900/80 to-cyan-900/80"
            iconColor="#60a5fa"
            items={stats.genres
              .map((genre, i) => {
                const gradientClass = getGenreColorClass(genre.genre, "gradient");
                const textClass = 'text-white font-semibold';
                return {
                  name: genre.genre,
                  count: genre.playCount,
                  bgClass: `bg-gradient-to-r ${gradientClass}`,
                  textClass: textClass
                };
              })}
            score={stats.overview.genreDiversity}
            scoreLabel="Diversity"
            scoreMetricKey="genre-diversity"
            listLabel={isPlaylistMode ? 'In Playlist' : isTopMode ? 'Top' : undefined}
            showCounts={!isTopMode}
            countLabel={isPlaylistMode ? 'songs' : 'plays'}
            mostPlayed={stats.genres
              .map(genre => ({
                name: genre.genre,
                count: genre.playCount,
                image: genreImages.get(genre.genre),
                url: `https://open.spotify.com/search/${encodeURIComponent(genre.genre)}`
              }))}
          />

          {/* Popularity Card */}
          <StatCard
            icon={TrendingUp}
            title="Popularity"
            value={`${popularity.range[0]}-${popularity.range[1]}`}
            description={`Average ${stats.overview.averagePopularity}%`}
            gradient="bg-gradient-to-br from-emerald-900/80 to-teal-900/80"
            iconColor="#34d399"
            score={stats.overview.averagePopularity / 100}
            scoreLabel="Average Popularity"
            scoreMetricKey="average-popularity"
            badge={{
              label: popularity.label,
              description: popularity.description,
              score: popularity.diversityScore
            }}
            mostPlayed={stats.tracks
              .map(track => track.track)
              .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
              .map(track => ({
                name: track.name,
                count: track.popularity || 0,
                image: track.album?.images?.[0]?.url,
                url: track.external_urls?.spotify
              }))}
          />
            </div>
          </div>
          {isLoadingTimeRange && (
            <div className="absolute inset-x-0 top-4 z-20 flex justify-center pointer-events-none">
              <div
                role="status"
                className="flex items-center gap-2 rounded-full bg-gray-950/85 border border-white/15 px-4 py-2 text-sm text-white shadow-xl backdrop-blur-sm"
              >
                <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                {loadingLabel}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="flex items-center justify-between text-sm text-white/60">
            <div className="flex items-center gap-2">
              <Disc className="w-4 h-4 text-pink-400" />
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Powered by Spotify</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
