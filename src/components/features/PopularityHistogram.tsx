import { useMemo } from "react";
import { motion } from 'framer-motion';
import { useTooltip } from '@/hooks/useTooltip';
import { SIGNATURE_EASE } from '@/utils/easing';

const BAR_STAGGER = 0.04;
const BAR_DURATION = 0.5;

export function getHistogramData(tracks: SpotifyApi.TrackObjectFull[]) {
  // Bin track popularity into 10 buckets (0-10, 11-20, ..., 91-100)
  const bins = Array(10).fill(0);
  tracks.forEach(track => {
    const pop = track.popularity || 0;
    const idx = Math.min(9, Math.floor(pop / 10));
    bins[idx]++;
  });
  return bins;
}

export function getTracksInBin(tracks: SpotifyApi.TrackObjectFull[], binIdx: number) {
  return tracks.filter(track => {
    const pop = track.popularity || 0;
    return Math.min(9, Math.floor(pop / 10)) === binIdx;
  });
}

interface PopularityHistogramProps {
  tracks: SpotifyApi.TrackObjectFull[];
  large?: boolean;
  interactive?: boolean;
}

// The core Popularity visual, extracted so it can be reused both in the live
// interactive Popularity card and in the static share graphic.
export function PopularityHistogram({ tracks, large, interactive = true }: PopularityHistogramProps) {
  const tooltip = useTooltip();
  const bins = useMemo(() => getHistogramData(tracks), [tracks]);
  const maxBin = Math.max(...bins);
  const chartColors = Array(10).fill('url(#popularityGradient)');
  const chartWidth = large ? 400 : 320;
  const chartHeight = large ? 200 : 140;
  const barMaxHeight = large ? 160 : 110;

  return (
    <div className="flex justify-center relative" style={{ width: '100%', maxWidth: chartWidth, margin: '0 auto' }}>
      {interactive && tooltip.Tooltip}
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="rounded-lg bg-white/5 w-full h-auto"
      >
        <defs>
          <linearGradient id="popularityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
        </defs>
        {bins.map((count, i) => {
          const stubHeight = 4;
          const barHeight = count > 0 ? Math.max(stubHeight, (count / maxBin) * barMaxHeight) : stubHeight;
          return (
          <g key={i}>
            <motion.rect
              x={i * (chartWidth / 10) + 12}
              width={24}
              fill={chartColors[i]}
              opacity={count > 0 ? 0.85 : 0.25}
              rx={6}
              initial={{ height: 0, y: chartHeight - 24 }}
              animate={{ height: barHeight, y: chartHeight - barHeight - 24 }}
              transition={{ duration: BAR_DURATION, ease: SIGNATURE_EASE, delay: i * BAR_STAGGER }}
              onMouseEnter={interactive ? e => {
                const tracksInBin = getTracksInBin(tracks, i);
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
              } : undefined}
              onMouseMove={interactive ? tooltip.move : undefined}
              onMouseLeave={interactive ? tooltip.hide : undefined}
            />
          </g>
          );
        })}
      </svg>
    </div>
  );
}
