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
/** How long released particles take to fade out, in seconds */
const FADE_OUT = 1.6;
/** Released particles settle to this speed, in px per second */
const DRIFT_SPEED = 28;

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

/** A mote of light that leaves an emblem and falls toward the cursor */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  /** Seconds since the cursor let go of it; it coasts and fades out */
  free: number;
  size: number;
  color: string;
}

/** Soft glow on an emblem the cursor is near, in its own colour */
function drawHalo(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, strength: number, color: string) {
  const inner = size * 0.45;
  const outer = size * (0.75 + strength * 0.35);
  const halo = ctx.createRadialGradient(x, y, inner, x, y, outer);
  halo.addColorStop(0, rgba(color, 0.3 * strength));
  halo.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, outer, 0, Math.PI * 2);
  ctx.fill();
}

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
 * particles in their own colour that fall toward it, faster the closer it gets.
 * Canvas 2D with a simple perspective projection: no WebGL or 3D library needed.
 */
export function VibeGlobe({ className }: VibeGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;
    const ctx = canvas.getContext('2d');
    const octx = overlay.getContext('2d');
    if (!ctx || !octx) return;

    const vibes = MUSIC_VIBES.filter(v => v.image);
    const sprites: (HTMLCanvasElement | null)[] = vibes.map(() => null);
    vibes.forEach((vibe, i) => {
      const img = new Image();
      img.onload = () => { sprites[i] = makeSprite(img, vibe.color.light); };
      img.src = vibe.image!;
    });

    const count = iconCountFor(canvas.clientWidth);
    const points = fibonacciSphere(count, vibes.length);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let overlayWidth = 0;
    let overlayHeight = 0;
    let dpr = 1;
    const resize = () => {
      // Layout size, not getBoundingClientRect: the hero scales the globe in on load, and a
      // transformed rect would leave the canvas drawn at the wrong size for good
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      // Phones have dense screens but small GPUs; 1.5x is plenty for these icons
      dpr = Math.min(window.devicePixelRatio || 1, width < 640 ? 1.5 : 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      // Particles get their own larger, click-through canvas so they can follow the cursor
      // past the globe's edges
      overlayWidth = overlay.clientWidth;
      overlayHeight = overlay.clientHeight;
      overlay.width = Math.round(overlayWidth * dpr);
      overlay.height = Math.round(overlayHeight * dpr);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resizeObserver.observe(overlay);

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

    // Where the cursor is. Tracked on the window so emblems react as the cursor approaches from
    // outside the globe. Kept in viewport coordinates and mapped into the canvas every frame, so
    // it stays put while the page scrolls or the globe's entrance animation scales it.
    const pointer = { x: 0, y: 0, clientX: 0, clientY: 0, active: false };
    const onWindowPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && !dragging) return;
      pointer.clientX = e.clientX;
      pointer.clientY = e.clientY;
      pointer.active = true;
    };
    const mapPointer = () => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (pointer.clientX - rect.left) * (width / (rect.width || 1));
      pointer.y = (pointer.clientY - rect.top) * (height / (rect.height || 1));
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
    const small = width < 640;
    const maxEmitters = small ? 5 : 10;
    const maxParticles = small ? 140 : 320;
    const particles: Particle[] = [];
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

      if (pointer.active) mapPointer();
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

      // Nearby emblems shed particles around their rim, faster the closer the cursor is
      if (pointer.active && !reducedMotion && charged.length > 0) {
        charged.sort((a, b) => b.strength - a.strength);
        for (let i = 0; i < Math.min(charged.length, maxEmitters); i++) {
          const c = charged[i];
          const color = vibes[c.sprite].color.light;
          drawHalo(ctx, c.x, c.y, c.size, c.strength, color);
          let spawn = c.strength * (small ? 22 : 38) * dt;
          while (spawn > 0 && particles.length < maxParticles) {
            if (spawn < 1 && Math.random() > spawn) break;
            spawn -= 1;
            const a = Math.random() * Math.PI * 2;
            const r = c.size * (0.45 + Math.random() * 0.4);
            // A little sideways drift so they swirl in instead of flying straight
            const drift = (Math.random() - 0.5) * 70;
            particles.push({
              x: c.x + Math.cos(a) * r,
              y: c.y + Math.sin(a) * r,
              vx: -Math.sin(a) * drift,
              vy: Math.cos(a) * drift,
              age: 0,
              free: 0,
              size: 0.9 + Math.random() * 1.4 + c.strength * 1.2,
              color,
            });
          }
        }
      }

      // Gravity toward the live cursor: the pull grows as particles close in, and they vanish on arrival
      const padX = (overlayWidth - width) / 2;
      const padY = (overlayHeight - height) / 2;
      octx.setTransform(dpr, 0, 0, dpr, padX * dpr, padY * dpr);
      octx.clearRect(-padX, -padY, overlayWidth, overlayHeight);
      if (particles.length > 0) {
        octx.globalCompositeOperation = 'lighter';
        octx.lineCap = 'round';
        const drag = Math.exp(-dt * 1.6);
        for (let i = particles.length - 1; i >= 0; i--) {
          const q = particles[i];
          q.age += dt;
          // Once the cursor leaves (or a finger lifts) a particle keeps its momentum and fades out
          if (!pointer.active || q.free > 0) q.free += dt;
          const dx = pointer.x - q.x;
          const dy = pointer.y - q.y;
          const dist = Math.hypot(dx, dy) || 1;
          const pull = q.free > 0 ? 0 : Math.min(9000, 260 + 2.2e6 / (dist * dist + 400));
          if (q.free > 0) {
            // Ease from whatever speed it had down to a slow drift along its current heading
            const speed = Math.hypot(q.vx, q.vy) || 1;
            const target = DRIFT_SPEED / speed;
            const ease = Math.min(dt * 3, 1);
            q.vx += (q.vx * target - q.vx) * ease;
            q.vy += (q.vy * target - q.vy) * ease;
          } else {
            q.vx = (q.vx + (dx / dist) * pull * dt) * drag;
            q.vy = (q.vy + (dy / dist) * pull * dt) * drag;
          }
          const px = q.x;
          const py = q.y;
          const step = Math.hypot(q.vx, q.vy) * dt;
          // Arrived (or would overshoot this frame), lost, or finished fading after release
          const arrived = q.free === 0 && (dist < 4 || step >= dist);
          if (arrived || (q.age > 3 && q.free === 0) || q.free > FADE_OUT) {
            particles[i] = particles[particles.length - 1];
            particles.pop();
            continue;
          }
          q.x += q.vx * dt;
          q.y += q.vy * dt;
          const fade = Math.min(1, q.age * 6) * (q.free > 0 ? 1 - q.free / FADE_OUT : Math.min(1, dist / 28));
          // A short streak along the motion reads as speed
          octx.strokeStyle = rgba(q.color, 0.25 * fade);
          octx.lineWidth = q.size * 3;
          octx.beginPath();
          octx.moveTo(px, py);
          octx.lineTo(q.x, q.y);
          octx.stroke();
          octx.strokeStyle = rgba(q.color, 0.95 * fade);
          octx.lineWidth = q.size;
          octx.stroke();
        }
        octx.globalCompositeOperation = 'source-over';
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
    <div className={cn('relative', className)}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="A spinning globe covered in Spotifun's fifteen vibe paintings"
        className="block h-full w-full touch-pan-y cursor-grab active:cursor-grabbing"
      />
      <canvas ref={overlayRef} aria-hidden className="pointer-events-none absolute -inset-[30%] h-[160%] w-[160%]" />
    </div>
  );
}
