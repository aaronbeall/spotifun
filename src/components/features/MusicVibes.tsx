import { useState, useMemo, HTMLProps } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Trophy, Zap, ChevronDown, ChevronUp, Palette, Users } from 'lucide-react';
import { findBestMatchingVibe, getAllMusicVibes } from '@/utils/musicVibesAnalyzer';
import { calculateWeightedVACRSScore, calculateVACRSScoreMatch } from '@/utils/musicClassification';
import { GenreStats, MusicVibe } from '@/types';
import { VibeMatchList } from './VibeMatchList';
import { cn } from '@/utils';
import { ImageBadge } from '../ImageBadge';

interface VibeBadgeProps {
  vibe: MusicVibe;
  matchPercentage: number;
  isCurrent?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const VibeBadge = ({
  vibe,
  matchPercentage,
  isCurrent = false,
  className = '',
  size = 'md'
}: VibeBadgeProps) => {
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-52 h-52',
  };

  const artSizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
  }[size];

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  const viewBox = '0 0 100 100';
  const radius = 40; // Reduced to prevent clipping
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (matchPercentage / 100) * circumference;
  const percentage = Math.round(matchPercentage);

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center group',
        'transform transition-all duration-300',
        'hover:scale-105',
        className
      )}
    >
      {/* Badge container */}
      <div className={cn(
        'relative',
        sizeClasses[size]
      )}>
        {/* Background glow */}
        <div
          className={cn(
            'absolute inset-0 rounded-full opacity-0 transition-opacity duration-300',
            isCurrent ? 'opacity-70' : 'group-hover:opacity-40'
          )}
          style={{
            background: `radial-gradient(circle at center, ${vibe.color.light} 0%, transparent 70%)`,
            filter: 'blur(8px)'
          }}
        />

        {/* Badge background */}
        <div
          className={cn(
            'relative rounded-full flex items-center justify-center',
            'bg-gradient-to-br from-gray-900 to-gray-800',
            'border border-white/10',
            'shadow-2xl overflow-visible',
            'w-full h-full',
            'transition-all duration-300',
            'ring-1 ring-white/5',
            isCurrent ? 'ring-2' : ''
          )}
          style={{
            background: `radial-gradient(circle at 30% 30%, ${vibe.color.light}05, transparent 70%),
                       radial-gradient(circle at 70% 70%, ${vibe.color.dark}05, transparent 70%),
                       linear-gradient(to bottom right, rgba(17, 24, 39, 0.98), rgba(31, 41, 55, 0.98))`,
            boxShadow: `0 4px 24px ${vibe.color.light}10, 
                       inset 0 1px 1px ${vibe.color.light}20`
          }}
        >
          {/* Progress ring */}
          <svg
            viewBox={viewBox}
            className="absolute w-full h-full transform -rotate-90"
            style={{
              filter: `drop-shadow(0 0 6px ${vibe.color.light}30)`,
              transformOrigin: 'center',
            }}
          >
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={`${vibe.color.light}15`}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${circumference} ${circumference}`}
            />

            {/* Progress track */}
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={vibe.color.light}
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 1000' }}
              animate={{
                strokeDasharray: `${circumference} ${circumference}`,
                strokeDashoffset: strokeDashoffset,
              }}
              transition={{
                delay: 0.2,
                duration: 1.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                filter: `drop-shadow(0 0 4px ${vibe.color.light}60)`
              }}
            />
          </svg>

          {/* Vibe emblem */}
          <div
            className={cn(
              'relative flex items-center justify-center rounded-full overflow-hidden',
              'transition-all duration-500 transform',
              isCurrent ? 'opacity-100 scale-100' : 'opacity-90 group-hover:opacity-100 group-hover:scale-105',
              artSizeClasses
            )}
            style={{
              filter: `drop-shadow(0 0 8px ${vibe.color.light}40)`,
            }}
          >
            {vibe.image && (
              <img
                src={vibe.image}
                alt={vibe.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            )}
          </div>

          {/* Percentage badge */}
          <div
            className={cn(
              'absolute -bottom-1 left-1/2 -translate-x-1/2',
              'px-3 py-1 rounded-full',
              'flex items-center justify-center',
              'backdrop-blur-md border',
              'transition-all duration-300',
              isCurrent ? 'scale-110' : 'scale-100 group-hover:scale-110',
              'min-w-[3rem]',
              'font-bold',
              textSize
            )}
            style={{
              backgroundColor: `${vibe.color.dark}80`,
              borderColor: `${vibe.color.light}30`,
              color: 'white',
              textShadow: `0 1px 2px rgba(0,0,0,0.3)`,
              boxShadow: `0 2px 12px ${vibe.color.light}20, 
                         inset 0 1px 1px ${vibe.color.light}30`,
            }}
          >
            {percentage}%
          </div>
        </div>
      </div>

      {/* Vibe name */}
      <div className="mt-4 text-center">
        <h3
          className={cn(
            'font-bold',
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base',
            'transition-colors duration-300',
            isCurrent ? 'text-white' : 'text-gray-300 group-hover:text-white'
          )}
          style={{ color: isCurrent ? vibe.color.light : 'inherit' }}
        >
          {vibe.name}
        </h3>
        {isCurrent && (
          <p className="mt-0.5 text-xs text-gray-400/80 max-w-[220px] mx-auto leading-snug">
            {vibe.description}
          </p>
        )}
        {isCurrent && (
          <div className="mt-2 px-2 py-0.5 bg-white/5 rounded-full text-xs text-white/80 inline-block">
            Current Vibe
          </div>
        )}
      </div>
    </div>
  );
};


interface MusicVibesProps {
  genreStats: GenreStats[];
  topArtist?: { name: string; image?: string; count: number };
  topGenre?: { name: string; image?: string; count: number };
  className?: string;
}

export function MusicVibes({
  genreStats,
  topArtist,
  topGenre,
  className = ''
}: MusicVibesProps) {
  const [showAllVibes, setShowAllVibes] = useState(false);
  const { vibe, matchPercentage } = useMemo(
    () => findBestMatchingVibe(genreStats),
    [genreStats]
  );

  // Get all music vibes with calculated match percentages
  const allVibes = useMemo(() => {
    if (!genreStats?.length) return [];

    const userScore = calculateWeightedVACRSScore(genreStats);
    const vibes = getAllMusicVibes().map(vibe => ({
      ...vibe,
      matchPercentage: calculateVACRSScoreMatch(userScore, vibe.targetScore)
    })).sort((a, b) => b.matchPercentage - a.matchPercentage);

    return vibes;
  }, [genreStats]);

  // Filter out genres with zero play counts
  const filteredGenreStats = useMemo(() => {
    return genreStats.filter(stat => stat.playCount > 0);
  }, [genreStats]);
  if (!genreStats?.length) return null;

  return (
    <div className={cn('w-full', className)}>
      <div className="bg-gradient-to-br from-gray-900 to-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border border-white/5 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6" style={{ color: vibe.color.light }} />
              <h2 className="text-2xl font-bold text-white">Your Current Vibe</h2>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Based on your recent listening history and genre preferences
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/5">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">
              {Math.round(matchPercentage)}% Match
            </span>
          </div>
        </div>

        {/* Main Badge with Side Badges */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center gap-16">
            {/* Top Artist Badge */}
            {topArtist && (
              <ImageBadge
                {...topArtist}
                title="Top Artist"
                color="#a78bfa"
                icon={Users}
              />
            )}

            {/* Main Vibe Badge */}
            <div className="relative z-10">
              <VibeBadge
                vibe={vibe}
                matchPercentage={matchPercentage}
                isCurrent
                size="lg"
              />
            </div>

            {/* Top Genre Badge */}
            {topGenre && (
              <ImageBadge
                {...topGenre}
                title="Top Genre"
                color="#60a5fa"
                icon={Palette}
              />
            )}
          </div>
        </div>

        {/* All Vibes Grid */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Other Vibe Matches
            </h3>
            <button
              onClick={() => setShowAllVibes(!showAllVibes)}
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/5"
            >
              {showAllVibes ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp size={16} />
                </>
              ) : (
                <>
                  <span>Show All</span>
                  <ChevronDown size={16} />
                </>
              )}
            </button>
          </div>

            {showAllVibes ? (
              <VibeMatchList
                  genreStats={filteredGenreStats}
                  currentVibeId={vibe.id}
                />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {allVibes.slice(0, 5).map((v, i) => (
                  <motion.div
                    key={v.id}
                    className="group"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
                  >
                    <VibeBadge
                      vibe={v}
                      matchPercentage={v.matchPercentage || 0}
                      size="md"
                      className="mx-auto"
                    />
                  </motion.div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
