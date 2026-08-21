import { useState, useMemo, useRef, useEffect, HTMLProps } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Trophy, ChevronDown, ChevronUp, Palette, Users, Share2 } from 'lucide-react';
import { findBestMatchingVibe, getAllMusicVibes } from '@/utils/musicVibesAnalyzer';
import { calculateWeightedVACRSScore, calculateVACRSScoreMatch } from '@/utils/musicClassification';
import { GenreStats, MusicVibe } from '@/types';
import { VibeMatchList } from './VibeMatchList';
import { cn } from '@/utils';
import { ImageBadge } from '../ImageBadge';
import { ThemedCardBackground } from '../ThemedCardBackground';
import { darkenHex } from '@/utils/color';

// Lets the center badges (vibe + flanking top artist/genre) finish their own
// reveal sequence before the Other Vibe Matches section starts fading in.
const OTHER_VIBES_BASE_DELAY = 0.6;

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
              'flex items-center justify-center',
              'backdrop-blur-md border',
              'transition-all duration-300',
              isCurrent
                ? 'scale-110 px-3 py-1 min-w-[3rem] font-bold rounded-full'
                : 'scale-100 group-hover:scale-105 px-1.5 py-0.5 min-w-[2rem] font-medium rounded-full text-[10px]',
              isCurrent && textSize
            )}
            style={{
              background: isCurrent
                ? `linear-gradient(135deg, ${vibe.color.dark}e6, ${vibe.color.dark}99)`
                : `${vibe.color.dark}80`,
              borderColor: `${vibe.color.light}${isCurrent ? '50' : '1a'}`,
              color: isCurrent ? vibe.color.light : `${vibe.color.light}cc`,
              textShadow: isCurrent
                ? `0 0 10px ${vibe.color.light}90, 0 1px 2px rgba(0,0,0,0.5)`
                : undefined,
              boxShadow: isCurrent
                ? `0 2px 16px ${vibe.color.light}35, inset 0 1px 1px ${vibe.color.light}40`
                : undefined,
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
            size === 'sm' ? 'font-bold text-xs' : size === 'md' ? 'font-bold text-sm' : 'font-black text-4xl sm:text-5xl',
            'transition-opacity duration-300',
            isCurrent ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
          )}
          style={{ color: vibe.color.light }}
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
  onShare?: () => void;
}

export function MusicVibes({
  genreStats,
  topArtist,
  topGenre,
  className = '',
  onShare
}: MusicVibesProps) {
  const [showAllVibes, setShowAllVibes] = useState(false);
  const { vibe, matchPercentage } = useMemo(
    () => findBestMatchingVibe(genreStats),
    [genreStats]
  );

  // vibe.color.dark is tuned for the share card's full-bleed hero background
  // (a vivid accent, not an actual dark tone) — darken it further for the
  // live card so body text stays legible against it.
  const cardBackgroundColor = useMemo(
    () => ({ light: vibe.color.light, dark: darkenHex(vibe.color.dark, 0.55) }),
    [vibe.color]
  );

  // The Other Vibe Matches grid re-mounts every time showAllVibes toggles
  // back to false, but we only want its entrance delay on the very first
  // reveal (page/card load) — not every time the user presses "Show Less".
  const hasRevealedOtherVibes = useRef(false);
  useEffect(() => {
    hasRevealedOtherVibes.current = true;
  }, []);
  const otherVibesDelay = hasRevealedOtherVibes.current ? 0 : OTHER_VIBES_BASE_DELAY;

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
      <ThemedCardBackground color={cardBackgroundColor} className="backdrop-blur-sm rounded-3xl p-6 border border-white/5 shadow-2xl">
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

          {onShare && (
            <button
              onClick={onShare}
              aria-label="Share"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white transition-colors shrink-0 self-start"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Main Badge with Side Badges — a 1fr/auto/1fr grid keeps the Main
            Vibe badge exactly centered regardless of how the flanking
            badges' text truncates (both 1fr tracks are always equal width,
            regardless of content), while letting each side flex to use
            whatever space is available (grid items get min-width: 0 for
            free, so truncation "just works"). On md+, the badges sit toward
            the inner edge of their track (snug against the Main Vibe, not
            floating mid-track) via justify-self. Below md there's no room
            for three badges side by side, so it becomes a 2-column grid: the
            Main Vibe spans both columns on its own row, and the two badges
            sit side by side in the row below it. */}
        <div className="grid grid-cols-2 md:grid-cols-[1fr_auto_1fr] items-center justify-items-center gap-6 md:gap-8 mb-8">
          {/* Top Artist Badge (left) — always rendered (even when there's no
              top artist) so the Main Vibe badge doesn't shift when missing. */}
          <motion.div
            className="flex justify-center order-2 md:order-1 md:justify-self-end"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            {topArtist && (
              <ImageBadge
                {...topArtist}
                title="Top Artist"
                color="#a78bfa"
                icon={Users}
              />
            )}
          </motion.div>

          {/* Main Vibe Badge */}
          <motion.div
            className="relative z-10 order-1 md:order-2 col-span-2 md:col-span-1"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0 }}
          >
            <VibeBadge
              vibe={vibe}
              matchPercentage={matchPercentage}
              isCurrent
              size="lg"
            />
          </motion.div>

          {/* Top Genre Badge (right) */}
          <motion.div
            className="flex justify-center order-3 md:justify-self-start"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          >
            {topGenre && (
              <ImageBadge
                {...topGenre}
                title="Top Genre"
                color="#60a5fa"
                icon={Palette}
              />
            )}
          </motion.div>
        </div>

        {/* All Vibes Grid — reveals after the center badges so it doesn't compete for attention */}
        <div className="mt-12">
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: otherVibesDelay }}
          >
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
          </motion.div>

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
                    transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1], delay: otherVibesDelay + i * 0.04 }}
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
      </ThemedCardBackground>
    </div>
  );
}
