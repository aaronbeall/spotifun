import { useRef, useEffect, useMemo } from "react";
import * as d3 from "d3";
import { VACRSScore } from '@/types';
import { calculateGenreVACRSScore, calculateVACRSScoreMatch } from '@/utils/musicClassification';
import { VACRS_DIMENSIONS, VACRS_COLORS } from '@/utils/vacrs';
import { MUSIC_VIBES } from '@/utils/musicVibes';
import { getGenreColor } from '@/utils/format';
import { darkenHex } from '@/utils/color';

export type FlowChartMode = 'genres' | 'traits' | 'vibes';

export const GENRE_TRACK_COUNT = 5;

// Light-fraction range for the Vibes rank-based light/dark split: the
// dominant vibe at a given moment gets close to VIBE_LIGHT_MAX, the most
// recessive gets close to VIBE_LIGHT_MIN, with others interpolated between.
const VIBE_LIGHT_MAX = 0.9;
const VIBE_LIGHT_MIN = 0.2;

export interface FlowTrack {
  playedAt: string;
  genres: string[];
  track?: string;
  artist?: string;
}

// The N most frequently-tagged genres across the given plays, most common first.
export function getTopGenres(tracks: FlowTrack[], n: number = GENRE_TRACK_COUNT): string[] {
  const counts = new Map<string, number>();
  tracks.forEach(t => {
    (t.genres || []).forEach(g => counts.set(g, (counts.get(g) || 0) + 1));
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([genre]) => genre);
}

export function getFlowData(tracks: FlowTrack[], mode: FlowChartMode = 'traits') {
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

  if (mode === 'genres') {
    const topGenres = getTopGenres(sortedTracks);
    const runningPresence = topGenres.map(() => 0);

    return rawData.map((row, idx) => {
      const trackGenres = sortedTracks[idx].genres || [];
      const result = { ...row } as typeof row & Record<string, number>;
      topGenres.forEach((genre, i) => {
        const present = trackGenres.includes(genre) ? 1 : 0;
        // Smooth with a running average so the stream reads as a trend, not noise
        runningPresence[i] = runningPresence[i] * 0.7 + present * 0.3;
        result[`genre_${i}`] = runningPresence[i];
      });
      return result;
    });
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
        (result as Record<string, unknown>)[`vibe_${i}_light`] = 0;
        (result as Record<string, unknown>)[`vibe_${i}_dark`] = 0;
      });

      // Set only top 3 vibes with normalized values, split into a light and
      // dark portion based on each vibe's rank at this moment: the dominant
      // (top) vibe reads as mostly light, the most recessive (bottom of the
      // top 3) reads as mostly dark, with the middle one in between.
      top3.forEach((vibeMatch, rank) => {
        const lightFraction = top3.length > 1
          ? VIBE_LIGHT_MAX - (rank / (top3.length - 1)) * (VIBE_LIGHT_MAX - VIBE_LIGHT_MIN)
          : VIBE_LIGHT_MAX;
        // Normalize: (value - min) / range
        const normalizedValue = matchRange > 0 ? (vibeMatch.match - minMatch) / matchRange : 0;
        const key = `vibe_${vibeMatch.vibeIndex}`;
        (result as Record<string, unknown>)[`${key}_light`] = normalizedValue * lightFraction;
        (result as Record<string, unknown>)[`${key}_dark`] = normalizedValue * (1 - lightFraction);
      });

      vibesData.push(result);
    });
    return vibesData;
  }

  // traits: streams vary independently based on distance from 0.5
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

export function getFlowDimensionsAndColors(chartMode: FlowChartMode, tracks: FlowTrack[] = []) {
  if (chartMode === 'genres') {
    const topGenres = getTopGenres(tracks);
    return {
      dimensions: topGenres.map((_, i) => `genre_${i}`),
      // Same per-genre color used for genre badges/tags elsewhere in the app
      colors: topGenres.map(genre => getGenreColor(genre).color),
    };
  }

  if (chartMode === 'vibes') {
    return {
      dimensions: MUSIC_VIBES.flatMap((_, i) => [`vibe_${i}_light`, `vibe_${i}_dark`]),
      // Use each vibe's own light/dark theme colors (the same pair used on vibe badges elsewhere)
      colors: MUSIC_VIBES.flatMap(vibe => [vibe.color.light, vibe.color.dark]),
    };
  }

  // traits
  return {
    dimensions: VACRS_DIMENSIONS.flatMap(dim => [`${dim}_light`, `${dim}_dark`]),
    colors: VACRS_DIMENSIONS.flatMap(dim => {
      const baseColor = VACRS_COLORS[dim];
      return [baseColor, darkenHex(baseColor, 0.5)];
    }),
  };
}

interface FlowStreamChartProps {
  tracks: FlowTrack[];
  chartMode?: FlowChartMode;
  width?: number;
  height?: number;
  onHover?: (idx: number | null, x: number, y: number) => void;
}

// The core D3 stream-graph visual, extracted so it can be reused both in the
// live interactive Flow card and in the static share graphic.
export function FlowStreamChart({ tracks, chartMode = 'traits', width = 420, height = 340, onHover }: FlowStreamChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const verticalPadding = 72;

  const { dimensions, colors } = useMemo(() => getFlowDimensionsAndColors(chartMode, tracks), [chartMode, tracks]);

  // Keep the latest onHover in a ref so the draw effect below doesn't need to
  // depend on it directly — onHover is a new function identity on every parent
  // render (it calls setState), and including it in the deps array caused the
  // chart (and its hover listeners) to be torn down and rebuilt on every
  // mousemove, which could drop the mouseleave binding and strand the tooltip.
  const onHoverRef = useRef(onHover);
  useEffect(() => {
    onHoverRef.current = onHover;
  }, [onHover]);

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

    if (onHoverRef.current) {
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
          onHoverRef.current?.(idx, x(idx), event.offsetY);
          d3.select(this).attr("fill", "#64748b22"); // subtle slate hover
        })
        .on("mouseleave", function() {
          onHoverRef.current?.(null, 0, 0);
          d3.select(this).attr("fill", "transparent");
        });
    }
  }, [tracks, chartMode, colors, dimensions, width, height]);

  if (!tracks?.length) return null;

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="rounded-lg bg-white/5"
      preserveAspectRatio="none"
    />
  );
}
