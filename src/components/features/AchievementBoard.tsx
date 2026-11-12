'use client';

import { useEffect, useState } from 'react';
import { evaluateAchievements, type AchievementView } from '@/lib/records/achievements';
import { getRecordStore } from '@/lib/records/indexedDbStore';
import { BadgeMedal, badgeArt } from './BadgeMedal';

function BadgeCard({ achievement }: { achievement: AchievementView }) {
  const art = badgeArt(achievement.id);
  if (!art) return null;
  const pct = Math.round((achievement.progress / achievement.goal) * 100);

  return (
    <li className={`relative overflow-hidden rounded-2xl border bg-[#120c18] ${achievement.earned ? 'border-white/20' : 'border-white/10 grayscale opacity-40'}`}>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: art.pattern,
          backgroundSize: art.tile,
        }}
      />
      <div className="relative flex h-full flex-col items-center px-3 pb-4 pt-4 text-center">
        <div className="mb-3 flex items-end" aria-hidden>
          <span className="h-5 w-2.5" style={{ background: art.ribbon, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 72%)' }} />
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ background: art.ribbon, color: art.ink }}>
            {achievement.earned ? 'Earned' : 'Locked'}
          </span>
          <span className="h-5 w-2.5" style={{ background: art.ribbon, clipPath: 'polygon(0 0, 100% 0, 100% 72%, 0 100%)' }} />
        </div>
        <BadgeMedal id={achievement.id} />
        <h3 className="mt-3 text-sm font-semibold text-white">{achievement.title}</h3>
        <p className="mt-1 flex-1 text-xs leading-snug text-gray-400">{achievement.detail}</p>
        {!achievement.earned && (
          <div className="mt-3 w-full">
            <div className="h-1.5 overflow-hidden rounded-full bg-black/50" role="progressbar" aria-valuenow={achievement.progress} aria-valuemin={0} aria-valuemax={achievement.goal} aria-label={`${achievement.title} progress`}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: art.metal }} />
            </div>
            <p className="mt-1 font-mono text-[10px] text-gray-500">{achievement.progress}/{achievement.goal}</p>
          </div>
        )}
      </div>
    </li>
  );
}

export function AchievementBoard({ userId, refreshKey = 0 }: { userId: string; refreshKey?: number }) {
  const [achievements, setAchievements] = useState<AchievementView[] | null>(null);

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

  if (!achievements) {
    return <p className="text-sm text-gray-500">Reading badges for this account…</p>;
  }

  const ordered = [...achievements].sort((a, b) => Number(b.earned) - Number(a.earned));

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {ordered.map(achievement => (
        <BadgeCard key={achievement.id} achievement={achievement} />
      ))}
    </ul>
  );
}
