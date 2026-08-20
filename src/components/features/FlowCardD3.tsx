import React, { useRef, useEffect, useState, useMemo } from "react";
import { Sparkles } from 'lucide-react';
import * as d3 from "d3";
import { VACRSScore } from '@/types';
import { calculateGenreVACRSScore, calculateVACRSScoreMatch } from '@/utils/musicClassification';
import { VACRS_DIMENSIONS, VACRS_COLORS } from '@/utils/vacrs';
import { getGenreColor } from '@/utils/format';
import { MUSIC_VIBES } from '@/utils/musicVibes';
import { useTooltip } from '@/hooks/useTooltip';

type ChartMode = 'breakdown' | 'dominance' | 'normalized' | 'momentum' | 'vibes' | 'reflection' | 'fullSpectrum';

const CHART_MODE_DESCRIPTIONS: Record<ChartMode, string> = {
  breakdown: "Raw vibe scores for each track, plotted in listening order.",
  dominance: "Shows only the one trait that stands out most in each track.",
  normalized: "Stretches each track's traits to fill the full range, exaggerating relative differences.",
  momentum: "Blends each track with your recent listening momentum, smoothing out one-off tracks.",
  vibes: "Matches your evolving taste against named vibes and tracks your closest matches over time.",
  reflection: "Mirrors each trait above and below the midpoint, like ripples from center.",
  fullSpectrum: "Shows the full light-to-dark spectrum of each trait, not just its dominant side.",
};

interface FlowCardProps {
  tracks: Array<{
    playedAt: string;
    genres: string[];
    track?: string;
    artist?: string;
  }>;
}

function getFlowData(tracks: FlowCardProps['tracks'], mode: ChartMode = 'breakdown') {
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

  // Apply transformations based on mode
  if (mode === 'dominance') {
    return rawData.map(row => {
      const result = { ...row };
      
      // Treat no genres as neutral (0.5) - no dominant dimensions
      const hasGenres = row.genres && row.genres.length > 0;
      if (!hasGenres) {
        VACRS_DIMENSIONS.forEach(dim => {
          const aboveKey = `${dim}_above`;
          const belowKey = `${dim}_below`;
          (result as Record<string, unknown>)[aboveKey] = 0;
          (result as Record<string, unknown>)[belowKey] = 0;
        });
        return result;
      }
      
      const values = VACRS_DIMENSIONS.map(dim => Math.abs(row[dim] - 0.5));
      const maxDistance = Math.max(...values);
      const dominantIndices = values.map((v, i) => v === maxDistance ? i : -1).filter(i => i !== -1);
      
      VACRS_DIMENSIONS.forEach((dim, i) => {
        const value = row[dim];
        const aboveKey = `${dim}_above`;
        const belowKey = `${dim}_below`;
        
        if (dominantIndices.includes(i)) {
          // Split dominant dimensions into above/below 0.5 streams
          (result as Record<string, unknown>)[aboveKey] = value > 0.5 ? (value - 0.5) : 0;
          (result as Record<string, unknown>)[belowKey] = value < 0.5 ? (0.5 - value) : 0;
        } else {
          // Non-dominant dimensions are zero
          (result as Record<string, unknown>)[aboveKey] = 0;
          (result as Record<string, unknown>)[belowKey] = 0;
        }
      });
      return result;
    });
  }

  if (mode === 'normalized') {
    return rawData.map(row => {
      const values = VACRS_DIMENSIONS.map(dim => row[dim]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;
      const result = { ...row };
      
      VACRS_DIMENSIONS.forEach(dim => {
        let normalizedValue: number;
        if (range === 0) {
          normalizedValue = 0.5;
        } else {
          normalizedValue = (row[dim] - min) / range;
        }
        
        // Split into above/below 0.5 streams like reflection mode
        const aboveKey = `${dim}_above`;
        const belowKey = `${dim}_below`;
        (result as Record<string, unknown>)[aboveKey] = normalizedValue > 0.5 ? (normalizedValue - 0.5) : 0;
        (result as Record<string, unknown>)[belowKey] = normalizedValue < 0.5 ? (0.5 - normalizedValue) : 0;
      });
      return result;
    });
  }

  if (mode === 'momentum') {
    const momentumData: typeof rawData = [];
    const runningAvg: Record<string, number> = {};
    VACRS_DIMENSIONS.forEach(dim => { runningAvg[dim] = 0.5; });

    rawData.forEach((row) => {
      const result = { ...row };
      const hasGenres = row.genres && row.genres.length > 0;
      
      VACRS_DIMENSIONS.forEach(dim => {
        if (!hasGenres) {
          // No genres: maintain momentum without updating
          result[dim] = runningAvg[dim];
        } else {
          const currentValue = row[dim];
          const momentum = runningAvg[dim];
          // Intensify away from 0.5
          const distance = currentValue - 0.5;
          const momentumDistance = momentum - 0.5;
          const combined = distance + momentumDistance * 0.8; // momentum factor (increased from 0.3 to 0.8)
          const intensified = 0.5 + Math.max(-0.5, Math.min(0.5, combined * 1.3)); // amplify further
          result[dim] = intensified;
          // Update running average - stronger momentum retention
          runningAvg[dim] = runningAvg[dim] * 0.85 + currentValue * 0.15;
        }
      });
      momentumData.push(result);
    });
    return momentumData;
  }

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

  if (mode === 'reflection') {
    // Split each dimension into two streams: above and below 0.5
    return rawData.map(row => {
      const result = { ...row };
      VACRS_DIMENSIONS.forEach(dim => {
        const value = row[dim];
        // Above 0.5: positive deviation
        const aboveKey = `${dim}_above`;
        (result as Record<string, unknown>)[aboveKey] = value > 0.5 ? (value - 0.5) : 0;
        // Below 0.5: positive deviation (inverted)
        const belowKey = `${dim}_below`;
        (result as Record<string, unknown>)[belowKey] = value < 0.5 ? (0.5 - value) : 0;
      });
      return result;
    });
  }

  if (mode === 'fullSpectrum') {
    // Full spectrum: streams vary independently based on distance from 0.5
    // At 50%: both light and dark are 5%
    // At 100%: light is 100%, dark is 0%
    // At 0%: light is 0%, dark is 100%
    return rawData.map(row => {
      const result = { ...row };
      VACRS_DIMENSIONS.forEach(dim => {
        const value = row[dim];
        const lightKey = `${dim}_light`;
        const darkKey = `${dim}_dark`;
        
        // Calculate distance from 0.5 (center)
        if (value >= 0.5) {
          // Above 50%: light stream grows from 5% to 100%, dark shrinks from 5% to 0%
          const distance = (value - 0.5) * 2; // 0 to 1 range
          (result as Record<string, unknown>)[lightKey] = 0.05 + distance * 0.95; // 5% to 100%
          (result as Record<string, unknown>)[darkKey] = 0.05 - distance * 0.05; // 5% to 0%
        } else {
          // Below 50%: dark stream grows from 5% to 100%, light shrinks from 5% to 0%
          const distance = (0.5 - value) * 2; // 0 to 1 range
          (result as Record<string, unknown>)[lightKey] = 0.05 - distance * 0.05; // 5% to 0%
          (result as Record<string, unknown>)[darkKey] = 0.05 + distance * 0.95; // 5% to 100%
        }
      });
      return result;
    });
  }

  // Default: breakdown mode
  return rawData;
}

export const FlowCardD3: React.FC<FlowCardProps> = ({ tracks }) => {
  const [chartMode, setChartMode] = useState<ChartMode>('breakdown');
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
    if (chartMode === 'reflection' || chartMode === 'normalized' || chartMode === 'dominance') {
      // Create dimensions for both above and below 0.5 for each VACRS dimension
      const reflectionDims: string[] = [];
      VACRS_DIMENSIONS.forEach(dim => {
        reflectionDims.push(`${dim}_above`);
        reflectionDims.push(`${dim}_below`);
      });
      return reflectionDims;
    }
    if (chartMode === 'fullSpectrum') {
      // Create dimensions for light (below 0.5) and dark (above 0.5) for each VACRS dimension
      const spectrumDims: string[] = [];
      VACRS_DIMENSIONS.forEach(dim => {
        spectrumDims.push(`${dim}_light`);
        spectrumDims.push(`${dim}_dark`);
      });
      return spectrumDims;
    }
    return VACRS_DIMENSIONS;
  }, [chartMode]);
  
  const colors = useMemo(() => {
    if (chartMode === 'vibes') {
      return MUSIC_VIBES.map(vibe => vibe.color.dark);
    }
    if (chartMode === 'reflection' || chartMode === 'normalized' || chartMode === 'dominance') {
      // Create colors: normal color for above, inverted/darker for below
      const reflectionColors: string[] = [];
      VACRS_DIMENSIONS.forEach(dim => {
        const baseColor = VACRS_COLORS[dim];
        reflectionColors.push(baseColor); // above 0.5
        // Create inverted/darker version for below 0.5
        const rgb = baseColor.match(/\w\w/g);
        if (rgb) {
          const [r, g, b] = rgb.map((x) => parseInt(x, 16));
          const inverted = `#${Math.floor(r * 0.5).toString(16).padStart(2, '0')}${Math.floor(g * 0.5).toString(16).padStart(2, '0')}${Math.floor(b * 0.5).toString(16).padStart(2, '0')}`;
          reflectionColors.push(inverted); // below 0.5
        } else {
          reflectionColors.push(baseColor); // fallback
        }
      });
      return reflectionColors;
    }
    if (chartMode === 'fullSpectrum') {
      // Create colors: normal color for light stream, inverted/darker for dark stream (like reflection)
      const spectrumColors: string[] = [];
      VACRS_DIMENSIONS.forEach(dim => {
        const baseColor = VACRS_COLORS[dim];
        spectrumColors.push(baseColor); // light stream (actual value)
        // Create inverted/darker version for dark stream (inverse value)
        const rgb = baseColor.match(/\w\w/g);
        if (rgb) {
          const [r, g, b] = rgb.map((x) => parseInt(x, 16));
          const inverted = `#${Math.floor(r * 0.5).toString(16).padStart(2, '0')}${Math.floor(g * 0.5).toString(16).padStart(2, '0')}${Math.floor(b * 0.5).toString(16).padStart(2, '0')}`;
          spectrumColors.push(inverted); // dark stream
        } else {
          spectrumColors.push(baseColor); // fallback
        }
      });
      return spectrumColors;
    }
    return VACRS_DIMENSIONS.map(dim => VACRS_COLORS[dim]);
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
        {(['breakdown', 'dominance', 'normalized', 'momentum', 'reflection', 'fullSpectrum', 'vibes'] as const).map((mode) => (
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
            {mode === 'fullSpectrum' ? 'Full Spectrum' : mode.charAt(0).toUpperCase() + mode.slice(1)}
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
                            background: vibe.color.dark,
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
              ) : chartMode === 'reflection' || chartMode === 'normalized' || chartMode === 'dominance' ? (
                // Reflection/Normalized/Dominance mode: show combined above/below for each dimension
                VACRS_DIMENSIONS.map((dim) => {
                  const rowData = flowData[tooltip.idx] as unknown as Record<string, number>;
                  const aboveValue = rowData[`${dim}_above`] || 0;
                  const belowValue = rowData[`${dim}_below`] || 0;
                  const actualValue = aboveValue > 0 ? 0.5 + aboveValue : 0.5 - belowValue;
                  const dimColor = VACRS_COLORS[dim];
                  
                  return (
                    <div key={dim} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: dimColor, fontWeight: 700, fontSize: 13, width: 18, textAlign: 'center' }}>{dim.charAt(0).toUpperCase()}</span>
                      <div style={{ background: '#1e293b', borderRadius: 3, height: 6, width: 48, margin: '0 6px' }}>
                        <div style={{
                          background: dimColor,
                          height: '100%',
                          width: `${Math.round(actualValue * 100)}%`,
                          borderRadius: 3,
                          transition: 'width 0.2s',
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#e5e7eb', minWidth: 28, textAlign: 'right' }}>{(actualValue * 100).toFixed(0)}%</span>
                    </div>
                  );
                })
              ) : chartMode === 'fullSpectrum' ? (
                // Full spectrum mode: show original VACRS value
                VACRS_DIMENSIONS.map((dim) => {
                  const rowData = flowData[tooltip.idx] as unknown as Record<string, number>;
                  // The original value is stored in the row (not transformed)
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
              ) : (
                // Other modes: show VACRS dimensions
                dimensions.map((dim, dimIndex) => {
                  const rowData = flowData[tooltip.idx] as unknown as Record<string, number>;
                  const value = rowData[dim] || 0;
                  const dimColor = colors[dimIndex];
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
        ) : chartMode === 'reflection' || chartMode === 'normalized' || chartMode === 'dominance' ? (
          VACRS_DIMENSIONS.map((dim, i) => {
            const baseColorIndex = i * 2;
            const aboveColor = colors[baseColorIndex];
            const belowColor = colors[baseColorIndex + 1];
            return (
              <span key={dim} className="flex items-center gap-1 text-xs" style={{ color: aboveColor }}>
                <span className="inline-flex gap-0.5">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: aboveColor }}></span>
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: belowColor }}></span>
                </span>
                {dim.charAt(0).toUpperCase() + dim.slice(1)}
              </span>
            );
          })
        ) : chartMode === 'fullSpectrum' ? (
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
        ) : (
          dimensions.map((dim, i) => (
            <span key={dim} className="flex items-center gap-1 text-xs" style={{ color: colors[i] }}>
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: colors[i] }}></span>
              {dim.charAt(0).toUpperCase() + dim.slice(1)}
            </span>
          ))
        )}
      </div>
    </div>
  );
};
