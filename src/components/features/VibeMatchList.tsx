import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';
import { VACRSScore, MusicVibe, GenreStats } from "@/types";
import { calculateWeightedVACRSScore, calculateVACRSScoreMatch } from '@/utils/musicClassification';
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
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
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div
            className={cn(
              'p-1.5 rounded-lg flex-shrink-0',
              'transition-all duration-200',
              isCurrentVibe ? 'bg-opacity-20' : 'bg-opacity-10 group-hover:bg-opacity-15'
            )}
            style={{ backgroundColor: `${vibe.color.light}20` }}
          >
            <Icon
              className="w-5 h-5"
              style={{ color: vibe.color.light }}
            />
          </div>
          <div className="space-y-1">
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
                  Current Match
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: `${vibe.color.light}cc` }}>{vibe.description}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span
            className="text-lg font-bold"
            style={{ color: vibe.color.light }}
          >
            {Math.round(matchPercentage)}%
          </span>
          <div className="h-1.5 w-16 bg-gray-800/50 rounded-full overflow-hidden mt-1">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${matchPercentage}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: `linear-gradient(90deg, ${vibe.color.light}, ${vibe.color.dark})`
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2.5 flex-grow">
        {Object.entries(vibe.targetScore).map(([key, value], i) => {
          const currentValue = currentVibeScore[key as keyof VACRSScore];
          const dimensionName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' ');
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
