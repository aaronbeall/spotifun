import { Headphones, Users, Music, Clock, Sparkles, Palette, Disc, Disc3, Disc2, TrendingUp, Star, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Stats, TimeRange } from '@/types';
import { formatNumber, formatDuration, formatRelativeTime, getGenreColorClass, cn } from "@/utils";
import { analyzePopularity } from "@/utils/popularity";
import { WrappedMusicProfile } from "./WrappedMusicProfile";
import { StatCard } from './StatCard';

// Stubbed for now — switching data modes will require changes to the stats
// input feeding this card (recent plays vs. top artists vs. top tracks), so
// this only drives the tab's own selected state until that's wired up.
const DATA_MODES = [
  { id: 'recent', label: 'Recently Played', icon: Clock },
  { id: 'topArtists', label: 'Top Artists', icon: Users },
  { id: 'topTracks', label: 'Top Tracks', icon: Music },
] as const;
type DataMode = typeof DATA_MODES[number]['id'];

const PLAY_LIMITS = [50, 25, 10, 5] as const;

// "Top" modes come from Spotify's top-items endpoint, which is windowed by
// time_range rather than a result count — so the "how many" control swaps to
// these ranges instead of PLAY_LIMITS when a Top tab is selected. Stubbed
// (see DATA_MODES above): not yet wired to an actual API call.
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
  lastFetched: Date | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function MusicProfile({ stats, isLoadingTimeRange, playLimit, onPlayLimitChange, lastFetched, isRefreshing, onRefresh }: MusicProfileProps) {
  const [dataMode, setDataMode] = useState<DataMode>('recent');
  const [topRange, setTopRange] = useState<TimeRange>('medium_term');
  const isTopMode = dataMode !== 'recent';
  const limitIndex = Math.max(0, PLAY_LIMITS.indexOf(playLimit as typeof PLAY_LIMITS[number]));
  // Calculate average plays per day (assuming 30 days for the time range)
  const avgPlaysPerDay = Math.round(stats.overview.totalPlays / 30);

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

          {/* Data nav — flush with the card's edges (negative margins cancel
              the parent's p-6) so it reads as a distinct header strip rather
              than an inset panel floating inside the card. */}
          <div className="relative z-10 -mx-6 -mt-6 mb-6 bg-black/20 rounded-t-2xl border-b border-white/5 p-4 flex flex-wrap items-center gap-3">
            <div className="relative inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1">
              {DATA_MODES.map(({ id, label, icon: Icon }) => {
                const isActive = dataMode === id;
                return (
                  <button
                    key={id}
                    onClick={() => setDataMode(id)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors focus:outline-none ${
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
            </div>

            {/* Deliberately quieter than the Recent/Top mode selector above
                (no border, no bright active fill) — it's a secondary
                refinement of that choice, not a peer of it. */}
            {isTopMode ? (
              <div className="inline-flex items-center gap-0.5 bg-white/[0.03] rounded-full p-0.5">
                {TOP_RANGES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setTopRange(value)}
                    disabled={isLoadingTimeRange}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors disabled:opacity-50 ${
                      value === topRange ? 'bg-white/10 text-white/70' : 'text-white/35 hover:text-white/60'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
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
              {formatDuration(stats.overview.totalDuration)} total listening
            </span>

            <div className="flex items-center gap-3 ml-auto">
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

        {/* Wrapped Music Profile Sequence */}
        <div className="mb-6">
          <WrappedMusicProfile
            stats={stats}
            isLoadingTimeRange={isLoadingTimeRange}
            playLimit={playLimit}
            onPlayLimitChange={onPlayLimitChange}
          />
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${isLoadingTimeRange ? 'opacity-50' : ''}`}>

          {/* Artist Card */}
          <StatCard
            icon={Users}
            title="Artists"
            value={stats.overview.uniqueArtists}
            description={`${avgPlaysPerDay} plays per day`}
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
            description={`${Math.round((stats.overview.uniqueTracks / stats.overview.totalPlays) * 100)}% unique`}
            gradient="bg-gradient-to-br from-amber-900/80 to-pink-900/80"
            iconColor="#f59e0b"
            items={stats.tracks
              .sort((a, b) => b.playCount - a.playCount)
              .map(track => ({
                name: track.track.name,
                count: track.playCount,
                image: track.track.album?.images?.[0]?.url
              }))}
            score={stats.overview.uniqueTracks / stats.overview.totalPlays}
            scoreLabel="Uniqueness"
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
            description={`${Math.round(stats.overview.genreDiversity * 100)}% diverse`}
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
