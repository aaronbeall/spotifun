import React, { useMemo } from "react";
import { useTooltip } from '@/hooks/useTooltip';
import { Star } from 'lucide-react';
import { analyzePopularity } from '@/utils/popularity';
import { ImageBadge } from "../ImageBadge";

interface PopularityCardProps {
  tracks: SpotifyApi.TrackObjectFull[];
}

function getHistogramData(tracks: SpotifyApi.TrackObjectFull[]) {
  // Bin track popularity into 10 buckets (0-10, 11-20, ..., 91-100)
  const bins = Array(10).fill(0);
  tracks.forEach(track => {
    const pop = track.popularity || 0;
    const idx = Math.min(9, Math.floor(pop / 10));
    bins[idx]++;
  });
  return bins;
}

export const PopularityCard: React.FC<PopularityCardProps> = ({ tracks }) => {
  const analysis = useMemo(() => analyzePopularity(tracks), [tracks]);
  const bins = useMemo(() => getHistogramData(tracks), [tracks]);

  if (!tracks?.length) return null;

  const maxBin = Math.max(...bins);
  // Calculate average popularity
  const avgPopularity = Math.round(tracks.reduce((sum, t) => sum + (t.popularity || 0), 0) / tracks.length);

  // Extract most and least popular tracks
  const mostPopularTrack = tracks.reduce((max, t) => (t.popularity || 0) > (max.popularity || -1) ? t : max, tracks[0]);
  const leastPopularTrack = tracks.reduce((min, t) => (t.popularity || 0) < (min.popularity || 101) ? t : min, tracks[0]);
  const mostPopularCount = tracks.filter(t => (t.popularity || 0) === Math.max(...tracks.map(t => t.popularity || 0))).length;
  const leastPopularCount = tracks.filter(t => (t.popularity || 0) === Math.min(...tracks.map(t => t.popularity || 0))).length;

  // Helper: get tracks in a bin
  function getTracksInBin(binIdx: number) {
    return tracks.filter(track => {
      const pop = track.popularity || 0;
      return Math.min(9, Math.floor(pop / 10)) === binIdx;
    });
  }

  return (
  <div className="bg-linear-to-br from-gray-900 to-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border border-white/5 shadow-2xl overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Popularity</h2>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Track popularity distribution and rating
          </p>
        </div>
        {/* Popularity Badge + Analysis Description */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/5">
            <span className="text-sm font-medium text-purple-300">Diversity</span>
            <span className="px-3 py-1 rounded-full font-bold text-white bg-linear-to-r from-indigo-500/90 via-purple-500/90 to-pink-500/90 border border-white/10 text-lg shadow flex items-center gap-2" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
              {analysis.label}
              <span className="text-xs font-semibold text-white/80">{avgPopularity}%</span>
            </span>
          </div>
          <div className="mt-2 text-white/80 text-sm text-right max-w-xs">
            {analysis.description}
          </div>
        </div>
      </div>
      {/* Histogram Chart with Tooltip and Badges */}
      <div className="w-full flex justify-center">
        <div className="flex items-center">
          {/* Most Popular Badge (left) */}
          <div className="shrink-0">
            <ImageBadge
              title="Most Popular"
              name={mostPopularTrack.name}
              image={mostPopularTrack.album?.images?.[0]?.url}
              count={mostPopularCount}
              color="#f472b6"
              icon={Star}
              className="scale-90"
              percent={Math.round(mostPopularTrack.popularity || 0)}
            />
          </div>
          {/* Histogram Chart */}
          <div className="grow px-0 mx-8 flex flex-col items-center">
            <PopularityHistogram bins={bins} maxBin={maxBin} getTracksInBin={getTracksInBin} large />
            <div className="flex justify-between w-full mt-2 text-xs text-white/60" style={{ maxWidth: 400 }}>
              <span className="text-left">Niche</span>
              <span className="text-right">Popular</span>
            </div>
          </div>
          {/* Most Niche Badge (right) */}
          <div className="shrink-0 flex flex-col items-center">
            <ImageBadge
              title="Most Niche"
              name={leastPopularTrack.name}
              image={leastPopularTrack.album?.images?.[0]?.url}
              count={leastPopularCount}
              color="#818cf8"
              icon={Star}
              className="scale-90"
              percent={Math.round(leastPopularTrack.popularity || 0)}
            />
          </div>
        </div>
      </div>
    </div>
  );

function PopularityHistogram({ bins, maxBin, getTracksInBin, large }: { bins: number[]; maxBin: number; getTracksInBin: (binIdx: number) => SpotifyApi.TrackObjectFull[]; large?: boolean }) {
  const tooltip = useTooltip();
  // Gradient colors for chart bars
  const chartColors = Array(10).fill('url(#popularityGradient)');
  const chartWidth = large ? 400 : 320;
  const chartHeight = large ? 200 : 140;
  const barMaxHeight = large ? 160 : 110;
  return (
    <div className="w-full flex justify-center relative" style={{ width: chartWidth, margin: '0 auto' }}>
      {tooltip.Tooltip}
      <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="rounded-lg bg-white/5">
        <defs>
          <linearGradient id="popularityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
        </defs>
        {bins.map((count, i) => (
          <g key={i}>
            <rect
              x={i * (chartWidth / 10) + 12}
              y={chartHeight - (count / maxBin) * barMaxHeight - 24}
              width={24}
              height={(count / maxBin) * barMaxHeight}
              fill={chartColors[i]}
              opacity={0.85}
              rx={6}
              onMouseEnter={e => {
                const tracksInBin = getTracksInBin(i);
                const minPop = i * 10;
                const maxPop = i === 9 ? 100 : (i * 10 + 9);
                tooltip.show(
                  <div className="min-w-[120px] max-w-[220px]">
                    <div className="text-xs text-purple-300 mb-1">{minPop}-{maxPop}% Popularity</div>
                    <div className="text-sm font-bold text-white mb-1">{count} plays</div>
                    <ul className="text-xs text-slate-300/90 space-y-0.5">
                      {tracksInBin.slice(0, 8).map(track => (
                        <li key={track.id} className="truncate max-w-[200px]">{track.name}</li>
                      ))}
                      {tracksInBin.length > 8 && (
                        <li className="text-slate-400">+{tracksInBin.length - 8} more</li>
                      )}
                    </ul>
                  </div>, e);
              }}
              onMouseMove={tooltip.move}
              onMouseLeave={tooltip.hide}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
};
