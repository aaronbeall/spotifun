'use client';

import { useEffect, useRef } from 'react';
import { MUSIC_VIBES } from '@/utils/musicVibes';
import { cn } from '@/utils';

interface VibeGlobeProps {
  className?: string;
  /** How many icons cover the sphere */
  count?: number;
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
 * Canvas 2D with a simple perspective projection: no WebGL or 3D library needed.
 */
export function VibeGlobe({ className, count = 240 }: VibeGlobeProps) {
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

    const points = fibonacciSphere(count, vibes.length);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
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
    const onPointerUp = () => { dragging = false; };
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    let visible = true;
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    intersection.observe(canvas);

    const projected = points.map(() => ({ x: 0, y: 0, z: 0, sprite: 0 }));
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

      const radius = Math.min(width, height) * 0.4;
      const cx = width / 2;
      const cy = height / 2;
      const camera = 3.2;
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

      for (const p of projected) {
        const sprite = sprites[p.sprite];
        if (!sprite) continue;
        const depth = (p.z + 1) / 2; // 0 = far side, 1 = facing us
        const size = baseSize * (camera / (camera - p.z)) * (0.75 + depth * 0.25);
        ctx.globalAlpha = 0.18 + depth * 0.82;
        ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
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
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="A spinning globe covered in Spotifun's fifteen vibe paintings"
      className={cn('block touch-pan-y cursor-grab active:cursor-grabbing', className)}
    />
  );
}
