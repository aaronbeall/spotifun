import { useMemo } from "react";
import { motion } from 'framer-motion';
import { GenreStats } from '@/types';
import { calculateGenreVACRSScore, calculateWeightedVACRSScore } from '@/utils/musicClassification';
import { VACRS_COLORS, VACRS_DIMENSIONS, VACRS_NAMES, VACRS_RANGE_LABELS } from '@/utils/vacrs';
import { useTooltip } from "@/hooks/useTooltip";

export function getVACRSDiversity(genreStats: GenreStats[]) {
  // Calculate VACRS scores for each genre
  const scores = genreStats.map(g => calculateGenreVACRSScore(g.genre));
  // For each dimension, collect all values
  const spread: Record<string, number> = {};
  const values: Record<string, { score: number; playCount: number; genre: string }[]> = {};
  VACRS_DIMENSIONS.forEach(dim => {
    values[dim] = genreStats.map((g, idx) => ({
      score: scores[idx][dim],
      playCount: g.playCount,
      genre: g.genre
    }));
    // Spread = standard deviation
    const mean = values[dim].reduce((a, b) => a + b.score, 0) / values[dim].length;
    const variance = values[dim].reduce((a, b) => a + Math.pow(b.score - mean, 2), 0) / values[dim].length;
    spread[dim] = Math.sqrt(variance);
  });
  // Diversity score: average spread
  const diversityScore = (Object.values(spread).reduce((a, b) => a + b, 0) / VACRS_DIMENSIONS.length) * 100;
  return { spread, values, diversityScore };
}

interface SpectrumDimensionBarsProps {
  genreStats: GenreStats[];
  /** When false, skips per-genre tooltips and hover-only chrome (used for the static share graphic) */
  interactive?: boolean;
  /** Renders the same bubble scatter at a smaller fixed size, without axis labels/spread tags (fits the fixed-width share graphic) */
  compact?: boolean;
}

// The core Spectrum visual, extracted so it can be reused both in the live
// interactive Spectrum card and in the static share graphic.
export function SpectrumDimensionBars({ genreStats, interactive = true, compact = false }: SpectrumDimensionBarsProps) {
  const tooltip = useTooltip();
  const { spread, values, weightedScore } = useMemo(() => {
    const { spread, values } = getVACRSDiversity(genreStats);
    return { spread, values, weightedScore: calculateWeightedVACRSScore(genreStats) };
  }, [genreStats]);

  if (!genreStats?.length) return null;

  const chartHeight = compact ? 100 : 176;
  const offset = compact ? 6 : 8;
  const minSize = compact ? 8 : 12;
  const maxSize = compact ? 18 : 30;
  const dotOpacity = compact ? 0.7 : 0.45;

  return (
    <div className={compact ? "grid grid-cols-5 gap-3" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8"}>
      {interactive && tooltip.Tooltip}
      {VACRS_DIMENSIONS.map((dim, i) => {
        // Get weighted score for this dimension
        const weightedDimScore = weightedScore[dim];
        // Calculate y position for weighted score marker
        const weightedY = (1 - weightedDimScore) * chartHeight + offset;
        return (
          <div key={dim} className={compact ? "flex flex-col items-center" : "flex flex-col items-center px-2"}>
            <span
              className={compact ? "font-semibold mb-1 text-[10px]" : "font-semibold text-white mb-1 text-base"}
              style={{ color: VACRS_COLORS[dim] }}
            >
              {compact ? VACRS_NAMES[dim].slice(0, 4) : VACRS_NAMES[dim]}
            </span>
            {/* Spread as percentage tag (just % value) */}
            {!compact && (
              <span className="mb-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-blue-200 border border-white/10">
                {(spread[dim] * 100).toFixed(1)}%
              </span>
            )}
            {/* Top axis label outside chart */}
            {!compact && (
              <span className="mb-1 text-xs text-white/60 font-semibold">{VACRS_RANGE_LABELS[dim][1]}</span>
            )}
            {/* Vertical scatter plot, no background box */}
            <div
              className={compact ? "relative w-14 flex flex-col items-center justify-between" : "relative w-32 h-48 flex flex-col items-center justify-between"}
              style={compact ? { height: chartHeight + offset * 2 } : undefined}
            >
              {/* Weighted score dotted trend line with fading ends */}
              <motion.div
                className="absolute left-0 pointer-events-none"
                style={{ top: `${weightedY}px`, zIndex: 99, width: '100%', height: '2px' }}
                aria-hidden="true"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <div
                  className="w-full"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${VACRS_COLORS[dim]}33 15%, ${VACRS_COLORS[dim]} 50%, ${VACRS_COLORS[dim]}33 85%, transparent 100%)`,
                    height: '2px',
                    borderRadius: '1px',
                  }}
                />
              </motion.div>
              {(() => {
                const playCounts = values[dim].map(v => v.playCount);
                const minPlay = Math.min(...playCounts);
                const maxPlay = Math.max(...playCounts);
                return values[dim]
                  .sort((a, b) => b.playCount - a.playCount)
                  .map((v, idx) => {
                    const y = (1 - v.score) * chartHeight + offset;
                    let size = minSize;
                    if (maxPlay !== minPlay) {
                      size = minSize + ((v.playCount - minPlay) / (maxPlay - minPlay)) * (maxSize - minSize);
                    }
                    return (
                      <motion.div
                        key={v.genre + idx}
                        className="absolute left-1/2 -translate-x-1/2"
                        style={{ top: `${y}px`, zIndex: 10 + idx }}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 + idx * 0.07 }}
                        onMouseEnter={interactive ? e => tooltip.show(
                          <div className="min-w-[110px] flex flex-col gap-1">
                            <div className="flex items-center">
                              <span className="text-xs font-medium text-slate-300 whitespace-nowrap">{v.genre}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold whitespace-nowrap">
                                <span style={{ color: VACRS_COLORS[dim] }}>{(v.score * 100).toFixed(0)}%</span>
                                <span className="text-xs text-slate-400 font-normal ml-1">{VACRS_NAMES[dim]}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-slate-400 whitespace-nowrap">
                                {v.playCount} {v.playCount === 1 ? 'play' : 'plays'}
                              </span>
                            </div>
                          </div>, e) : undefined}
                        onMouseMove={interactive ? tooltip.move : undefined}
                        onMouseLeave={interactive ? tooltip.hide : undefined}
                      >
                        <span
                          className="aspect-square rounded-full border-2 shadow block"
                          style={{
                            width: `${size}px`,
                            background: VACRS_COLORS[dim],
                            borderColor: `${VACRS_COLORS[dim]}80`,
                            opacity: dotOpacity,
                            boxShadow: `0 2px 8px ${VACRS_COLORS[dim]}40`,
                          }}
                        />
                      </motion.div>
                    );
                  });
              })()}
              {/* Axis line */}
              <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-white/10 rounded" style={{ zIndex: 1 }} />
            </div>
            {/* Bottom axis label outside chart */}
            {!compact && (
              <span className="mt-1 text-xs text-white/60 font-semibold">{VACRS_RANGE_LABELS[dim][0]}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
