import React, { useMemo } from "react";
import { Palette, Share2 } from 'lucide-react';
import { GenreStats } from '@/types';
import { calculateWeightedVACRSScore } from '@/utils/musicClassification';
import { VACRS_COLORS, VACRS_DIMENSIONS, VACRS_NAMES, VACRS_RANGE_LABELS } from '@/utils/vacrs';
import { SpectrumDimensionBars, getVACRSDiversity } from './SpectrumDimensionBars';
import { ThemedCardBackground } from '../ThemedCardBackground';
import { CARD_THEMES } from '@/utils/cardThemes';

export { getVACRSDiversity };

interface SpectrumCardProps {
  genreStats: GenreStats[];
  onShare?: () => void;
}


export const SpectrumCard: React.FC<SpectrumCardProps> = ({ genreStats, onShare }) => {
  const { diversityScore, values } = useMemo(() => getVACRSDiversity(genreStats), [genreStats]);

  // Two flanking stats alongside diversity: the trait your listening leans
  // hardest into, and the one spanning the widest min-to-max range across
  // your genres (least to most "energetic", "raw", etc., all in one genre mix).
  const { dominantTraitLabel, dominantTraitColor, widestRangeTraitLabel, widestRangeTraitColor } = useMemo(() => {
    const weighted = calculateWeightedVACRSScore(genreStats);
    const leanOf = (dim: typeof VACRS_DIMENSIONS[number]) => Math.abs(weighted[dim] - 0.5);
    const rangeOf = (dim: typeof VACRS_DIMENSIONS[number]) => {
      const scores = values[dim].map(v => v.score);
      return Math.max(...scores) - Math.min(...scores);
    };

    const dominantDim = VACRS_DIMENSIONS.reduce((best, dim) =>
      leanOf(dim) > leanOf(best) ? dim : best
    , VACRS_DIMENSIONS[0]);
    const widestDim = VACRS_DIMENSIONS.reduce((best, dim) =>
      rangeOf(dim) > rangeOf(best) ? dim : best
    , VACRS_DIMENSIONS[0]);

    return {
      dominantTraitLabel: VACRS_RANGE_LABELS[dominantDim][weighted[dominantDim] >= 0.5 ? 1 : 0],
      dominantTraitColor: VACRS_COLORS[dominantDim],
      widestRangeTraitLabel: VACRS_NAMES[widestDim],
      widestRangeTraitColor: VACRS_COLORS[widestDim],
    };
  }, [genreStats, values]);

  if (!genreStats?.length) return null;

  return (
    <ThemedCardBackground color={CARD_THEMES.spectrum} className="backdrop-blur-sm rounded-3xl p-6 border border-white/5 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold" style={{ color: CARD_THEMES.spectrum.light }}>Genre Spectrum</h2>
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

      {/* Headline stat, migrated from the old top-right badge, flanked by
          the trait your listening leans hardest into vs. barely at all */}
      <div className="flex items-center justify-center gap-8 sm:gap-16 mt-8">
        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold capitalize" style={{ color: dominantTraitColor }}>
            {dominantTraitLabel}
          </div>
          <div className="text-xs text-gray-400 mt-1">Dominant Trait</div>
        </div>

        <div className="text-center">
          <div className="text-4xl sm:text-5xl font-black text-blue-400">
            {diversityScore.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-400 mt-1">Genre Diversity</div>
        </div>

        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold" style={{ color: widestRangeTraitColor }}>
            {widestRangeTraitLabel}
          </div>
          <div className="text-xs text-gray-400 mt-1">Widest Range</div>
        </div>
      </div>
    </ThemedCardBackground>
  );
};
