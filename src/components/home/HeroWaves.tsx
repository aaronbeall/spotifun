'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { cn } from '@/utils';

interface HeroWavesProps {
  className?: string;
  /** The waves run through the vertical center of this element (the globe) */
  anchorRef?: RefObject<HTMLElement | null>;
}

const WAVES = [
  { hue: 275, amp: 0.16, freq: 1.3, speed: 0.55, width: 2.5, offset: 0 },
  { hue: 315, amp: 0.12, freq: 2.1, speed: -0.8, width: 2, offset: 1.7 },
  { hue: 190, amp: 0.1, freq: 2.9, speed: 1.05, width: 1.5, offset: 3.1 },
  { hue: 145, amp: 0.08, freq: 3.7, speed: -1.3, width: 1.2, offset: 4.4 },
  { hue: 45, amp: 0.06, freq: 4.6, speed: 1.6, width: 1, offset: 5.9 },
];

/** Smooth pseudo-audio level for bar `i` of `bars` at time `t`: a few layered sines, 0..1 */
function level(i: number, bars: number, t: number): number {
  const x = i / bars;
  const v =
    Math.sin(x * 9 + t * 2.1) * 0.35 +
    Math.sin(x * 23 - t * 3.3 + 1.3) * 0.25 +
    Math.sin(x * 4 + t * 0.7 + 2.1) * 0.25 +
    Math.sin(t * 5.7 + i * 1.7) * 0.15;
  // Louder in the middle, like a real spectrum's mids
  const envelope = 0.45 + 0.55 * Math.sin(Math.PI * x);
  return Math.max(0.04, ((v + 1) / 2) * envelope);
}

/**
 * Background for the hero: glowing sine ribbons that wobble and drift through the
 * spectrum, over a mirrored equalizer. Purely decorative.
 */
export function HeroWaves({ className, anchorRef }: HeroWavesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let small = false;
    let horizon = 0;
    let span = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const anchor = anchorRef?.current?.getBoundingClientRect();
      horizon = anchor ? anchor.top + anchor.height / 2 - rect.top : rect.height * 0.55;
      // Wave and bar heights follow the anchor's size so they hug the globe on any screen
      span = anchor ? anchor.height * 1.1 : rect.height * 0.6;
      width = rect.width;
      height = rect.height;
      small = width < 640;
      dpr = small ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      if (reducedMotion) draw(performance.now());
    };

    let visible = true;
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    intersection.observe(canvas);

    const start = performance.now();
    let frame = 0;

    function draw(now: number) {
      if (!ctx || width === 0) return;
      const t = (now - start) / 1000;
      const hueShift = (t * 12) % 360;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      // Equalizer, mirrored around the horizon line
      const bars = small ? 36 : 72;
      const barGap = width / bars;
      const barWidth = barGap * 0.55;
      for (let i = 0; i < bars; i++) {
        const h = level(i, bars, t) * span * 0.5;
        const x = i * barGap + (barGap - barWidth) / 2;
        const hue = (260 + (i / bars) * 120 + hueShift) % 360;
        const up = ctx.createLinearGradient(0, horizon - h, 0, horizon);
        up.addColorStop(0, `hsla(${hue}, 95%, 65%, 0)`);
        up.addColorStop(1, `hsla(${hue}, 95%, 60%, 0.28)`);
        ctx.fillStyle = up;
        ctx.fillRect(x, horizon - h, barWidth, h);
        const down = ctx.createLinearGradient(0, horizon, 0, horizon + h * 0.6);
        down.addColorStop(0, `hsla(${hue}, 95%, 60%, 0.12)`);
        down.addColorStop(1, `hsla(${hue}, 95%, 60%, 0)`);
        ctx.fillStyle = down;
        ctx.fillRect(x, horizon, barWidth, h * 0.6);
      }

      // Sine ribbons: a wide faint pass for glow, then a thin bright line
      const steps = Math.max(48, Math.round(width / (small ? 10 : 8)));
      const waves = small ? WAVES.slice(0, 3) : WAVES;
      for (const wave of waves) {
        const hue = (wave.hue + hueShift) % 360;
        const breathe = 0.7 + 0.3 * Math.sin(t * 0.9 + wave.offset);
        const path = new Path2D();
        for (let s = 0; s <= steps; s++) {
          const u = s / steps;
          const x = u * width;
          const taper = Math.sin(Math.PI * u);
          const y = horizon
            + Math.sin(u * Math.PI * 2 * wave.freq + t * wave.speed + wave.offset) * span * wave.amp * 1.6 * breathe * taper
            + Math.sin(u * Math.PI * 7 - t * 1.7 + wave.offset) * span * 0.03 * taper;
          if (s === 0) path.moveTo(x, y);
          else path.lineTo(x, y);
        }
        ctx.lineCap = 'round';
        ctx.strokeStyle = `hsla(${hue}, 95%, 60%, 0.08)`;
        ctx.lineWidth = wave.width * 10;
        ctx.stroke(path);
        ctx.strokeStyle = `hsla(${hue}, 95%, 70%, 0.55)`;
        ctx.lineWidth = wave.width;
        ctx.stroke(path);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    if (anchorRef?.current) resizeObserver.observe(anchorRef.current);

    if (!reducedMotion) {
      let lastDraw = 0;
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop);
        // ~30fps on phones is smooth enough for slow waves and saves battery
        if (!visible || (small && now - lastDraw < 32)) return;
        lastDraw = now;
        draw(now);
      };
      frame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
    };
  }, [anchorRef]);

  return <canvas ref={canvasRef} aria-hidden className={cn('pointer-events-none block', className)} />;
}
