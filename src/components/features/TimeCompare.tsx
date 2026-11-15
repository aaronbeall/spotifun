import { EraSnapshot } from '@/types';
import { ShiftMetric, ViewSnapshot } from '@/utils/listeningFacts';

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

export function TimeCompare({
  current,
  eras,
  standout,
}: {
  current: ViewSnapshot;
  eras: EraSnapshot[];
  standout: ShiftMetric | null;
}) {
  const visible = eras.filter(era => era.artists > 0 || era.tracks > 0);

  return (
    <div className="w-full max-w-3xl">
      <div className="space-y-5">
        {LANES.map(lane => {
          const featured = standout === lane.key;
          return (
            <div key={lane.key} className={featured ? 'rounded-2xl bg-white/5 p-3' : ''}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{lane.label}</span>
                  {featured && (
                    <span className="rounded-full bg-rose-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-200">
                      The gap
                    </span>
                  )}
                </div>
                {current.plot && (
                  <span className="text-sm font-semibold tabular-nums" style={{ color: CURRENT_COLOR }}>
                    {lane.format(current)}
                  </span>
                )}
              </div>
              <div className="relative h-8">
                <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/10" />
                {current.plot && (
                  <div
                    className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full"
                    style={{
                      width: clampPercent(lane.position(current)),
                      background: `linear-gradient(90deg, ${CURRENT_COLOR}33, ${CURRENT_COLOR})`,
                    }}
                  />
                )}
                {visible.map(era => (
                  <span
                    key={era.timeRange}
                    className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[#111827]"
                    style={{ left: clampPercent(lane.position(era)), background: ERA_COLOR[era.timeRange] }}
                    title={`${era.label}: ${lane.format(era)}`}
                  />
                ))}
                {current.plot && (
                  <span
                    className="absolute top-1/2 z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[3px] ring-2 ring-[#111827]"
                    style={{
                      left: clampPercent(lane.position(current)),
                      background: CURRENT_COLOR,
                      boxShadow: `0 0 8px ${CURRENT_COLOR}`,
                    }}
                    title={`${current.label}: ${lane.format(current)}`}
                  />
                )}
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-gray-400">
                <span>{lane.low}</span>
                <span>{lane.high}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-xs text-gray-200">
          <span className="inline-block h-2.5 w-2.5 rotate-45 rounded-[2px]" style={{ background: CURRENT_COLOR }} />
          {current.label}
        </span>
        {visible.map(era => (
          <span key={era.timeRange} className="inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-xs text-gray-200">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: ERA_COLOR[era.timeRange] }} />
            {era.label}
          </span>
        ))}
      </div>
    </div>
  );
}
