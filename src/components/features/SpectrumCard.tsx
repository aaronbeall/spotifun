import React, { useMemo } from "react";
import { Palette, Share2 } from 'lucide-react';
import { GenreStats } from '@/types';
import { SpectrumDimensionBars, getVACRSDiversity } from './SpectrumDimensionBars';

export { getVACRSDiversity };

interface SpectrumCardProps {
  genreStats: GenreStats[];
  onShare?: () => void;
}


export const SpectrumCard: React.FC<SpectrumCardProps> = ({ genreStats, onShare }) => {
  const { diversityScore } = useMemo(() => getVACRSDiversity(genreStats), [genreStats]);

  if (!genreStats?.length) return null;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border border-white/5 shadow-2xl overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Genre Spectrum</h2>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Diversity of your listening mapped by vibe dimensions
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

      <div>
        <SpectrumDimensionBars genreStats={genreStats} />
      </div>

      {/* Headline stat, migrated from the old top-right badge */}
      <div className="text-center mt-8">
        <div className="text-4xl sm:text-5xl font-black text-blue-400">
          {diversityScore.toFixed(0)}%
        </div>
        <div className="text-sm text-gray-400 mt-1">Genre Diversity</div>
      </div>
    </div>
  );
};
