import { findBestMatchingVibe } from '@/utils/musicVibes';
import { GenreStats, VACRSScore } from '@/types';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface MusicVibesBannerProps {
  genreStats: GenreStats[];
  className?: string;
}

const VACRSBar = ({
  label,
  value,
  color
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div className="flex flex-col items-center h-8">
    <div className="w-1 h-full bg-gray-800 rounded-full overflow-hidden flex flex-col-reverse">
      <motion.div
        className="w-full rounded-full"
        initial={{ height: 0 }}
        animate={{ height: `${value * 100}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ backgroundColor: color }}
      />
    </div>
    <span className="text-[8px] text-gray-500 font-mono mt-0.5">{label.charAt(0)}</span>
  </div>
);

interface VACRSChartProps {
  score: VACRSScore;
  matchPercentage: number;
  color: {
    light: string;
    dark: string;
  };
}

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EC4899', // Pink
  '#8B5CF6', // Purple
];

function VACRSChart({ score, matchPercentage, color }: VACRSChartProps) {
  const scoreEntries = Object.entries(score);

  return (
    <div className="flex flex-col items-end">
      <motion.div
        className="text-sm font-medium mb-2"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25 }}
        style={{
          backgroundImage: `linear-gradient(45deg, ${color.light}, ${color.dark})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        {Math.round(matchPercentage)}% match
      </motion.div>

      <motion.div
        className="flex items-end space-x-1 h-8"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {scoreEntries.map(([key, value], index) => (
          <VACRSBar
            key={key}
            label={key}
            value={value}
            color={COLORS[index % COLORS.length]}
          />
        ))}
      </motion.div>
    </div>
  );
}

export function MusicVibesBanner({ genreStats, className = '' }: MusicVibesBannerProps) {
  const { vibe, matchPercentage, score } = useMemo(
    () => findBestMatchingVibe(genreStats),
    [genreStats]
  );

  if (!genreStats?.length) return null;

  const Icon = vibe.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-2xl p-6 border border-white/5 shadow-2xl overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, 
          ${vibe.color.dark}20 0%, 
          ${vibe.color.dark}30 50%, 
          ${vibe.color.light}15 100%)`
      }}
    >
      <div className="relative z-10">
        {/* Header with Micro Chart */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Icon className="w-6 h-6 mt-1" style={{ color: vibe.color.light }} />
            <div>
              <motion.h2
                className="text-xl font-bold bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(45deg, ${vibe.color.light}, ${vibe.color.dark})`,
                  lineHeight: 1.2
                }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {vibe.name}
              </motion.h2>
              <motion.p
                className="text-sm text-gray-400 mt-0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {vibe.description}
              </motion.p>
            </div>
          </div>

          <VACRSChart 
            score={score} 
            matchPercentage={matchPercentage} 
            color={vibe.color} 
          />
        </div>
      </div>
    </motion.div>
  );
}
