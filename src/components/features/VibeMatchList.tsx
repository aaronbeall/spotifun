import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';
import { VACRSScore, MusicVibe, GenreStats } from "@/types";
import { calculateWeightedVACRSScore, calculateVACRSScoreMatch } from '@/utils/musicClassification';
import { capitalCase } from 'change-case';
import { getAllMusicVibes } from '@/utils/musicVibesAnalyzer';
import { GenreFilter } from './GenreFilter';
import { useState, useMemo } from "react";

export interface VibeMatchItemProps {
  vibe: MusicVibe;
  matchPercentage: number;
  currentVibeId: string;
  currentVibeScore: VACRSScore;
  isCurrentVibe: boolean;
  index: number;
}

export const VibeMatchItem = ({
  vibe,
  matchPercentage,
  currentVibeId,
  currentVibeScore,
  isCurrentVibe,
  index
}: VibeMatchItemProps) => {
  const Icon = vibe.icon;
  const COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EC4899', // Pink
    '#8B5CF6', // Purple
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.03
      }}
      className={cn(
        'h-full p-4 rounded-xl border transition-all duration-200 group flex flex-col',
        isCurrentVibe
          ? 'border-opacity-50 shadow-lg'
          : 'border-white/5 hover:border-white/10',
        'bg-gradient-to-br from-white/[0.01] to-white/[0.03]',
        'hover:shadow-md hover:shadow-black/10',
        'backdrop-blur-sm',
        'flex flex-col'
      )}
      style={{
        borderColor: isCurrentVibe ? `${vibe.color.light}40` : undefined,
        boxShadow: isCurrentVibe ? `0 0 0 1px ${vibe.color.light}40` : 'none',
      }}
    >
      {/* Percentage Badge - Top Right */}
      <div className="absolute top-3 right-3">
        <span
          className="text-xs font-bold px-2 py-1 rounded-md flex items-center justify-center"
          style={{
            backgroundColor: `${vibe.color.light}15`,
            color: vibe.color.light,
            border: `1px solid ${vibe.color.light}20`,
            backdropFilter: 'blur(4px)'
          }}
        >
          {Math.round(matchPercentage)}% Match
        </span>
      </div>

      <div className="flex items-start gap-4 pr-10">
        <div className="flex items-start space-x-4">
          <div className="relative flex-shrink-0">
            {/* Progress circle */}
            <svg className="w-10 h-10 -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="16"
                fill="none"
                stroke={`${vibe.color.light}20`}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="16"
                fill="none"
                stroke={vibe.color.light}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="100 100"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 100 - matchPercentage }}
                transition={{
                  duration: 1.2,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.1
                }}
              />
            </svg>
            {/* Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon
                className="w-4 h-4"
                style={{ color: vibe.color.light }}
              />
            </div>
          </div>

          <div className="space-y-1 pt-0.5">
            <div className="flex items-center gap-2">
              <h3 className="font-medium" style={{ color: vibe.color.light }}>{vibe.name}</h3>
              {isCurrentVibe && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: `${vibe.color.light}20`,
                    color: vibe.color.light
                  }}
                >
                  Current
                </span>
              )}
            </div>
            <p className="text-xs text-gray-300">{vibe.description}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2.5 flex-grow">
        {Object.entries(vibe.targetScore).map(([key, value], i) => {
          const currentValue = currentVibeScore[key as keyof VACRSScore];
          const dimensionName = capitalCase(key);
          const color = COLORS[i % COLORS.length];

          return (
            <div key={key} className="flex items-center gap-2 text-xs">
              <span className="w-24" style={{ color: `${vibe.color.light}cc` }}>{dimensionName}</span>
              <div className="relative flex-1 h-2.5 bg-gray-800/40 rounded-full overflow-hidden">
                {/* Target score bar */}
                <motion.div
                  className="absolute top-0 left-0 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${value * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + (i * 0.05), ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    backgroundColor: color,
                    opacity: 0.8
                  }}
                />

                {/* Current score indicator */}
                <div
                  className="absolute top-1/2 h-3 -translate-y-1/2 group"
                  style={{
                    left: `${currentValue * 100}%`,
                  }}
                >
                  <div
                    className="absolute top-0 w-0.5 h-3 -translate-x-1/2"
                    style={{
                      backgroundColor: 'white',
                      boxShadow: `0 0 8px 1px ${color}`,
                    }}
                  />
                  <div
                    className={cn(
                      'absolute top-full left-1/2 -translate-x-1/2 mt-1',
                      'text-[10px] text-white bg-gray-900/90 px-1.5 py-0.5 rounded',
                      'whitespace-nowrap opacity-0 group-hover:opacity-100',
                      'transition-opacity duration-200 pointer-events-none',
                      'border border-white/10'
                    )}
                  >
                    {Math.round(currentValue * 100)}%
                  </div>
                </div>
              </div>
              <span className="w-8 text-right text-xs font-mono" style={{ color: vibe.color.light }}>
                {Math.round(value * 100)}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

interface VibeMatchListProps {
  genreStats: GenreStats[];
  currentVibeId: string;
}

export const VibeMatchList = ({
  genreStats,
  currentVibeId
}: VibeMatchListProps) => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    genreStats.map(g => g.genre)
  );

  // Filter genre stats based on selected genres
  const filteredGenreStats = useMemo(() => {
    return genreStats.filter(stat => selectedGenres.includes(stat.genre));
  }, [genreStats, selectedGenres]);

  const currentVibeScore = useMemo(
    () => calculateWeightedVACRSScore(filteredGenreStats),
    [filteredGenreStats]
  );

  // Recalculate vibes with scores based on filtered genres
  const vibesWithScores = useMemo(() => {
    if (!filteredGenreStats.length) return [];

    const userScore = calculateWeightedVACRSScore(filteredGenreStats);
    return getAllMusicVibes().map(vibe => ({
      vibe,
      score: userScore,
      matchPercentage: calculateVACRSScoreMatch(userScore, vibe.targetScore),
    })).sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [filteredGenreStats]);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };
  return (
    <div className="mt-4">
      <GenreFilter
        genreStats={genreStats}
        selectedGenres={selectedGenres}
        onGenreToggle={handleGenreToggle}
      />

      <AnimatePresence mode="wait">
        {filteredGenreStats.length > 0 ? (
          <motion.div
            key="vibes"
            className="max-h-[calc(100vh-400px)] overflow-y-auto pr-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vibesWithScores.map((item, index) => (
                <VibeMatchItem
                  key={item.vibe.id}
                  vibe={item.vibe}
                  matchPercentage={item.matchPercentage}
                  currentVibeId={currentVibeId}
                  currentVibeScore={currentVibeScore}
                  isCurrentVibe={item.vibe.id === currentVibeId}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="no-results"
            className="text-center py-8 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            No genres selected. Select at least one genre to see matching vibes.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
