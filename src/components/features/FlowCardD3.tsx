import React, { useRef, useEffect } from "react";
import { Sparkles } from 'lucide-react';
import * as d3 from "d3";
import { VACRSScore } from '@/types';
import { calculateGenreVACRSScore } from '@/utils/musicClassification';
import { VACRS_DIMENSIONS, VACRS_COLORS } from '@/utils/vacrs';
import { getGenreColor } from '@/utils/format';

interface FlowCardProps {
  tracks: Array<{
    playedAt: string;
    genres: string[];
    track?: string;
    artist?: string;
  }>;
}

function getFlowData(tracks: FlowCardProps['tracks']) {
  // Sort tracks by playedAt ascending
  const sortedTracks = [...tracks].sort((a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime());
  return sortedTracks.map(track => {
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
}

export const FlowCardD3: React.FC<FlowCardProps> = ({ tracks }) => {
  const [tooltip, setTooltip] = React.useState<{
    x: number;
    y: number;
    idx: number;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const width = 420;
  const height = 340;
  const verticalPadding = 72;
  const dimensions = VACRS_DIMENSIONS;
  const colors = dimensions.map(dim => VACRS_COLORS[dim]);

  useEffect(() => {
    if (!tracks?.length) return;
    const flowData = getFlowData(tracks);
    const x = d3.scaleLinear()
      .domain([0, flowData.length - 1])
      .range([0, width]);
    const stackData = flowData.map(row => dimensions.map(dim => row[dim]));
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
  }, [tracks]);

  if (!tracks?.length) return null;
  const flowData = getFlowData(tracks);
  const dateOptions = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' } as const;
  const firstDate = new Date(flowData[0].playedAt).toLocaleString('en-US', dateOptions);
  const lastDate = new Date(flowData[flowData.length - 1].playedAt).toLocaleString('en-US', dateOptions);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/5 shadow-2xl overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-pink-400" />
            <h2 className="text-2xl font-bold text-white">Listening Flow</h2>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            VACRS stream graph of your recent plays
          </p>
        </div>
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
              {dimensions.map(dim => {
                const value = flowData[tooltip.idx][dim];
                return (
                  <div key={dim} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: VACRS_COLORS[dim], fontWeight: 700, fontSize: 13, width: 18, textAlign: 'center' }}>{dim.charAt(0).toUpperCase()}</span>
                    <div style={{ background: '#1e293b', borderRadius: 3, height: 6, width: 48, margin: '0 6px' }}>
                      <div style={{
                        background: VACRS_COLORS[dim],
                        height: '100%',
                        width: `${Math.round(value * 100)}%`,
                        borderRadius: 3,
                        transition: 'width 0.2s',
                      }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#e5e7eb', minWidth: 28, textAlign: 'right' }}>{(value * 100).toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between mt-2 text-xs text-white/60">
        <span>{firstDate}</span>
        <span>{lastDate}</span>
      </div>
      <div className="flex gap-3 mt-4 justify-center">
        {dimensions.map((dim, i) => (
          <span key={dim} className="flex items-center gap-1 text-xs" style={{ color: colors[i] }}>
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: colors[i] }}></span>
            {dim.charAt(0).toUpperCase() + dim.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
};
