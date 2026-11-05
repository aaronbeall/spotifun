'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { JournalNews } from '@/lib/records/observe';

interface AchievementPopupProps {
  news: JournalNews;
  onClose: () => void;
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function AchievementPopup({ news, onClose }: AchievementPopupProps) {
  const reduce = useReducedMotion();
  const badges = news.achievements.filter(achievement => {
    if (achievement.id === 'first-name' && news.unlocks.some(unlock => unlock.kind === 'persona')) return false;
    if (achievement.id === 'first-vibe' && news.unlocks.some(unlock => unlock.kind === 'vibe')) return false;
    return true;
  });
  const section = news.unlocks.length > 0 ? 'collection' : 'badges';
  const accent = news.unlocks[0]?.color ?? '#c4b5fd';

  const go = (id: string) => {
    onClose();
    scrollToSection(id);
  };

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 w-[min(24rem,calc(100vw-2rem))]"
      role="status"
      aria-live="polite"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.94 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
      transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 420, damping: 28 }}
    >
      <div
        className="relative rounded-2xl border border-white/15 bg-gray-950/95 p-5 shadow-2xl backdrop-blur"
        style={{ boxShadow: `0 16px 50px ${accent}33` }}
      >
        <button
          type="button"
          onClick={() => go(section)}
          className="absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label={section === 'collection' ? 'View in your collection' : 'View your badges'}
        />
        <div className="pointer-events-none relative">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
              Newly unlocked
            </p>
            <span className="w-10" aria-hidden />
          </div>
          <ul className="mt-3 space-y-3">
            {news.unlocks.map((unlock, index) => (
              <motion.li
                key={unlock.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + index * 0.06, duration: 0.28 }}
              >
                <p className="text-[11px] uppercase tracking-widest text-gray-500">
                  {unlock.kind === 'persona' ? 'Persona' : 'Vibe'}
                </p>
                <p className="text-xl font-semibold text-white">{unlock.name}</p>
              </motion.li>
            ))}
          </ul>
          {news.unlocks.length === 0 && badges.length > 0 && (
            <p className="mt-3 text-sm text-gray-300">A new badge is on your board.</p>
          )}
          <p className="mt-3 text-xs text-gray-500">
            {section === 'collection' ? 'View in your collection' : 'View your badges'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-xs text-gray-400 hover:text-white"
        >
          Close
        </button>
        {badges.length > 0 && (
          <ul className="relative mt-4 flex flex-wrap gap-2">
            {badges.map(achievement => (
              <li key={achievement.id}>
                <button
                  type="button"
                  onClick={() => go('badges')}
                  className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-gray-200 hover:border-white/40 hover:text-white"
                >
                  {achievement.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
