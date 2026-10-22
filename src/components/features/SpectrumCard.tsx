import React, { useMemo } from "react";
import { Palette, Share2 } from 'lucide-react';
import { GenreStats, Stats, DataMode } from '@/types';
import { calculateWeightedVACRSScore } from '@/utils/musicClassification';
import { VACRS_COLORS, VACRS_DIMENSIONS, VACRS_RANGE_LABELS, getDominantTrait } from '@/utils/vacrs';
import { SpectrumDimensionBars, getVACRSRange } from './SpectrumDimensionBars';
import { ThemedCardBackground } from '../ThemedCardBackground';
import { CARD_THEMES } from '@/utils/cardThemes';
import { generateSpectrumCaption } from '@/utils/visualizationCaptions';
import { MetricInfo } from '../MetricInfo';
import { getMetricDescription } from '@/utils/metricDescriptions';

export { getVACRSRange };

interface SpectrumCardProps {
  genreStats: GenreStats[];
  onShare?: () => void;
  stats: Stats;
}


export const SpectrumCard: React.FC<SpectrumCardProps> = ({ genreStats, onShare, stats }) => {
  const { rangeScore, values } = useMemo(() => getVACRSRange(genreStats), [genreStats]);
  const caption = useMemo(() => generateSpectrumCaption(stats), [stats]);

  // Two flanking stats alongside diversity: the trait your listening leans
  // hardest into, and the one spanning the widest min-to-max range across
  // your genres (least to most "energetic", "raw", etc., all in one genre mix).
  const { dominantTraitLabel, dominantTraitPercent, dominantTraitColor, widestRangeLabel, widestRangeTraitColor } = useMemo(() => {
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

    const dominant = getDominantTrait(dominantDim, weighted[dominantDim]);

    return {
      dominantTraitLabel: dominant.label,
      dominantTraitPercent: dominant.percent,
      dominantTraitColor: VACRS_COLORS[dominantDim],
      // "Widest range" describes the whole axis (how far genres spread
      // between its two extremes), not a single direction — so unlike the
      // dominant trait, it's framed as both trait labels rather than a
      // percent-toward-one-side.
      widestRangeLabel: VACRS_RANGE_LABELS[widestDim].join(' ↔ '),
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
            How your listening spreads across emotional and sonic dimensions
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
          <div className="text-lg sm:text-xl font-bold" style={{ color: dominantTraitColor }}>
            {dominantTraitPercent}% {dominantTraitLabel}
          </div>
          <div className="text-xs text-gray-400 mt-1 flex items-center justify-center">
            Dominant Trait
            <MetricInfo description={getMetricDescription('dominant-trait')!} />
          </div>
        </div>

        <div className="text-center">
          <div className="text-4xl sm:text-5xl font-black text-blue-400">
            {rangeScore.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-400 mt-1 flex items-center justify-center">
            Sonic Range
            <MetricInfo description={getMetricDescription('sonic-range')!} />
          </div>
        </div>

        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold" style={{ color: widestRangeTraitColor }}>
            {widestRangeLabel}
          </div>
          <div className="text-xs text-gray-400 mt-1 flex items-center justify-center">
            Widest Range
            <MetricInfo description={getMetricDescription('widest-range')!} />
          </div>
        </div>
      </div>

      {/* Data-driven caption about diversity patterns */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-400 max-w-md mx-auto">{caption}</p>
      </div>
    </ThemedCardBackground>
  );
};
