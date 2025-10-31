import React, { useMemo } from "react";
import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';
import { GenreStats } from '@/types';
import { calculateGenreVACRSScore, calculateWeightedVACRSScore } from '@/utils/musicClassification';
import { VACRS_COLORS, VACRS_DIMENSIONS, VACRS_NAMES, VACRS_RANGE_LABELS } from '@/utils/vacrs';
import { useTooltip } from "@/hooks/useTooltip";

interface SpectrumCardProps {
  genreStats: GenreStats[];
}

function getVACRSDiversity(genreStats: GenreStats[]) {
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


export const SpectrumCard: React.FC<SpectrumCardProps> = ({ genreStats }) => {
  const tooltip = useTooltip();

  const { spread, values, diversityScore } = useMemo(() => getVACRSDiversity(genreStats), [genreStats]);
  const weightedScore = useMemo(() => calculateWeightedVACRSScore(genreStats), [genreStats]);

  if (!genreStats?.length) return null;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border border-white/5 shadow-2xl overflow-hidden">
      {tooltip.Tooltip}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Genre Spectrum</h2>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Diversity of your listening mapped by VACRS dimensions
          </p>
        </div>
        {/* Diversity Score Badge */}
        <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/5">
          <span className="text-sm font-medium text-blue-300">Diversity</span>
          <span className="px-3 py-1 rounded-full font-bold text-white bg-blue-500/80 border border-blue-300/40 text-lg shadow" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
            {diversityScore.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mt-8">
        {VACRS_DIMENSIONS.map((dim, i) => {
          // Get weighted score for this dimension
          const weightedDimScore = weightedScore[dim];
          // Calculate y position for weighted score marker
          const weightedY = (1 - weightedDimScore) * 176 + 8;
          return (
            <div key={dim} className="flex flex-col items-center px-2">
              <span className="font-semibold text-white mb-1 text-base" style={{ color: VACRS_COLORS[dim] }}>{VACRS_NAMES[dim]}</span>
              {/* Spread as percentage tag (just % value) */}
              <span className="mb-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-blue-200 border border-white/10">
                {(spread[dim] * 100).toFixed(1)}%
              </span>
              {/* Top axis label outside chart */}
              <span className="mb-1 text-xs text-white/60 font-semibold">{VACRS_RANGE_LABELS[dim][1]}</span>
              {/* Vertical scatter plot, no background box */}
              <div className="relative w-32 h-48 flex flex-col items-center justify-between">
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
                  const minSize = 12;
                  const maxSize = 30;
                  return values[dim]
                    .sort((a, b) => b.playCount - a.playCount)
                    .map((v, idx) => {
                      const y = (1 - v.score) * 176 + 8;
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
                          onMouseEnter={e => tooltip.show(
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
                            </div>, e)}
                          onMouseMove={tooltip.move}
                          onMouseLeave={tooltip.hide}
                        >
                          <span
                            className="aspect-square rounded-full border-2 shadow block"
                            style={{
                              width: `${size}px`,
                              background: VACRS_COLORS[dim],
                              borderColor: `${VACRS_COLORS[dim]}80`,
                              opacity: 0.45,
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
              <span className="mt-1 text-xs text-white/60 font-semibold">{VACRS_RANGE_LABELS[dim][0]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
