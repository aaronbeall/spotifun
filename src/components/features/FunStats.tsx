'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Stats } from '@/types';
import { buildStorySlides, type StorySlide } from '@/utils/listeningFacts';
import { getPersonaCharacter, personaPortrait } from '@/utils/personaCharacters';

interface FunStatsProps {
  stats: Stats;
}

function HourFace({ hour }: { hour: number }) {
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0" aria-hidden>
      <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      {Array.from({ length: 24 }, (_, index) => {
        const angle = (index / 24) * Math.PI * 2 - Math.PI / 2;
        const active = index === hour;
        const inner = active ? 38 : 44;
        const outer = active ? 54 : 50;
        return (
          <line
            key={index}
            x1={60 + Math.cos(angle) * inner}
            y1={60 + Math.sin(angle) * inner}
            x2={60 + Math.cos(angle) * outer}
            y2={60 + Math.sin(angle) * outer}
            stroke={active ? '#fde68a' : 'rgba(255,255,255,0.4)'}
            strokeWidth={active ? 4 : 1.5}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function SlideBody({ slide }: { slide: StorySlide }) {
  if (slide.kind === 'persona') {
    const character = slide.personaId ? getPersonaCharacter(slide.personaId) : undefined;
    return (
      <div className="relative">
        <div
          className="pointer-events-none absolute -left-10 -top-16 h-56 w-56 rounded-full blur-3xl"
          style={{ background: slide.accent ?? '#f472b6', opacity: 0.55 }}
        />
        <div className="relative flex items-center gap-5 sm:gap-7">
          {slide.personaId && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={personaPortrait(slide.personaId)}
              alt=""
              className="h-28 w-28 shrink-0 -rotate-3 rounded-2xl border-4 border-white/15 object-cover shadow-2xl sm:h-40 sm:w-40"
              draggable={false}
            />
          )}
          <div>
            <p className="text-4xl font-black italic leading-none tracking-tight text-white sm:text-6xl">
              {slide.headline}
            </p>
            {character && (
              <p className="mt-3 text-sm font-semibold text-white/70">
                Starring {character.name}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (slide.kind === 'replay') {
    return (
      <div className="relative pr-24">
        <div className="absolute right-0 top-0 rotate-12 rounded-lg border-4 border-white/80 px-3 py-1 text-sm font-black tracking-[0.2em] text-white">
          ×{slide.replayCount}
        </div>
        <p className="text-4xl font-black leading-none tracking-tight text-white sm:text-5xl">{slide.headline}</p>
      </div>
    );
  }

  if (slide.kind === 'once') {
    return (
      <p className="font-serif text-5xl font-light italic tracking-tight text-white sm:text-7xl">
        {slide.headline}
      </p>
    );
  }

  if (slide.kind === 'run' || slide.kind === 'concentration') {
    const marks = Math.min(slide.runCount ?? 0, 12);
    return (
      <div>
        <div className="mb-4 flex items-end gap-1.5" aria-hidden>
          {Array.from({ length: marks }, (_, index) => (
            <span
              key={index}
              className="w-2.5 rounded-full bg-white"
              style={{ height: `${18 + index * 4}px`, opacity: 0.35 + (index / Math.max(marks, 1)) * 0.65 }}
            />
          ))}
        </div>
        <p className="text-4xl font-black leading-none tracking-tight text-white sm:text-5xl">{slide.headline}</p>
      </div>
    );
  }

  if (slide.kind === 'hour' && slide.hour != null) {
    return (
      <div className="flex items-center gap-6">
        <HourFace hour={slide.hour} />
        <p className="text-4xl font-black leading-none text-amber-100 sm:text-5xl">{slide.headline}</p>
      </div>
    );
  }

  if (slide.kind === 'window' || slide.kind === 'built') {
    return (
      <div>
        <div className="mb-4 flex items-center gap-3" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-white" />
          <span className="h-px flex-1 bg-gradient-to-r from-white via-white/40 to-white" />
          <span className="h-2.5 w-2.5 rounded-full bg-white" />
        </div>
        <p className="text-4xl font-black leading-none tracking-tight text-white sm:text-6xl">{slide.headline}</p>
      </div>
    );
  }

  if (slide.kind === 'years' && slide.yearFrom != null && slide.yearTo != null) {
    return (
      <div>
        <div className="flex items-end justify-between gap-4">
          <span className="text-4xl font-black tabular-nums text-amber-100 sm:text-6xl">{slide.yearFrom}</span>
          <span className="mb-3 h-px flex-1 bg-gradient-to-r from-amber-200 to-sky-300" />
          <span className="text-4xl font-black tabular-nums text-sky-100 sm:text-6xl">{slide.yearTo}</span>
        </div>
        <div className="mt-2 flex justify-between gap-6 text-xs text-white/70">
          <span className="max-w-[45%] truncate">{slide.yearFromTitle}</span>
          <span className="max-w-[45%] truncate text-right">{slide.yearToTitle}</span>
        </div>
      </div>
    );
  }

  if (slide.kind === 'drift') {
    return (
      <div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-black/25 px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Earlier</div>
            <div className="text-4xl font-black tabular-nums text-white">{slide.earlyPopularity}</div>
          </div>
          <div className="rounded-2xl bg-white/15 px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Later</div>
            <div className="text-4xl font-black tabular-nums text-white">{slide.latePopularity}</div>
          </div>
        </div>
        <p className="mt-4 text-2xl font-black text-white">{slide.headline}</p>
      </div>
    );
  }

  if (slide.kind === 'length') {
    return (
      <div>
        <div className="mb-3 flex gap-px" aria-hidden>
          {Array.from({ length: 28 }, (_, index) => (
            <span
              key={index}
              className="w-px bg-white/70"
              style={{ height: index % 4 === 0 ? 16 : 8 }}
            />
          ))}
        </div>
        <p className="font-mono text-4xl font-bold tracking-tight text-white sm:text-6xl">{slide.headline}</p>
      </div>
    );
  }

  return (
    <p className="text-4xl font-black leading-none tracking-tight text-white sm:text-6xl">{slide.headline}</p>
  );
}

const SLIDE_BACKGROUNDS: Record<StorySlide['kind'], string> = {
  persona: 'bg-gray-950',
  replay: 'bg-gradient-to-br from-rose-600 via-fuchsia-700 to-orange-500',
  once: 'bg-[#14110e]',
  run: 'bg-gradient-to-br from-violet-700 via-indigo-800 to-slate-900',
  hour: 'bg-[#1a1408]',
  window: 'bg-gradient-to-r from-slate-800 to-cyan-950',
  years: 'bg-[#10141c]',
  built: 'bg-gradient-to-br from-emerald-800 to-teal-950',
  drift: 'bg-gradient-to-br from-orange-700 via-rose-800 to-slate-950',
  length: 'bg-[#121418]',
  concentration: 'bg-gradient-to-br from-pink-700 to-purple-950',
  empty: 'bg-gray-900',
};

export default function FunStats({ stats }: FunStatsProps) {
  const slides = buildStorySlides(stats);
  const storyKey = `${stats.mode}:${stats.timeRange}:${stats.playlist?.id ?? ''}`;
  const [current, setCurrent] = useState(0);
  const [seenKey, setSeenKey] = useState(storyKey);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  if (seenKey !== storyKey) {
    setSeenKey(storyKey);
    setCurrent(0);
  }
  const index = slides.length === 0 ? 0 : current % slides.length;
  const active = slides[index];

  const goTo = (next: number) => setCurrent((next + slides.length) % slides.length);

  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-800 p-4 shadow-lg sm:p-6">
      <div className="mb-4 px-1">
        <h2 className="text-lg font-bold text-white">Your Music Story</h2>
        <p className="text-xs text-gray-400">Facts from this view, not a lifetime total.</p>
      </div>

      <div className="mb-3 flex gap-1.5 px-1">
        {slides.map((slide, slideIndex) => (
          <button
            key={slide.id}
            onClick={() => goTo(slideIndex)}
            aria-label={`Go to ${slide.kicker}`}
            aria-current={slideIndex === index ? 'step' : undefined}
            className="h-1 flex-1 overflow-hidden rounded-full bg-white/15 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/60"
          >
            {slideIndex === index && !reduceMotion ? (
              <div
                key={`${slide.id}-${index}`}
                onAnimationEnd={() => {
                  if (!isPaused && slides.length > 1) goTo(index + 1);
                }}
                className="h-full animate-progress-fill rounded-full bg-white"
                style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
              />
            ) : slideIndex <= index ? (
              <div className="h-full w-full rounded-full bg-white" />
            ) : null}
          </button>
        ))}
      </div>

      <div
        className="group relative rounded-2xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`relative min-h-[240px] overflow-hidden rounded-2xl p-6 sm:p-8 ${SLIDE_BACKGROUNDS[active.kind]}`}
          >
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">{active.kicker}</p>
            <SlideBody slide={active} />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">{active.detail}</p>
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 && (
          <>
            <button
              onClick={() => goTo(index - 1)}
              aria-label="Previous story"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/25 p-2 text-white opacity-0 transition-opacity hover:bg-black/45 focus:opacity-100 focus:outline-none group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => goTo(index + 1)}
              aria-label="Next story"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/25 p-2 text-white opacity-0 transition-opacity hover:bg-black/45 focus:opacity-100 focus:outline-none group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
