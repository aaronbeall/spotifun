// Deterministic seeded generative art helpers: turn a string id + a 0-1
// "profile" (valence/arousal/complexity/rawness/socialPresence-style values)
// into a reproducible abstract blob composition. Same seed + profile always
// renders the same art.

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededRng(seed: string): () => number {
  let state = hashSeed(seed) || 1;
  return function mulberry32() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function catmullRomClosed(points: Array<[number, number]>): string {
  const n = points.length;
  let d = `M ${points[0][0]},${points[0][1]} `;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]} `;
  }
  return d + 'Z';
}

export function generateBlobPath(opts: {
  points: number;
  radius: number;
  irregularity: number;
  rng: () => number;
  cx?: number;
  cy?: number;
}): string {
  const { points, radius, irregularity, rng, cx = 50, cy = 50 } = opts;
  const angleStep = (Math.PI * 2) / points;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < points; i++) {
    const angle = i * angleStep + (rng() - 0.5) * angleStep * 0.3;
    const r = radius * (1 - irregularity / 2 + rng() * irregularity);
    pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }
  return catmullRomClosed(pts);
}

export interface ArtProfile {
  valence: number;
  arousal: number;
  complexity: number;
  rawness: number;
  socialPresence: number;
}

export interface ArtLayer {
  path: string;
  opacity: number;
}

export function generateArtLayers(seed: string, profile: ArtProfile): ArtLayer[] {
  const { arousal, complexity, rawness, socialPresence } = profile;
  const rng = seededRng(seed);

  const layerCount = 2 + Math.round(complexity * 3);
  const pointCount = 5 + Math.round(rawness * 5);
  const irregularity = 0.15 + rawness * 0.5;
  const baseRadius = 24 + arousal * 16;
  const spread = socialPresence * 18;

  return Array.from({ length: layerCount }, (_, i) => {
    const angle = rng() * Math.PI * 2;
    const dist = (i / Math.max(layerCount - 1, 1)) * spread;
    const cx = 50 + Math.cos(angle) * dist;
    const cy = 50 + Math.sin(angle) * dist;
    const radius = baseRadius * (1 - i * 0.12);
    const path = generateBlobPath({ points: pointCount, radius, irregularity, rng, cx, cy });
    return { path, opacity: 0.9 - i * (0.5 / layerCount) };
  });
}
