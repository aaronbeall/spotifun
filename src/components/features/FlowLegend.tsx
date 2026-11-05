import type { CSSProperties } from 'react';
import { RotateCcw } from 'lucide-react';
import { VACRS_DIMENSIONS, VACRS_RANGE_LABELS } from '@/utils/vacrs';
import { MUSIC_VIBES } from '@/utils/musicVibes';
import { FlowChartMode, FlowTrack, GENRE_TRACK_COUNT, getFlowData, getFlowDimensionsAndColors, getTopGenres } from './FlowStreamChart';

interface FlowLegendProps {
  tracks: FlowTrack[];
  chartMode: FlowChartMode;
  /** Genres drawn so far. Omitted on the static share graphic, which stays at the first five. */
  genreCount?: number;
  hidden?: ReadonlySet<string>;
  onToggle?: (id: string) => void;
  /** Present when more genres exist than `genreCount`. */
  onMore?: () => void;
  /** Present once more than the first five genres are loaded. */
  onReset?: () => void;
}

function LegendItem({
  id,
  hidden,
  onToggle,
  className,
  style,
  children,
}: {
  id: string;
  hidden?: boolean;
  onToggle?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
}) {
  const classes = `flex items-center gap-1.5 text-xs rounded-full px-1.5 py-0.5 ${hidden ? 'opacity-35' : ''} ${className ?? ''}`;
  if (!onToggle) {
    return <span className={classes} style={style}>{children}</span>;
  }
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      aria-pressed={!hidden}
      className={`${classes} hover:bg-white/10`}
      style={style}
    >
      {children}
    </button>
  );
}

// The legend for the Flow streamgraph, extracted so it can be reused both in
// the live interactive Flow card and in the static share graphic.
export function FlowLegend({ tracks, chartMode, genreCount = GENRE_TRACK_COUNT, hidden, onToggle, onMore, onReset }: FlowLegendProps) {
  const { colors } = getFlowDimensionsAndColors(chartMode, tracks, genreCount);
  const topGenres = getTopGenres(tracks, genreCount);

  if (!tracks?.length) return null;

  if (chartMode === 'vibes') {
    const flowData = getFlowData(tracks, chartMode, genreCount);
    const appearedVibeIndices = new Set<number>();
    flowData.forEach(row => {
      const rowData = row as unknown as { matchedVibes?: Array<{ vibeId: string; match: number; vibeIndex: number }> };
      const matchedVibes = rowData.matchedVibes || [];
      const topVibes = [...matchedVibes].sort((a, b) => b.match - a.match).slice(0, 3);
      topVibes.forEach(vm => appearedVibeIndices.add(vm.vibeIndex));
    });

    return (
      <div className="flex gap-3 justify-center flex-wrap">
        {MUSIC_VIBES.map((vibe, i) => {
          if (!appearedVibeIndices.has(i)) return null;
          const id = `vibe:${vibe.id}`;
          return (
            <LegendItem key={vibe.id} id={id} hidden={hidden?.has(id)} onToggle={onToggle} style={{ color: colors[i] }}>
              <span
                className="inline-block w-4 h-4 rounded-full overflow-hidden ring-1 ring-white/20 shrink-0"
                style={{ boxShadow: `0 0 4px ${colors[i]}80` }}
              >
                {vibe.image ? (
                  <img src={vibe.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="block w-full h-full" style={{ background: colors[i] }} />
                )}
              </span>
              {vibe.name}
            </LegendItem>
          );
        })}
      </div>
    );
  }

  if (chartMode === 'genres') {
    return (
      <div className="flex gap-3 justify-center flex-wrap">
        {topGenres.map((genre, i) => {
          const id = `genre:${genre}`;
          return (
            <LegendItem key={genre} id={id} hidden={hidden?.has(id)} onToggle={onToggle} style={{ color: colors[i] }}>
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: colors[i] }}></span>
              {genre}
            </LegendItem>
          );
        })}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            aria-label="Reset to 5 genres"
            title="Reset to 5 genres"
            className="inline-flex items-center justify-center rounded-full border border-white/15 p-1 text-gray-300 hover:border-white/40 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
        {onMore && (
          <button
            type="button"
            onClick={onMore}
            className="rounded-full border border-white/15 px-2.5 py-0.5 text-xs text-gray-300 hover:border-white/40 hover:text-white"
          >
            More
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-3 justify-center flex-wrap">
      {VACRS_DIMENSIONS.map((dim, i) => {
        const baseColorIndex = i * 2;
        const lightColor = colors[baseColorIndex];
        const darkColor = colors[baseColorIndex + 1];
        const [lowLabel, highLabel] = VACRS_RANGE_LABELS[dim];
        const id = `trait:${dim}`;
        return (
          <LegendItem key={dim} id={id} hidden={hidden?.has(id)} onToggle={onToggle}>
            <span className="inline-flex gap-0.5">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: lightColor }}></span>
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: darkColor }}></span>
            </span>
            <span style={{ color: lightColor }}>{highLabel}</span>
            <span style={{ color: darkColor }}>{lowLabel}</span>
          </LegendItem>
        );
      })}
    </div>
  );
}
