'use client';

import { useEffect, useState } from 'react';
import { Share2, X } from 'lucide-react';
import { evaluateAchievements, type AchievementView } from '@/lib/records/achievements';
import { getRecordStore } from '@/lib/records/indexedDbStore';
import { darkenHex } from '@/utils/color';
import type { ShareContent } from '../ShareCardTemplate';
import { ShareModal } from '../ShareModal';
import { ThemedCardBackground } from '../ThemedCardBackground';
import { RibbonTail, UnlockBadge } from './PersonaCard';
import { badgeShare, badgesShare } from '../shareLists';
import { BadgeMark, BadgeTileWash, badgeArt } from './BadgeMedal';

function unlockDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const GROUP_LABEL: Record<AchievementView['group'], string> = {
  visit: 'Visits',
  look: 'Looking',
  persona: 'Personas',
  vibe: 'Vibes',
};

function BadgeCard({ achievement, onOpen }: { achievement: AchievementView; onOpen?: () => void }) {
  const art = badgeArt(achievement.id);
  if (!art) return null;
  const pct = Math.round((achievement.progress / achievement.goal) * 100);
  const earned = achievement.earned;

  const body = (
    <>
      <BadgeTileWash id={achievement.id} />
      <div className="relative z-10 mb-3 flex items-end" aria-hidden>
        <RibbonTail side="left" color={art.ribbon} className="h-5" notch={72} />
        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ background: art.ribbon, color: art.ink }}>
          {earned ? 'Earned' : 'Locked'}
        </span>
        <RibbonTail side="right" color={art.ribbon} className="h-5" notch={72} />
      </div>
      <BadgeMark id={achievement.id} className="relative h-20 w-20" />
      <h3 className="relative z-10 mt-3 text-sm font-semibold text-white">{achievement.title}</h3>
      <p className="relative z-10 mt-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
        {earned && achievement.earnedAt ? unlockDate(achievement.earnedAt) : 'Not yet'}
      </p>
      <p className="relative z-10 mt-1 flex-1 text-xs leading-snug text-gray-400">{achievement.detail}</p>
      {!earned && (
        <div className="relative z-10 mt-3 w-full">
          <div className="h-1.5 overflow-hidden rounded-full bg-black/50" role="progressbar" aria-valuenow={achievement.progress} aria-valuemin={0} aria-valuemax={achievement.goal} aria-label={`${achievement.title} progress`}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: art.metal }} />
          </div>
          <p className="mt-1 font-mono text-[10px] text-gray-500">{achievement.progress}/{achievement.goal}</p>
        </div>
      )}
    </>
  );

  const frame = 'relative flex h-full w-full flex-col items-center overflow-hidden rounded-2xl border bg-[#120c18] px-3 pb-4 pt-4 text-center';

  return (
    <li className={earned ? '' : 'grayscale opacity-40'}>
      {earned ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`${achievement.title}, unlocked ${achievement.earnedAt ? unlockDate(achievement.earnedAt) : ''}`}
          className={`${frame} transition duration-200 hover:-translate-y-0.5 hover:border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white`}
          style={{ borderColor: `${art.metal}66` }}
        >
          {body}
        </button>
      ) : (
        <div className={frame} style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          {body}
        </div>
      )}
    </li>
  );
}

function BadgeDetail({
  achievement,
  onShare,
}: {
  achievement: AchievementView;
  onShare?: () => void;
}) {
  const art = badgeArt(achievement.id);
  const light = art?.metal ?? '#fcd34d';
  const dark = art ? darkenHex(art.ribbon, 0.45) : '#78350f';
  const pct = achievement.goal === 0 ? 0 : Math.round((achievement.progress / achievement.goal) * 100);

  return (
    <ThemedCardBackground color={{ light, dark }} className="rounded-3xl border border-white/10 shadow-2xl">
      <BadgeTileWash id={achievement.id} />
      {onShare && (
        <button
          type="button"
          onClick={onShare}
          aria-label="Share"
          className="absolute top-6 right-6 z-20 rounded-full border border-white/10 bg-black/30 p-2 text-gray-200 transition-colors hover:bg-black/50 hover:text-white"
        >
          <Share2 className="h-4 w-4" />
        </button>
      )}
      <div className="relative z-10 flex flex-col items-center px-6 py-8 text-center sm:px-10 sm:py-10">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/45">
          {GROUP_LABEL[achievement.group]}
        </p>
        <div className="mt-6">
          <BadgeMark id={achievement.id} className="h-40 w-40" />
        </div>
        <h2 id="badge-detail-title" className="mt-6 text-3xl font-black tracking-tight sm:text-5xl" style={{ color: light }}>
          {achievement.title}
        </h2>
        <p className="mt-3 max-w-md text-base leading-relaxed text-white/85">{achievement.detail}</p>
        {achievement.earned && achievement.earnedAt ? (
          <UnlockBadge label={`Unlocked ${unlockDate(achievement.earnedAt)}`} color={light} />
        ) : (
          <div className="mt-6 w-full max-w-xs">
            <div className="h-1.5 overflow-hidden rounded-full bg-black/50" role="progressbar" aria-valuenow={achievement.progress} aria-valuemin={0} aria-valuemax={achievement.goal} aria-label={`${achievement.title} progress`}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: light }} />
            </div>
            <p className="mt-2 text-xs tabular-nums text-white/55">{achievement.progress} of {achievement.goal}</p>
          </div>
        )}
      </div>
    </ThemedCardBackground>
  );
}

export function AchievementBoard({
  userId,
  refreshKey = 0,
  onShareContent,
  onCounts,
}: {
  userId: string;
  refreshKey?: number;
  onShareContent?: (content: ShareContent | null) => void;
  onCounts?: (found: number, total: number) => void;
}) {
  const [achievements, setAchievements] = useState<AchievementView[] | null>(null);
  const [open, setOpen] = useState<AchievementView | null>(null);
  const [share, setShare] = useState<ShareContent | null>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      getRecordStore(userId).readJournal()
        .then(journal => {
          if (!cancelled) setAchievements(evaluateAchievements(journal));
        })
        .catch(() => {
          if (!cancelled) setAchievements([]);
        });
    };
    load();
    window.addEventListener('focus', load);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', load);
    };
  }, [userId, refreshKey]);

  useEffect(() => {
    if (!onShareContent) return;
    if (!achievements) {
      onShareContent(null);
      return;
    }
    const earned = achievements.filter(achievement => achievement.earned);
    onShareContent(earned.length > 0 ? badgesShare(earned) : null);
    onCounts?.(earned.length, achievements.length);
  }, [achievements, onShareContent, onCounts]);

  if (!achievements) {
    return <p className="text-sm text-gray-500">Reading badges for this account…</p>;
  }

  const ordered = [...achievements].sort((a, b) => Number(b.earned) - Number(a.earned));

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {ordered.map(achievement => (
          <BadgeCard
            key={achievement.id}
            achievement={achievement}
            onOpen={achievement.earned ? () => setOpen(achievement) : undefined}
          />
        ))}
      </ul>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-6 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="badge-detail-title"
            className="relative my-auto w-full max-w-xl"
            onClick={event => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute -top-3 -right-3 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-gray-800 text-white shadow-lg hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
            <BadgeDetail
              achievement={open}
              onShare={open.earned ? () => setShare(badgeShare(open)) : undefined}
            />
          </div>
        </div>
      )}
      <ShareModal content={share} onClose={() => setShare(null)} />
    </>
  );
}
