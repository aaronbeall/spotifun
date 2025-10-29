import { Headphones, Users, Music, Clock, Sparkles, Palette, Disc, Disc3, Disc2, TrendingUp, Star } from 'lucide-react';
import { Stats } from '@/types';
import { formatNumber, formatDuration, getGenreColorClass } from "@/utils";
import { analyzePopularity } from "@/utils/popularity";
import { useState, useMemo, HTMLProps } from "react";
import { MusicVibesBanner } from "./MusicVibesBanner";
import { motion } from "framer-motion";

interface GradientCardProps {
  icon: React.ComponentType<HTMLProps<unknown>>;
  className?: string;
  title: string;
  value: string | React.ReactNode;
  description: string;
  gradient: string;
  iconColor: string;
  items?: Array<{
    name: string;
    count: number;
    image?: string;
    bgClass?: string;
    textClass?: string;
  }>;
  badge?: {
    label: string;
    description: string;
    score: number;
  };
  score?: number;
  scoreLabel?: string;
  mostPlayed?: Array<{ name: string; count: number }>;
  children?: React.ReactNode;
}

const GradientCard = ({
  icon: Icon,
  title,
  value,
  description,
  gradient,
  iconColor,
  items = [],
  badge,
  score,
  scoreLabel = 'Score',
  mostPlayed = [],
  children
}: GradientCardProps) => {
  const [showAllPills, setShowAllPills] = useState(false);
  const displayedPills = useMemo(() =>
    showAllPills ? mostPlayed : mostPlayed.slice(0, 3),
  [showAllPills, mostPlayed]);
  const hasMorePills = mostPlayed.length > 3;
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 h-full ${gradient} shadow-lg`}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 bg-white -mr-6 -mt-6"></div>

      {/* Badge in upper right */}
      {badge && (
        <div className="absolute top-6 right-6 z-20">
          <div className="group relative">
            <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 cursor-help shadow-md">
              <Star className="w-3.5 h-3.5" fill="currentColor" />
              <span className="drop-shadow-sm">{badge.label}</span>
            </div>
            <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute top-full right-0 left-auto mt-2 w-64 bg-gray-900/95 backdrop-blur-sm text-white text-sm rounded-lg shadow-xl border border-white/10 p-3 pointer-events-none">
              <div className="flex items-center gap-2 font-semibold text-white mb-1.5">
                <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                {badge.label}
              </div>
              <p className="text-gray-300 text-xs mb-2 leading-snug">{badge.description}</p>
              <div className="flex items-center gap-2 text-xs text-gray-300 pt-2 border-t border-white/5">
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-1.5 rounded-full"
                    style={{ width: `${badge.score}%` }}
                  ></div>
                </div>
                <span className="whitespace-nowrap">{badge.score}/100</span>
              </div>
              <div className="absolute -top-1.5 right-4 left-auto w-3 h-3 bg-gray-900/95 border-t border-r border-white/10 transform -rotate-45"></div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 h-full flex flex-col">
        {/* Header with icon and title */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${iconColor}20` }}>
              <Icon className="w-5 h-5" style={{ color: iconColor }} />
            </div>
            <div>
              <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider">{title}</h3>
              <p className="text-2xl font-bold text-white mt-1">{value}</p>
              <p className="text-sm text-white/60">{description}</p>
            </div>
          </div>

          {/* Stacked items */}
          {items.length > 0 && (
            <div className="flex -space-x-2">
              {items.slice(0, 3).map((item, i) => {
                const bgClass = item.bgClass ? `${item.bgClass}` : 'bg-gray-800';
                const borderClass = 'border-gray-800';
                const textClass = item.textClass || '';

                return (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full border-2 overflow-hidden ${borderClass} group relative`}
                    style={{
                      zIndex: 3 - i,
                    }}
                    title={`${item.name} • ${item.count} plays`}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {item.name} • {item.count} plays
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                    </div>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center text-xs font-medium ${bgClass} ${textClass}`}
                      >
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                );
              })}
              {items.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-800/80 border-2 border-gray-800 flex items-center justify-center text-xs font-medium text-white/80">
                  +{items.length - 3}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Score/Progress */}
        {score !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/70">{scoreLabel}</span>
              <span className="font-medium" style={{ color: iconColor }}>{Math.round(score * 100)}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${score * 100}%`,
                  background: `linear-gradient(90deg, ${iconColor}, ${iconColor}cc)`
                }}
              />
            </div>
          </div>
        )}

        {/* Most Played/Popular Pills */}
        {mostPlayed.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-white/70 mb-2">
              {title === 'Popularity' ? 'Most Popular' : 'Most Played'}
            </p>
            <div className="flex flex-wrap gap-2">
              {displayedPills.map((item, i) => (
                <div
                  key={i}
                  className="px-2.5 py-1 text-xs font-medium rounded-full backdrop-blur-sm flex items-center gap-1 max-w-full"
                  style={{
                    backgroundColor: `${iconColor}15`,
                    color: iconColor,
                    border: `1px solid ${iconColor}30`
                  }}
                  title={`${item.name} • ${title === 'Popularity' ? `${item.count}%` : `${item.count} plays`}`}
                >
                  <span className="truncate max-w-[100px]">{item.name}</span>
                  <span className="flex-shrink-0">• {title === 'Popularity' ? `${item.count}%` : item.count}</span>
                </div>
              ))}
              {hasMorePills && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllPills(!showAllPills);
                  }}
                  className="px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 transition-all duration-200"
                  style={{
                    backgroundColor: `${iconColor}10`,
                    color: iconColor,
                    border: `1px solid ${iconColor}20`,
                  }}
                  whileHover={{
                    backgroundColor: `${iconColor}20`,
                    borderColor: `${iconColor}40`,
                    scale: 1.05
                  }}
                  whileTap={{ scale: 0.95 }}
                  title={showAllPills ? 'Show less' : `Show ${mostPlayed.length - 3} more`}
                >
                  {showAllPills ? (
                    <>
                      <span className="opacity-80">Show less</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                    </>
                  ) : (
                    <>
                      <span className="opacity-80">+{mostPlayed.length - 3} more</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        )}

        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
};

const ProgressStat = ({
  label,
  value,
  color
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div className="mt-4">
    <div className="flex justify-between text-xs text-white/80 mb-1">
      <span>{label}</span>
      <span className="font-medium">{Math.round(value * 100)}%</span>
    </div>
    <div className="w-full bg-white/20 rounded-full h-1.5">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${value * 100}%` }}
      />
    </div>
  </div>
);

const GenrePill = ({ genre, count }: { genre: string; count: number }) => {
  const gradientClass = `bg-gradient-to-r ${getGenreColorClass(genre, 'gradient')}`;

  return (
    <span
      className={`px-3 py-1.5 text-xs font-medium text-white rounded-full ${gradientClass}`}
    >
      {genre} • {count}
    </span>
  );
};

interface RecentlyPlayedProps {
  stats: Stats;
  isLoadingTimeRange: boolean;
}

export default function RecentlyPlayed({ stats, isLoadingTimeRange }: RecentlyPlayedProps) {
  // Calculate average plays per day (assuming 30 days for the time range)
  const avgPlaysPerDay = Math.round(stats.overview.totalPlays / 30);

  const popularity = analyzePopularity(stats.tracks.map(track => track.track));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700/50 overflow-hidden">
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-pink-500/10 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-blue-500/10 rounded-full filter blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <h2 className="px-2 py-1 bg-white/5 rounded-md text-xs text-white/60 border border-white/10 w-fit">
                    Recently Played
                  </h2>
                  <span className="px-2.5 py-1 bg-white/5 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                    <span className="font-medium text-white">{stats.overview.totalPlays}</span> plays
                  </span>
                  <span className="px-2.5 py-1 bg-white/5 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span className="font-medium text-white">{formatDuration(stats.overview.totalDuration)}</span>
                  </span>
                </div>
              </div>
              <div className="text-sm font-medium text-white/90 flex items-center gap-2">
                <div className="px-3 py-1.5 bg-white/5 rounded-full backdrop-blur-sm">
                  <span className="bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent font-semibold">
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Music Vibe Banner */}
        {stats.genres?.length > 0 && (
          <div className="mb-6">
            <MusicVibesBanner genreStats={stats.genres} />
          </div>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${isLoadingTimeRange ? 'opacity-50' : ''}`}>

          {/* Artist Card */}
          <GradientCard
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
                count: artist.playCount
              }))}
          />

          {/* Track Card */}
          <GradientCard
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
                count: track.playCount
              }))}
          />

          {/* Genre Card */}
          <GradientCard
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
                count: genre.playCount
              }))}
          />

          {/* Popularity Card */}
          <GradientCard
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
                label: `${track.popularity}%`
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
