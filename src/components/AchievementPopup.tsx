'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { JournalNews } from '@/lib/records/observe';
import type { UnlockRecord } from '@/lib/records/types';
import { personaPortraitSrc } from '@/utils/musicPersonas';
import { MUSIC_VIBES } from '@/utils/musicVibes';
import { BadgeMedal, badgeArt } from './features/BadgeMedal';

const DISMISS_MS = 8000;

interface AchievementPopupProps {
  news: JournalNews;
  onClose: () => void;
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function UnlockArtwork({ unlock }: { unlock: UnlockRecord }) {
  const src = unlock.kind === 'persona'
    ? personaPortraitSrc(unlock.key)
    : MUSIC_VIBES.find(vibe => vibe.id === unlock.key)?.image;
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      className={`h-14 w-14 shrink-0 object-cover ${unlock.kind === 'vibe' ? 'rounded-full' : 'rounded-xl'}`}
      style={{ boxShadow: `0 0 0 1px ${unlock.color}99` }}
    />
  );
}

export function AchievementPopup({ news, onClose }: AchievementPopupProps) {
  const reduce = useReducedMotion();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const hover = useRef({ pause: () => {}, resume: () => {} });

  useEffect(() => {
    let timer: number | null = null;
    let remaining = DISMISS_MS;
    let started = performance.now();
    let paused = false;

    const clear = () => {
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
    };
    const arm = (ms: number) => {
      clear();
      remaining = ms;
      started = performance.now();
      timer = window.setTimeout(() => onCloseRef.current(), ms);
    };
    hover.current = {
      pause: () => {
        if (paused || timer === null) return;
        remaining = Math.max(0, remaining - (performance.now() - started));
        clear();
        paused = true;
      },
      resume: () => {
        if (!paused) return;
        paused = false;
        arm(remaining);
      },
    };
    arm(DISMISS_MS);
    return () => {
      hover.current = { pause: () => {}, resume: () => {} };
      clear();
    };
  }, [news]);
  const badges = news.achievements.filter(achievement => {
    if (achievement.id === 'first-name' && news.unlocks.some(unlock => unlock.kind === 'persona')) return false;
    if (achievement.id === 'first-vibe' && news.unlocks.some(unlock => unlock.kind === 'vibe')) return false;
    return true;
  });
  const section = news.unlocks.length > 0 ? 'collection' : 'badges';
  const accent = news.unlocks[0]?.color ?? badgeArt(badges[0]?.id ?? '')?.metal ?? '#c4b5fd';

  const go = (id: string) => {
    onClose();
    scrollToSection(id);
  };

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 w-[min(26rem,calc(100vw-2rem))]"
      role="status"
      aria-live="polite"
      onMouseEnter={() => hover.current.pause()}
      onMouseLeave={() => hover.current.resume()}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.94 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
      transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 420, damping: 28 }}
    >
      <div
        className="relative rounded-2xl border border-white/15 bg-gray-950/95 p-5 shadow-2xl backdrop-blur"
        style={{ boxShadow: `0 16px 50px ${accent}33` }}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
            Newly unlocked
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 rounded-full p-1 text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="mt-3 max-h-[min(24rem,calc(100vh-8rem))] space-y-2 overflow-y-auto">
          {news.unlocks.map((unlock, index) => (
            <motion.li
              key={unlock.id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + index * 0.06, duration: 0.28 }}
            >
              <button
                type="button"
                onClick={() => go('collection')}
                className="flex w-full items-center gap-3 rounded-xl px-1 py-1 text-left transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <UnlockArtwork unlock={unlock} />
                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-widest text-gray-500">
                    {unlock.kind === 'persona' ? 'Persona' : 'Vibe'}
                  </span>
                  <span className="block text-xl font-semibold text-white">{unlock.name}</span>
                </span>
              </button>
            </motion.li>
          ))}
          {badges.map((achievement, index) => (
            <motion.li
              key={achievement.id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + (news.unlocks.length + index) * 0.06, duration: 0.28 }}
            >
              <button
                type="button"
                onClick={() => go('badges')}
                className="flex w-full items-center gap-3 rounded-xl px-1 py-1 text-left transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <BadgeMedal id={achievement.id} className="h-14 w-14" />
                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-widest text-gray-500">Badge</span>
                  <span className="block text-xl font-semibold text-white">{achievement.title}</span>
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-gray-500">
          {section === 'collection' ? 'View in your collection' : 'View your badges'}
        </p>
      </div>
    </motion.div>
  );
}
