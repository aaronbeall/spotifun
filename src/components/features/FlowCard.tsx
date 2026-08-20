import React from "react";
import { motion } from 'framer-motion';
import { VACRSScore } from '@/types';
import { calculateGenreVACRSScore } from '@/utils/musicClassification';

interface FlowCardProps {
  tracks: Array<{
    playedAt: string;
    genre: string;
  }>;
}

// Helper to get stacked values for each dimension over time
function getFlowData(tracks: FlowCardProps['tracks']) {
  const dimensions = ["valence", "arousal", "complexity", "rawness", "socialPresence"] as const;
  return tracks.map(track => {
    const score = calculateGenreVACRSScore(track.genre);
    return {
      playedAt: track.playedAt,
      ...score,
    };
  });
}

export const FlowCard: React.FC<FlowCardProps> = ({ tracks }) => {
  if (!tracks?.length) return null;
  const flowData = getFlowData(tracks);
  const dimensions = ["valence", "arousal", "complexity", "rawness", "socialPresence"] as const;
  const colors = ["#34d399", "#fbbf24", "#818cf8", "#f472b6", "#38bdf8"];

  // Chart sizing
  const width = 420;
  const height = 340;
  // Calculate x positions so first/last points are exactly at the edges
  const xPositions = flowData.map((_, i) => {
    if (flowData.length === 1) return width / 2;
    return (i / (flowData.length - 1)) * width;
  });

  // Calculate stacked stream graph bounds
  // At each x, sum all values, then center the stack vertically
  const verticalPadding = 72; // more padding to avoid clipping
  const stack = flowData.map((row) => {
    const values = dimensions.map(dim => row[dim]);
    const total = values.reduce((a, b) => a + b, 0);
    let y0 = (height / 2) - (total * (height - verticalPadding) / 2); // center the stack
    return values.map(v => {
      const y1 = y0 + v * (height - verticalPadding);
      const bounds = [y0, y1];
      y0 = y1;
      return bounds;
    }); // [ [y0,y1] for valence, ... ]
  });

  // For each dimension, build the area path
  function buildStream(dimIdx: number, color: string) {
    let path = '';
    // Top edge
    for (let i = 0; i < flowData.length; i++) {
      const x = xPositions[i];
      const y = stack[i][dimIdx][1];
      path += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
    }
    // Bottom edge (reverse)
    for (let i = flowData.length - 1; i >= 0; i--) {
      const x = xPositions[i];
      const y = stack[i][dimIdx][0];
      path += ` L${x},${y}`;
    }
    path += ' Z';
    return (
      <motion.path
        d={path}
        fill={color}
        fillOpacity={0.25}
        stroke={color}
        strokeWidth={2}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.2 + dimIdx * 0.1 }}
        style={{ filter: 'drop-shadow(0 2px 8px ' + color + '22)' }}
      />
    );
  }

  // Date range
  const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' } as const;
  const firstDate = new Date(flowData[0].playedAt).toLocaleDateString('en-US', dateOptions);
  const lastDate = new Date(flowData[flowData.length - 1].playedAt).toLocaleDateString('en-US', dateOptions);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/5 shadow-2xl overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center gap-3">
            <span className="inline-block w-6 h-6 rounded-full bg-pink-400"></span>
            <h2 className="text-2xl font-bold text-white">Listening Flow</h2>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Recent plays mapped by vibe dimensions over time
          </p>
        </div>
      </div>
      <div className="w-full flex justify-center">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="rounded-lg bg-white/5" preserveAspectRatio="none">
          {dimensions.map((dim, i) => buildStream(i, colors[i]))}
        </svg>
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
