import { VACRS_DIMENSIONS, VACRS_RANGE_LABELS } from '@/utils/vacrs';
import { MUSIC_VIBES } from '@/utils/musicVibes';
import { FlowChartMode, FlowTrack, getFlowData, getFlowDimensionsAndColors, getTopGenres } from './FlowStreamChart';

interface FlowLegendProps {
  tracks: FlowTrack[];
  chartMode: FlowChartMode;
}

// The legend for the Flow streamgraph, extracted so it can be reused both in
// the live interactive Flow card and in the static share graphic.
export function FlowLegend({ tracks, chartMode }: FlowLegendProps) {
  const { colors } = getFlowDimensionsAndColors(chartMode, tracks);
  const topGenres = getTopGenres(tracks);

  if (!tracks?.length) return null;

  if (chartMode === 'vibes') {
    const flowData = getFlowData(tracks, chartMode);
    // Get unique vibe indices that appear in top 3 across all data
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
          return (
            <span key={vibe.id} className="flex items-center gap-1.5 text-xs" style={{ color: colors[i] }}>
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
            </span>
          );
        })}
      </div>
    );
  }

  if (chartMode === 'genres') {
    return (
      <div className="flex gap-3 justify-center flex-wrap">
        {topGenres.map((genre, i) => (
          <span key={genre} className="flex items-center gap-1.5 text-xs" style={{ color: colors[i] }}>
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: colors[i] }}></span>
            {genre}
          </span>
        ))}
      </div>
    );
  }

  // traits
  return (
    <div className="flex gap-3 justify-center flex-wrap">
      {VACRS_DIMENSIONS.map((dim, i) => {
        const baseColorIndex = i * 2;
        const lightColor = colors[baseColorIndex];
        const darkColor = colors[baseColorIndex + 1];
        const [lowLabel, highLabel] = VACRS_RANGE_LABELS[dim];
        return (
          <span key={dim} className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex gap-0.5">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: lightColor }}></span>
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: darkColor }}></span>
            </span>
            <span style={{ color: lightColor }}>{highLabel}</span>
            <span style={{ color: darkColor }}>{lowLabel}</span>
          </span>
        );
      })}
    </div>
  );
}
