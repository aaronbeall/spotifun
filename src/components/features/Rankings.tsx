'use client';

import { useEffect, useMemo, useState } from 'react';
import { History } from 'lucide-react';
import { EraSnapshot, ErasResponse, Stats } from '@/types';
import {
  currentViewSnapshot,
  readShift,
  type ShiftMetric,
  type ViewSnapshot,
} from '@/utils/listeningFacts';
import { noteApiCall } from '@/lib/records/observe';

interface RankingsProps {
  stats: Stats;
}

const ERA_COLOR: Record<EraSnapshot['timeRange'], string> = {
  short_term: '#67e8f9',
  medium_term: '#c4b5fd',
  long_term: '#fbbf24',
};

const CURRENT_COLOR = '#fb7185';

const LANES: {
  key: ShiftMetric;
  label: string;
  low: string;
  high: string;
  position: (snapshot: ViewSnapshot | EraSnapshot) => number;
  format: (snapshot: ViewSnapshot | EraSnapshot) => string;
}[] = [
  {
    key: 'popularity',
    label: 'Popularity',
    low: 'Niche',
    high: 'Mainstream',
    position: item => item.popularity / 100,
    format: item => String(Math.round(item.popularity)),
  },
  {
    key: 'genreDiversity',
    label: 'Genre spread',
    low: 'Focused',
    high: 'Eclectic',
    position: item => item.genreDiversity,
    format: item => `${Math.round(item.genreDiversity * 100)}%`,
  },
  {
    key: 'valence',
    label: 'Mood',
    low: 'Darker',
    high: 'Brighter',
    position: item => item.valence,
    format: item => item.valence.toFixed(2),
  },
  {
    key: 'arousal',
    label: 'Energy',
    low: 'Calm',
    high: 'Energetic',
    position: item => item.arousal,
    format: item => item.arousal.toFixed(2),
  },
];

function clampPercent(value: number): string {
  return `${Math.min(100, Math.max(0, value * 100))}%`;
}

export default function Rankings({ stats }: RankingsProps) {
  const current = useMemo(() => currentViewSnapshot(stats), [stats]);
  const [eras, setEras] = useState<EraSnapshot[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats/eras')
      .then(response => {
        if (response.ok) noteApiCall('eras', true);
        if (!response.ok) throw new Error('eras failed');
        return response.json() as Promise<ErasResponse>;
      })
      .then(data => {
        if (!cancelled) setEras(data.eras);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const shift = eras ? readShift(current, eras, stats) : null;

  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-lg sm:p-8">
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
          <History className="h-6 w-6 text-cyan-300" />
          You, over time
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-400">
          The diamond is the source selected above. The dots are your top tracks and top artists in each
          Spotify period, without Last.fm.
        </p>
      </div>

      {failed && (
        <p className="text-sm text-gray-400">Spotify didn&apos;t return the other time ranges.</p>
      )}

      {!failed && !eras && (
        <div className="space-y-3" aria-hidden>
          {LANES.map(lane => (
            <div key={lane.key} className="h-16 animate-pulse rounded-full bg-gray-900/80" />
          ))}
        </div>
      )}

      {eras && !shift && (
        <p className="text-sm text-gray-400">Spotify has no top artists or tracks for these periods yet.</p>
      )}

      {shift && eras && (
        <>
          <p
            className={
              shift.standout
                ? 'mb-8 max-w-3xl text-2xl font-black italic leading-snug text-white'
                : 'mb-8 max-w-3xl text-lg leading-snug text-gray-300'
            }
          >
            {shift.sentence}
          </p>

          <div className="space-y-6">
            {LANES.map(lane => {
              const featured = shift.standout === lane.key;
              return (
                <div
                  key={lane.key}
                  className={featured ? 'rounded-2xl bg-rose-950/40 p-4 ring-1 ring-rose-400/50' : ''}
                >
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{lane.label}</span>
                      {featured && (
                        <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-rose-200">
                          The gap
                        </span>
                      )}
                    </div>
                    {current.plot && (
                      <span className="font-mono text-sm text-rose-200">{lane.format(current)}</span>
                    )}
                  </div>
                  <div className="relative h-12 rounded-full bg-gray-950/80">
                    <div className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-white/15" />
                    {eras.filter(era => era.artists > 0 || era.tracks > 0).map(era => (
                      <span
                        key={era.timeRange}
                        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-gray-950"
                        style={{ left: clampPercent(lane.position(era)), background: ERA_COLOR[era.timeRange] }}
                        title={`${era.label}: ${lane.format(era)}`}
                      />
                    ))}
                    {current.plot && (
                      <span
                        className="absolute top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[3px] ring-2 ring-gray-950"
                        style={{ left: clampPercent(lane.position(current)), background: CURRENT_COLOR }}
                        title={`${current.label}: ${lane.format(current)}`}
                      />
                    )}
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] uppercase tracking-widest text-gray-500">
                    <span>{lane.low}</span>
                    <span>{lane.high}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-300">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rotate-45 rounded-[2px]" style={{ background: CURRENT_COLOR }} />
              {current.label}
            </span>
            {eras.filter(era => era.artists > 0 || era.tracks > 0).map(era => (
              <span key={era.timeRange} className="inline-flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: ERA_COLOR[era.timeRange] }} />
                {era.label}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
