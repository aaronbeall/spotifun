'use client';

import { useEffect, useRef } from 'react';
import { MUSIC_VIBES } from '@/utils/musicVibes';
import { cn } from '@/utils';

interface VibeGlobeProps {
  className?: string;
}

/** Fewer, bigger icons on small screens: lighter to draw and easier to see */
function iconCountFor(width: number): number {
  if (width < 420) return 140;
  if (width < 700) return 190;
  return 240;
}

interface Point {
  x: number;
  y: number;
  z: number;
  sprite: number;
}

const SPRITE_SIZE = 128;
const TILT = -0.32;

/** Evenly spread points over a unit sphere (Fibonacci lattice) */
function fibonacciSphere(count: number, spriteCount: number): Point[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;
    // Scramble which vibe lands where so neighbors differ
    return { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius, sprite: (i * 7 + Math.floor(i / 3)) % spriteCount };
  });
}

/** '#93c5fd' -> 'rgba(147, 197, 253, a)' */
function rgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/**
 * Wispy coiling strands from an emblem to the cursor: two or three smooth threads that twist
 * around a gently bowed path, like smoke or ribbon. Closeness (`strength`) sets how bright and
 * thick they are; `time` keeps the coils drifting. Strands taper and fade toward the cursor.
 */
function drawWisps(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, mx: number, my: number, strength: number, color: string, time: number, seed: number) {
  const rim = size * 0.45;
  const dist = Math.hypot(mx - x, my - y);
  if (dist <= rim) return;
  const glow = Math.sqrt(strength);
  const ux = (mx - x) / dist;
  const uy = (my - y) / dist;
  const nx = -uy;
  const ny = ux;
  const sx = x + ux * rim;
  const sy = y + uy * rim;
  const length = dist - rim;

  // Each emblem bows its path to one side so neighbouring wisps don't stack
  const bow = length * (0.18 + (seed % 7) * 0.025) * (seed % 2 ? 1 : -1);
  const cxp = (sx + mx) / 2 + nx * bow;
  const cyp = (sy + my) / 2 + ny * bow;
  const coils = 0.8 + Math.min(1.2, length / 180);
  const amplitude = Math.min(size * 0.7, 8 + length * 0.14) * (0.6 + strength * 0.4);
  const strands = strength > 0.45 ? 3 : 2;
  const steps = Math.max(20, Math.min(44, Math.round(length / 5)));

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let k = 0; k < strands; k++) {
    const phase = time * 2.2 + (k * Math.PI * 2) / strands + seed;
    let px = sx;
    let py = sy;
    for (let i = 1; i <= steps; i++) {
      const u = i / steps;
      const inv = 1 - u;
      // Point on the bowed path (quadratic Bezier) and its local normal
      const bx = inv * inv * sx + 2 * inv * u * cxp + u * u * mx;
      const by = inv * inv * sy + 2 * inv * u * cyp + u * u * my;
      const tx = 2 * inv * (cxp - sx) + 2 * u * (mx - cxp);
      const ty = 2 * inv * (cyp - sy) + 2 * u * (my - cyp);
      const tl = Math.hypot(tx, ty) || 1;
      const angle = u * coils * Math.PI * 2 - phase;
      // Coil wraps around the path, pinched at both ends
      const envelope = Math.sin(Math.PI * u) ** 0.8;
      const offset = Math.sin(angle) * amplitude * envelope;
      const qx = bx + (-ty / tl) * offset;
      const qy = by + (tx / tl) * offset;
      // The side of the coil facing us is a little thicker and brighter, which sells the twist
      const facing = 0.55 + 0.45 * Math.cos(angle);
      const taper = 1 - 0.85 * u;
      const fade = glow * (1 - 0.6 * u) * facing;

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(qx, qy);
      ctx.strokeStyle = rgba(color, 0.32 * fade);
      ctx.lineWidth = (4 + strength * 7) * taper * facing;
      ctx.stroke();
      ctx.strokeStyle = rgba(color, Math.min(1, 0.95 * fade));
      ctx.lineWidth = (1 + strength * 2) * taper * facing;
      ctx.stroke();
      px = qx;
      py = qy;
    }
  }

  // Soft glow on the emblem itself
  const haloRadius = size * (0.75 + strength * 0.35);
  const halo = ctx.createRadialGradient(x, y, rim, x, y, haloRadius);
  halo.addColorStop(0, rgba(color, 0.3 * strength));
  halo.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, haloRadius, 0, Math.PI * 2);
  ctx.fill();
}

/** Round icon with a soft colored rim, pre-rendered once so each frame is just drawImage calls */
function makeSprite(image: HTMLImageElement, rim: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SPRITE_SIZE;
  const ctx = canvas.getContext('2d')!;
  const r = SPRITE_SIZE / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(r, r, r - 3, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(image, 0, 0, SPRITE_SIZE, SPRITE_SIZE);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(r, r, r - 3, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = rim;
  ctx.stroke();
  return canvas;
}

/**
 * A dense, slowly spinning sphere tiled with the vibe paintings. Drag to spin it.
 * Emblems near the cursor (or a finger, while touching) lean toward it and throw
 * wispy coiling strands in their own colour, stronger the closer it gets.
 * Canvas 2D with a simple perspective projection: no WebGL or 3D library needed.
 */
export function VibeGlobe({ className }: VibeGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const vibes = MUSIC_VIBES.filter(v => v.image);
    const sprites: (HTMLCanvasElement | null)[] = vibes.map(() => null);
    vibes.forEach((vibe, i) => {
      const img = new Image();
      img.onload = () => { sprites[i] = makeSprite(img, vibe.color.light); };
      img.src = vibe.image!;
    });

    const count = iconCountFor(canvas.getBoundingClientRect().width);
    const points = fibonacciSphere(count, vibes.length);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      // Phones have dense screens but small GPUs; 1.5x is plenty for these icons
      dpr = Math.min(window.devicePixelRatio || 1, width < 640 ? 1.5 : 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    let angle = 0.6;
    let velocity = reducedMotion ? 0 : 0.22; // radians per second
    const idleVelocity = velocity;
    let tilt = TILT;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastMoveTime = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      lastMoveTime = performance.now();
      canvas.setPointerCapture(e.pointerId);
      onWindowPointerMove(e);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const delta = dx / Math.max(width, 1) * Math.PI * 1.6;
      angle += delta;
      tilt = Math.max(-1.1, Math.min(1.1, tilt + dy / Math.max(height, 1) * 2));
      velocity = delta / Math.max((now - lastMoveTime) / 1000, 0.016);
      lastX = e.clientX;
      lastY = e.clientY;
      lastMoveTime = now;
    };
    const onPointerUp = (e: PointerEvent) => {
      dragging = false;
      // Fingers don't hover, so the effect ends when the finger lifts
      if (e.pointerType !== 'mouse') pointer.active = false;
    };
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    // Where the cursor is, in canvas coordinates. Tracked on the window so emblems react as the
    // cursor approaches from outside the globe.
    const pointer = { x: 0, y: 0, active: false };
    const onWindowPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && !dragging) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onWindowPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) pointer.active = false; // cursor left the window
    };
    window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
    window.addEventListener('pointerout', onWindowPointerOut);

    let visible = true;
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    intersection.observe(canvas);

    const projected = points.map((_, index) => ({ x: 0, y: 0, z: 0, sprite: 0, index }));
    // Per-emblem cursor influence (0..1), eased so emblems glide in and out of the effect
    const influence = new Float32Array(points.length);
    const maxWisps = width < 640 ? 4 : 8;
    const charged: { x: number; y: number; size: number; strength: number; sprite: number; index: number }[] = [];
    let frame = 0;
    let last = performance.now();

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible || width === 0) return;

      if (!dragging) {
        // Ease back toward the idle spin and resting tilt after a fling
        velocity += (idleVelocity - velocity) * Math.min(dt * 1.5, 1);
        tilt += (TILT - tilt) * Math.min(dt * 0.8, 1);
        angle += velocity * dt;
      }

      const radius = Math.min(width, height) * 0.38;
      const cx = width / 2;
      const cy = height / 2;
      // Camera distance in sphere radii: closer means stronger perspective
      const camera = 2.6;
      const cosA = Math.cos(angle), sinA = Math.sin(angle);
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
      // Icon size that just about tiles the sphere surface
      const baseSize = radius * Math.sqrt((4 * Math.PI) / count) * 1.02;

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const x1 = p.x * cosA + p.z * sinA;
        const z1 = -p.x * sinA + p.z * cosA;
        const y2 = p.y * cosT - z1 * sinT;
        const z2 = p.y * sinT + z1 * cosT;
        const scale = camera / (camera - z2);
        const out = projected[i];
        out.x = cx + x1 * radius * scale;
        out.y = cy + y2 * radius * scale;
        out.z = z2;
        out.sprite = p.sprite;
        out.index = i;
      }
      projected.sort((a, b) => a.z - b.z);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Core glow so the gaps between icons read as light, not holes
      const glow = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.35);
      glow.addColorStop(0, 'rgba(192, 132, 252, 0.45)');
      glow.addColorStop(0.6, 'rgba(139, 92, 246, 0.18)');
      glow.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      const reach = radius * 0.9;
      const ease = Math.min(dt * 8, 1);
      charged.length = 0;

      for (const p of projected) {
        const depth = (p.z + 1) / 2; // 0 = far side, 1 = facing us

        // Cursor proximity: only emblems on the near side react
        let target = 0;
        if (pointer.active && depth > 0.45) {
          const closeness = Math.max(0, 1 - Math.hypot(pointer.x - p.x, pointer.y - p.y) / reach);
          target = closeness ** 1.4 * Math.min(1, (depth - 0.45) / 0.3);
        }
        const strength = (influence[p.index] += (target - influence[p.index]) * ease);
        // Lean toward the cursor
        const x = p.x + (pointer.x - p.x) * strength * 0.22;
        const y = p.y + (pointer.y - p.y) * strength * 0.22;

        const sprite = sprites[p.sprite];
        if (!sprite) continue;
        // Scale by distance: badges facing us are biggest, the far side shrinks to specks.
        // Even up front they stay a bit smaller than their spacing, so there's room between them.
        const size = baseSize * (camera / (camera - p.z)) * (0.28 + depth * 0.47) * (1 + strength * 0.12);
        ctx.globalAlpha = 0.15 + depth * 0.85;
        ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
        if (strength > 0.03) charged.push({ x, y, size, strength, sprite: p.sprite, index: p.index });
      }
      ctx.globalAlpha = 1;

      if (charged.length > 0) {
        charged.sort((a, b) => b.strength - a.strength);
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < Math.min(charged.length, maxWisps); i++) {
          const c = charged[i];
          drawWisps(ctx, c.x, c.y, c.size, pointer.x, pointer.y, c.strength, vibes[c.sprite].color.light, now / 1000, c.index);
        }
        ctx.globalCompositeOperation = 'source-over';
      }
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerout', onWindowPointerOut);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="A spinning globe covered in Spotifun's fifteen vibe paintings"
      className={cn('block touch-pan-y cursor-grab active:cursor-grabbing', className)}
    />
  );
}
