import React, { useRef, useEffect, useState, useMemo } from "react";
import { Sparkles } from 'lucide-react';
import * as d3 from "d3";
import { VACRSScore } from '@/types';
import { calculateGenreVACRSScore, calculateVACRSScoreMatch } from '@/utils/musicClassification';
import { VACRS_DIMENSIONS, VACRS_COLORS } from '@/utils/vacrs';
import { getGenreColor } from '@/utils/format';
import { MUSIC_VIBES } from '@/utils/musicVibes';
import { useTooltip } from '@/hooks/useTooltip';
import { darkenHex } from '@/utils/color';

type ChartMode = 'fullSpectrum' | 'vibes';

const CHART_MODE_LABELS: Record<ChartMode, string> = {
  fullSpectrum: 'Trait Spectrum',
  vibes: 'Vibes',
};

const CHART_MODE_DESCRIPTIONS: Record<ChartMode, string> = {
  fullSpectrum: "Every trait's full light-to-dark range over time, not just whichever side is dominant.",
  vibes: "Tracks which named vibes best match your evolving taste over time.",
};

interface FlowCardProps {
  tracks: Array<{
    playedAt: string;
    genres: string[];
    track?: string;
    artist?: string;
  }>;
}

function getFlowData(tracks: FlowCardProps['tracks'], mode: ChartMode = 'fullSpectrum') {
  // Sort tracks by playedAt ascending
  const sortedTracks = [...tracks].sort((a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime());

  const rawData = sortedTracks.map(track => {
    if (!track.genres || track.genres.length === 0) {
      return {
        playedAt: track.playedAt,
        genres: [],
        track: track.track,
        artist: track.artist,
        valence: 0,
        arousal: 0,
        complexity: 0,
        rawness: 0,
        socialPresence: 0,
      };
    }
    // Average the VACRS scores for all genres
    const scores = track.genres.map(g => calculateGenreVACRSScore(g));
    const avg = (key: keyof VACRSScore) => scores.reduce((sum, s) => sum + s[key], 0) / scores.length;
    return {
      playedAt: track.playedAt,
      genres: track.genres,
      track: track.track,
      artist: track.artist,
      valence: avg('valence'),
      arousal: avg('arousal'),
      complexity: avg('complexity'),
      rawness: avg('rawness'),
      socialPresence: avg('socialPresence'),
    };
  });

  if (mode === 'vibes') {
    const vibesData: Array<typeof rawData[0] & { matchedVibes?: Array<{ vibeId: string; match: number; vibeIndex: number }> }> = [];
    const runningAvg: VACRSScore = {
      valence: 0.5,
      arousal: 0.5,
      complexity: 0.5,
      rawness: 0.5,
      socialPresence: 0.5,
    };

    // First pass: collect all top 3 matches to find min/max for normalization
    const allTop3Matches: number[] = [];

    rawData.forEach((row) => {
      const hasGenres = row.genres && row.genres.length > 0;

      // Update running average
      if (hasGenres) {
        VACRS_DIMENSIONS.forEach(dim => {
          runningAvg[dim] = runningAvg[dim] * 0.7 + row[dim] * 0.3;
        });
      }

      // Calculate match to each vibe based on running average
      const vibeMatches = MUSIC_VIBES.map((vibe, vibeIndex) => {
        const match = calculateVACRSScoreMatch(runningAvg, vibe.targetScore);
        return { vibeId: vibe.id, match, vibeIndex };
      });

      // Sort by match and get top 3
      const sortedMatches = [...vibeMatches].sort((a, b) => b.match - a.match);
      const top3 = sortedMatches.slice(0, 3);

      // Collect all top 3 match values for normalization
      top3.forEach(vm => allTop3Matches.push(vm.match));
    });

    // Find min and max of top 3 matches across all time
    const minMatch = Math.min(...allTop3Matches);
    const maxMatch = Math.max(...allTop3Matches);
    const matchRange = maxMatch - minMatch;

    // Second pass: create normalized data
    const runningAvg2: VACRSScore = {
      valence: 0.5,
      arousal: 0.5,
      complexity: 0.5,
      rawness: 0.5,
      socialPresence: 0.5,
    };

    rawData.forEach((row) => {
      const hasGenres = row.genres && row.genres.length > 0;

      // Update running average (same as first pass)
      if (hasGenres) {
        VACRS_DIMENSIONS.forEach(dim => {
          runningAvg2[dim] = runningAvg2[dim] * 0.7 + row[dim] * 0.3;
        });
      }

      // Calculate match to each vibe based on running average
      const vibeMatches = MUSIC_VIBES.map((vibe, vibeIndex) => {
        const match = calculateVACRSScoreMatch(runningAvg2, vibe.targetScore);
        return { vibeId: vibe.id, match, vibeIndex };
      });

      // Sort by match and get top 3
      const sortedMatches = [...vibeMatches].sort((a, b) => b.match - a.match);
      const top3 = sortedMatches.slice(0, 3);

      // Create result with only top 3 vibes
      const result = {
        ...row,
        matchedVibes: vibeMatches, // Keep all for tooltip
      };

      // Initialize all vibe dimensions to 0
      MUSIC_VIBES.forEach((vibe, i) => {
        const key = `vibe_${i}`;
        (result as Record<string, unknown>)[key] = 0;
      });

      // Set only top 3 vibes with normalized values
      top3.forEach(vibeMatch => {
        const key = `vibe_${vibeMatch.vibeIndex}`;
        // Normalize: (value - min) / range
        const normalizedValue = matchRange > 0 ? (vibeMatch.match - minMatch) / matchRange : 0;
        (result as Record<string, unknown>)[key] = normalizedValue;
      });

      vibesData.push(result);
    });
    return vibesData;
  }

  // fullSpectrum: streams vary independently based on distance from 0.5
  // At 50%: both light and dark are 5%
  // At 100%: light is 100%, dark is 0%
  // At 0%: light is 0%, dark is 100%
  return rawData.map(row => {
    const result = { ...row };
    VACRS_DIMENSIONS.forEach(dim => {
      const value = row[dim];
      const lightKey = `${dim}_light`;
      const darkKey = `${dim}_dark`;

      if (value >= 0.5) {
        const distance = (value - 0.5) * 2; // 0 to 1 range
        (result as Record<string, unknown>)[lightKey] = 0.05 + distance * 0.95; // 5% to 100%
        (result as Record<string, unknown>)[darkKey] = 0.05 - distance * 0.05; // 5% to 0%
      } else {
        const distance = (0.5 - value) * 2; // 0 to 1 range
        (result as Record<string, unknown>)[lightKey] = 0.05 - distance * 0.05; // 5% to 0%
        (result as Record<string, unknown>)[darkKey] = 0.05 + distance * 0.95; // 5% to 100%
      }
    });
    return result;
  });
}

export const FlowCardD3: React.FC<FlowCardProps> = ({ tracks }) => {
  const [chartMode, setChartMode] = useState<ChartMode>('fullSpectrum');
  const modeTooltip = useTooltip();
  const [tooltip, setTooltip] = React.useState<{
    x: number;
    y: number;
    idx: number;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const width = 420;
  const height = 340;
  const verticalPadding = 72;

  // Use different dimensions/colors based on mode
  const dimensions = useMemo(() => {
    if (chartMode === 'vibes') {
      return MUSIC_VIBES.map((_, i) => `vibe_${i}`);
    }
    return VACRS_DIMENSIONS.flatMap(dim => [`${dim}_light`, `${dim}_dark`]);
  }, [chartMode]);

  const colors = useMemo(() => {
    if (chartMode === 'vibes') {
      // Use each vibe's own theme color (the same swatch used on vibe badges elsewhere)
      return MUSIC_VIBES.map(vibe => vibe.color.light);
    }
    return VACRS_DIMENSIONS.flatMap(dim => {
      const baseColor = VACRS_COLORS[dim];
      return [baseColor, darkenHex(baseColor, 0.5)];
    });
  }, [chartMode]);

  useEffect(() => {
    if (!tracks?.length) return;
    const flowData = getFlowData(tracks, chartMode);
    const x = d3.scaleLinear()
      .domain([0, flowData.length - 1])
      .range([0, width]);
    const stackData = flowData.map(row => {
      const rowData = row as unknown as Record<string, number>;
      return dimensions.map(dim => rowData[dim] || 0);
    });
    const stackGen = d3.stack()
      .keys(d3.range(dimensions.length))
      .offset(d3.stackOffsetSilhouette);
    const stacked = stackGen(stackData);
    const y = d3.scaleLinear()
      .domain([
        d3.min(stacked, layer => d3.min(layer, d => d[0])) ?? 0,
        d3.max(stacked, layer => d3.max(layer, d => d[1])) ?? 1
      ])
      .range([height - verticalPadding, verticalPadding]);

    const svg = d3.select(svgRef.current);
    svg.selectAll("g").remove();
    const g = svg.append("g");

    stacked.forEach((layer, i) => {
      const area = d3.area()
        .x((d, idx) => x(idx))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))
        .curve(d3.curveCatmullRom);
      g.append("path")
        .datum(layer)
        .attr("d", area)
        .attr("fill", colors[i])
        .attr("fill-opacity", 1);
    });
    // Add invisible rects for tooltip detection and subtle hover
    g.selectAll("rect.tooltip-area")
      .data(flowData)
      .enter()
      .append("rect")
      .attr("class", "tooltip-area")
      .attr("x", (_, i) => x(i) - width / flowData.length / 2)
      .attr("y", 0)
      .attr("width", width / flowData.length)
      .attr("height", height)
      .attr("fill", "transparent")
      .on("mousemove", function(event, d) {
        const idx = flowData.indexOf(d);
        setTooltip({
          x: x(idx),
          y: event.offsetY,
          idx,
        });
        d3.select(this).attr("fill", "#64748b22"); // subtle slate hover
      })
      .on("mouseleave", function() {
        setTooltip(null);
        d3.select(this).attr("fill", "transparent");
      });
  }, [tracks, chartMode, colors, dimensions]);

  if (!tracks?.length) return null;
  const flowData = getFlowData(tracks, chartMode);
  const dateOptions = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' } as const;
  const firstDate = new Date(flowData[0].playedAt).toLocaleString('en-US', dateOptions);
  const lastDate = new Date(flowData[flowData.length - 1].playedAt).toLocaleString('en-US', dateOptions);

  return (
    <div className="bg-linear-to-br from-gray-900 to-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/5 shadow-2xl overflow-hidden">
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
        <svg
          ref={svgRef}
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="rounded-lg bg-white/5"
          preserveAspectRatio="none"
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
