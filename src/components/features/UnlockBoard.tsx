'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import * as Tooltip from '@radix-ui/react-tooltip';
import { getRecordStore } from '@/lib/records/indexedDbStore';
import type { UnlockRecord } from '@/lib/records/types';
import { MUSIC_PERSONAS } from '@/utils/musicPersonas';
import { MUSIC_VIBES } from '@/utils/musicVibes';

function byKey(unlocks: UnlockRecord[], kind: UnlockRecord['kind']): Map<string, UnlockRecord> {
  const found = new Map<string, UnlockRecord>();
  for (const unlock of unlocks) {
    if (unlock.kind === kind) found.set(unlock.key, unlock);
  }
  return found;
}

function unlockDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function UnlockBoard({ userId, refreshKey = 0 }: { userId: string; refreshKey?: number }) {
  const [unlocks, setUnlocks] = useState<UnlockRecord[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      getRecordStore(userId).readJournal()
        .then(journal => {
          if (!cancelled) setUnlocks(journal.unlocks);
        })
        .catch(() => {
          if (!cancelled) setUnlocks([]);
        });
    };
    load();
    window.addEventListener('focus', load);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', load);
    };
  }, [userId, refreshKey]);

  if (!unlocks) {
    return <p className="text-sm text-gray-500">Reading unlocks for this account…</p>;
  }

  const vibes = byKey(unlocks, 'vibe');
  const personas = byKey(unlocks, 'persona');

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Vibes</h3>
          <p className="font-mono text-xs text-gray-400">{vibes.size}/{MUSIC_VIBES.length}</p>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {MUSIC_VIBES.map(vibe => {
            const unlock = vibes.get(vibe.id);
            return (
              <li
                key={vibe.id}
                className={`flex flex-col items-center rounded-2xl border px-3 py-4 text-center ${unlock ? 'border-white/15 bg-white/[0.04]' : 'border-white/5 bg-black/20'}`}
              >
                {vibe.image && (
                  <Image
                    src={vibe.image}
                    alt=""
                    width={72}
                    height={72}
                    className={`h-16 w-16 rounded-full ${unlock ? '' : 'opacity-35 grayscale'}`}
                  />
                )}
                <p className={`mt-2 text-sm font-semibold leading-tight ${unlock ? 'text-white' : 'text-gray-500'}`}>{vibe.name}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                  {unlock ? unlockDate(unlock.at) : 'Not yet'}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Personas</h3>
          <p className="font-mono text-xs text-gray-400">{personas.size}/{MUSIC_PERSONAS.length}</p>
        </div>
        <ul className="flex flex-wrap gap-1.5">
          {MUSIC_PERSONAS.map(persona => {
            const unlock = personas.get(persona.id);
            if (!unlock) {
              return (
                <li
                  key={persona.id}
                  aria-label="Hidden persona"
                  className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-white/15 bg-black/30 text-sm text-gray-600"
                >
                  ?
                </li>
              );
            }
            const date = unlockDate(unlock.at);
            return (
              <li key={persona.id}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      type="button"
                      aria-label={`${persona.name}, unlocked ${date}`}
                      className="h-12 w-12 rounded-lg border border-white/25 shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      style={{ background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.9), ${persona.color} 46%)` }}
                    />
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="z-50 max-w-xs rounded-lg border border-gray-700 bg-gray-900/98 px-3 py-2 text-xs leading-relaxed text-gray-200 shadow-xl"
                      sideOffset={6}
                      collisionPadding={10}
                    >
                      <p className="text-sm font-semibold text-white">{persona.name}</p>
                      <p className="mt-1">{persona.description}</p>
                      <p className="mt-1 text-gray-400">{date}</p>
                      <Tooltip.Arrow className="fill-gray-900/98" width={12} height={6} />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
