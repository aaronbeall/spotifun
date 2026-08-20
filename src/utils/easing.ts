// The project's signature "aggressive yet smooth" ease-out curve — fast
// initial motion that settles gently, no overshoot. Use this for
// entrance/reveal animations throughout the app (framer-motion `ease`
// arrays can use SIGNATURE_EASE directly; D3 transitions need a plain
// (t) => number function, see signatureEaseFn()).
export const SIGNATURE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Evaluates a CSS-style cubic-bezier(p1x, p1y, p2x, p2y) timing function.
// Framer-motion accepts the four control points directly as an `ease` array,
// but D3 transitions (`.ease()`) need an actual (t: number) => number
// function, so this converts between the two.
export function cubicBezierEase(p1x: number, p1y: number, p2x: number, p2y: number) {
  const cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx;
  const cy = 3 * p1y, by = 3 * (p2y - p1y) - cy, ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  function solveX(x: number) {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const dx = sampleX(t) - x;
      const d = sampleDerivativeX(t);
      if (Math.abs(dx) < 1e-6 || d === 0) break;
      t -= dx / d;
    }
    let lo = 0, hi = 1;
    t = Math.min(Math.max(t, 0), 1);
    for (let i = 0; i < 20 && Math.abs(sampleX(t) - x) > 1e-6; i++) {
      if (sampleX(t) < x) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return t;
  }

  return (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : sampleY(solveX(x)));
}

// D3-ready ease function for the project's signature curve.
export function signatureEaseFn() {
  return cubicBezierEase(...SIGNATURE_EASE);
}

// A more extreme "long dwell near the ends, fast wipe through the middle"
// curve, used for slower wipe/reveal effects — e.g. the Genre Spectrum
// wave-fan reveal and the Flow streamgraph reveal.
export const WAVE_REVEAL_EASE: [number, number, number, number] = [0.83, 0.12, 0.17, 0.88];

// D3-ready ease function for the wave-reveal curve.
export function waveRevealEaseFn() {
  return cubicBezierEase(...WAVE_REVEAL_EASE);
}
