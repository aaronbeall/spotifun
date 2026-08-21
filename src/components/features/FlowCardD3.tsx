import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { Activity, Sparkles, Share2, Tags, SlidersHorizontal } from 'lucide-react';
import { VACRSScore } from '@/types';
import { calculateGenreVACRSScore } from '@/utils/musicClassification';
import { VACRS_DIMENSIONS, VACRS_COLORS } from '@/utils/vacrs';
import { getGenreColor, formatRelativeTime } from '@/utils/format';
import { MUSIC_VIBES } from '@/utils/musicVibes';
import { FlowStreamChart, FlowChartMode, FlowTrack, getFlowData, getFlowDimensionsAndColors, getTopGenres } from './FlowStreamChart';
import { FlowLegend } from './FlowLegend';
import { ThemedCardBackground } from '../ThemedCardBackground';
import { CARD_THEMES } from '@/utils/cardThemes';

const CHART_MODES = ['genres', 'traits', 'vibes'] as const;

// Short labels for the mode tab selector
export const CHART_MODE_LABELS: Record<FlowChartMode, string> = {
  genres: 'Genres',
  traits: 'Traits',
  vibes: 'Vibes',
};

const CHART_MODE_ICONS: Record<FlowChartMode, React.ComponentType<{ className?: string }>> = {
  genres: Tags,
  traits: SlidersHorizontal,
  vibes: Sparkles,
};

// Full titles shown below the chart and on the share card
export const CHART_MODE_TITLES: Record<FlowChartMode, string> = {
  genres: 'Genre Flow',
  traits: 'Trait Flow',
  vibes: 'Vibes Flow',
};

export const CHART_MODE_DESCRIPTIONS: Record<FlowChartMode, string> = {
  genres: 'Tracks how your top genres ebb and flow across your recent plays.',
  traits: "Every trait's full light-to-dark range over time, not just whichever side is dominant.",
  vibes: "Tracks which named vibes best match your evolving taste over time.",
};

interface FlowCardProps {
  tracks: FlowTrack[];
  onShare?: () => void;
  /** Reports the active chart mode upward so a parent (e.g. the share card) can mirror it. */
  onChartModeChange?: (mode: FlowChartMode) => void;
}

export const FlowCardD3: React.FC<FlowCardProps> = ({ tracks, onShare, onChartModeChange }) => {
  const [chartMode, setChartMode] = useState<FlowChartMode>('genres');

  useEffect(() => {
    onChartModeChange?.(chartMode);
  }, [chartMode, onChartModeChange]);
  const [tooltip, setTooltip] = React.useState<{
    x: number;
    y: number;
    idx: number;
  } | null>(null);
  const width = 420;
  const height = 340;

  const { colors } = getFlowDimensionsAndColors(chartMode, tracks);
  const topGenres = getTopGenres(tracks);

  if (!tracks?.length) return null;
  const flowData = getFlowData(tracks, chartMode);
  const firstDate = formatRelativeTime(flowData[0].playedAt);
  const lastDate = formatRelativeTime(flowData[flowData.length - 1].playedAt);

  return (
    <ThemedCardBackground color={CARD_THEMES.flow} className="backdrop-blur-sm rounded-3xl p-6 border border-white/5 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-pink-400" />
            <h2 className="text-2xl font-bold text-white">Listening Flow</h2>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Stream graph of your recent plays, by genre, trait, or vibe
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
      <div className="flex justify-center mb-6">
        <div className="relative inline-flex items-center gap-1 bg-gray-900/60 border border-gray-700/60 rounded-full p-1">
          {CHART_MODES.map((mode) => {
            const isActive = chartMode === mode;
            const Icon = CHART_MODE_ICONS[mode];
            return (
              <button
                key={mode}
                onClick={() => setChartMode(mode)}
                className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-colors focus:outline-none ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
                aria-current={isActive ? 'true' : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="flow-mode-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-pink-400 shadow-md"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5" />
                {CHART_MODE_LABELS[mode]}
              </button>
            );
          })}
        </div>
      </div>
      <div className="w-full flex justify-center" style={{ position: 'relative' }}>
        <FlowStreamChart
          tracks={tracks}
          chartMode={chartMode}
          width={width}
          height={height}
          onHover={(idx, x, y) => setTooltip(idx === null ? null : { idx, x, y })}
        />
        {tooltip && (
          <div
            style={{
              position: 'absolute',
              left: `calc(${tooltip.x / width * 100}% - 80px)`,
              top: tooltip.y + 16,
              minWidth: 180,
              background: 'rgba(30, 41, 59, 0.98)',
              color: 'white',
              borderRadius: 10,
              padding: '12px 16px',
              boxShadow: '0 2px 12px #0008',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              {flowData[tooltip.idx].image && (
                <img
                  src={flowData[tooltip.idx].image}
                  alt=""
                  style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                />
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, color: '#cbd5e1', marginBottom: 2, fontWeight: 400, opacity: 0.6 }}>
                  {new Date(flowData[tooltip.idx].playedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>
                  {flowData[tooltip.idx].track}
                </div>
                <div style={{ fontWeight: 400, fontSize: 12, color: '#a3a3a3', lineHeight: 1.2, opacity: 0.7 }}>
                  {flowData[tooltip.idx].artist}
                </div>
              </div>
            </div>
            <div className="mb-2">
              {(() => {
                const genres = flowData[tooltip.idx].genres;
                if (!genres || genres.length === 0) {
                  return (
                    <span className="inline-block bg-slate-600 text-slate-200 font-medium text-xs rounded-md px-2 py-0.5 min-w-12 text-center">No genre</span>
                  );
                }
                return (
                  <span className="flex flex-wrap gap-1">
                    {genres.map((genre, i) => {
                      const genreColor = getGenreColor(genre);
                      return (
                        <span
                          key={genre + i}
                          className={`inline-block font-medium text-xs rounded-md px-2 py-0.5 min-w-12 text-center`}
                          style={{
                            background: genreColor.color + '22',
                            color: genreColor.color,
                          }}
                        >{genre}</span>
                      );
                    })}
                  </span>
                );
              })()}
            </div>
            <div style={{ marginTop: 2, display: 'grid', gridTemplateColumns: '1fr', rowGap: 4 }}>
              {chartMode === 'vibes' ? (
                // Vibes mode: show matched vibes with icons
                (() => {
                  const rowData = flowData[tooltip.idx] as unknown as { matchedVibes?: Array<{ vibeId: string; match: number; vibeIndex: number }> };
                  const matchedVibes = rowData.matchedVibes || [];
                  // Sort by match percentage descending and show top 3
                  const topVibes = [...matchedVibes].sort((a, b) => b.match - a.match).slice(0, 3);

                  return topVibes.map((vibeMatch) => {
                    const vibe = MUSIC_VIBES.find(v => v.id === vibeMatch.vibeId);
                    if (!vibe) return null;

                    return (
                      <div key={vibe.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            flexShrink: 0,
                            boxShadow: `0 0 4px ${vibe.color.light}80`,
                          }}
                        >
                          {vibe.image ? (
                            <img src={vibe.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: vibe.color.light }} />
                          )}
                        </div>
                        <span style={{ color: vibe.color.light, fontWeight: 500, fontSize: 12, minWidth: 120 }}>{vibe.name}</span>
                        <div style={{ background: '#1e293b', borderRadius: 3, height: 6, width: 48, margin: '0 6px' }}>
                          <div style={{
                            background: vibe.color.light,
                            height: '100%',
                            width: `${Math.round(vibeMatch.match)}%`,
                            borderRadius: 3,
                            transition: 'width 0.2s',
                          }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#e5e7eb', minWidth: 28, textAlign: 'right' }}>{vibeMatch.match.toFixed(0)}%</span>
                      </div>
                    );
                  });
                })()
              ) : chartMode === 'genres' ? (
                // Genres mode: show the running presence of each tracked genre
                topGenres.map((genre, i) => {
                  const rowData = flowData[tooltip.idx] as unknown as Record<string, number>;
                  const value = rowData[`genre_${i}`] || 0;
                  const color = colors[i];

                  return (
                    <div key={genre} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color, fontWeight: 500, fontSize: 12, minWidth: 120 }}>{genre}</span>
                      <div style={{ background: '#1e293b', borderRadius: 3, height: 6, width: 48, margin: '0 6px' }}>
                        <div style={{
                          background: color,
                          height: '100%',
                          width: `${Math.round(value * 100)}%`,
                          borderRadius: 3,
                          transition: 'width 0.2s',
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#e5e7eb', minWidth: 28, textAlign: 'right' }}>{Math.round(value * 100)}%</span>
                    </div>
                  );
                })
              ) : (
                // Traits mode: show original VACRS value
                VACRS_DIMENSIONS.map((dim) => {
                  const originalRow = flowData[tooltip.idx];
                  if (!originalRow.genres || originalRow.genres.length === 0) {
                    return null;
                  }
                  const scores = originalRow.genres.map(g => calculateGenreVACRSScore(g));
                  const avg = (key: keyof VACRSScore) => scores.reduce((sum, s) => sum + s[key], 0) / scores.length;
                  const value = avg(dim as keyof VACRSScore);
                  const dimColor = VACRS_COLORS[dim];

                  return (
                    <div key={dim} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: dimColor, fontWeight: 700, fontSize: 13, width: 18, textAlign: 'center' }}>{dim.charAt(0).toUpperCase()}</span>
                      <div style={{ background: '#1e293b', borderRadius: 3, height: 6, width: 48, margin: '0 6px' }}>
                        <div style={{
                          background: dimColor,
                          height: '100%',
                          width: `${Math.round(value * 100)}%`,
                          borderRadius: 3,
                          transition: 'width 0.2s',
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#e5e7eb', minWidth: 28, textAlign: 'right' }}>{(value * 100).toFixed(0)}%</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center mt-1 text-xs text-white/60">
        <span className="justify-self-start">{firstDate}</span>
        <FlowLegend tracks={tracks} chartMode={chartMode} />
        <span className="justify-self-end">{lastDate}</span>
      </div>
      <div className="text-center mt-6">
        <h3 className="text-xl font-bold text-pink-400">{CHART_MODE_TITLES[chartMode]}</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">{CHART_MODE_DESCRIPTIONS[chartMode]}</p>
      </div>
    </ThemedCardBackground>
  );
};
