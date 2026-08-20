import React, { useState } from "react";
import { Sparkles, Share2 } from 'lucide-react';
import { VACRSScore } from '@/types';
import { calculateGenreVACRSScore } from '@/utils/musicClassification';
import { VACRS_DIMENSIONS, VACRS_COLORS } from '@/utils/vacrs';
import { getGenreColor } from '@/utils/format';
import { MUSIC_VIBES } from '@/utils/musicVibes';
import { useTooltip } from '@/hooks/useTooltip';
import { FlowStreamChart, FlowChartMode, FlowTrack, getFlowData, getFlowDimensionsAndColors } from './FlowStreamChart';

const CHART_MODE_LABELS: Record<FlowChartMode, string> = {
  fullSpectrum: 'Genre Spectrum',
  vibes: 'Vibes',
};

const CHART_MODE_DESCRIPTIONS: Record<FlowChartMode, string> = {
  fullSpectrum: "Every trait's full light-to-dark range over time, not just whichever side is dominant.",
  vibes: "Tracks which named vibes best match your evolving taste over time.",
};

interface FlowCardProps {
  tracks: FlowTrack[];
  onShare?: () => void;
}

export const FlowCardD3: React.FC<FlowCardProps> = ({ tracks, onShare }) => {
  const [chartMode, setChartMode] = useState<FlowChartMode>('fullSpectrum');
  const modeTooltip = useTooltip();
  const [tooltip, setTooltip] = React.useState<{
    x: number;
    y: number;
    idx: number;
  } | null>(null);
  const width = 420;
  const height = 340;

  const { colors } = getFlowDimensionsAndColors(chartMode);

  if (!tracks?.length) return null;
  const flowData = getFlowData(tracks, chartMode);
  const dateOptions = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' } as const;
  const firstDate = new Date(flowData[0].playedAt).toLocaleString('en-US', dateOptions);
  const lastDate = new Date(flowData[flowData.length - 1].playedAt).toLocaleString('en-US', dateOptions);

  return (
    <div className="bg-linear-to-br from-gray-900 to-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border border-white/5 shadow-2xl overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-pink-400" />
            <h2 className="text-2xl font-bold text-white">Listening Flow</h2>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Vibe dimension stream graph of your recent plays
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
      {/* Chart mode toggle buttons */}
      {modeTooltip.Tooltip}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['fullSpectrum', 'vibes'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setChartMode(mode)}
            onMouseEnter={e => modeTooltip.show(CHART_MODE_DESCRIPTIONS[mode], e)}
            onMouseMove={modeTooltip.move}
            onMouseLeave={modeTooltip.hide}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              chartMode === mode
                ? 'bg-pink-400 text-white border-pink-400'
                : 'text-gray-400 border-white/20 hover:border-pink-400/50'
            }`}
          >
            {CHART_MODE_LABELS[mode]}
          </button>
        ))}
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
            <div style={{ fontSize: 11, color: '#cbd5e1', marginBottom: 4, fontWeight: 400, opacity: 0.6 }}>
              {new Date(flowData[tooltip.idx].playedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2, lineHeight: 1.2 }}>
              {flowData[tooltip.idx].track}
            </div>
            <div style={{ fontWeight: 400, fontSize: 12, marginBottom: 8, color: '#a3a3a3', lineHeight: 1.2, opacity: 0.7 }}>
              {flowData[tooltip.idx].artist}
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
                    const VibeIcon = vibe.icon;

                    return (
                      <div key={vibe.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ color: vibe.color.light, width: 16, height: 16 }}>
                          <VibeIcon className="w-4 h-4" />
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
              ) : (
                // Full spectrum mode: show original VACRS value
                VACRS_DIMENSIONS.map((dim) => {
                  const originalRow = tracks[tooltip.idx];
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
      <div className="flex justify-between mt-2 text-xs text-white/60">
        <span>{firstDate}</span>
        <span>{lastDate}</span>
      </div>
      <div className="flex gap-3 mt-4 justify-center flex-wrap">
        {chartMode === 'vibes' ? (
          (() => {
            // Get unique vibe indices that appear in top 3 across all data
            const appearedVibeIndices = new Set<number>();
            flowData.forEach(row => {
              const rowData = row as unknown as { matchedVibes?: Array<{ vibeId: string; match: number; vibeIndex: number }> };
              const matchedVibes = rowData.matchedVibes || [];
              const topVibes = [...matchedVibes].sort((a, b) => b.match - a.match).slice(0, 3);
              topVibes.forEach(vm => appearedVibeIndices.add(vm.vibeIndex));
            });

            // Show only vibes that appeared
            return MUSIC_VIBES.map((vibe, i) => {
              if (!appearedVibeIndices.has(i)) return null;
              const VibeIcon = vibe.icon;
              return (
                <span key={vibe.id} className="flex items-center gap-1 text-xs" style={{ color: colors[i] }}>
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: colors[i] }}></span>
                  <VibeIcon className="w-3 h-3" />
                  {vibe.name}
                </span>
              );
            }).filter(Boolean);
          })()
        ) : (
          VACRS_DIMENSIONS.map((dim, i) => {
            const baseColorIndex = i * 2;
            const lightColor = colors[baseColorIndex];
            const darkColor = colors[baseColorIndex + 1];
            return (
              <span key={dim} className="flex items-center gap-1 text-xs" style={{ color: darkColor }}>
                <span className="inline-flex gap-0.5">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: lightColor }}></span>
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: darkColor }}></span>
                </span>
                {dim.charAt(0).toUpperCase() + dim.slice(1)}
              </span>
            );
          })
        )}
      </div>
    </div>
  );
};
