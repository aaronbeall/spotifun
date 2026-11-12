'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { getRecordStore } from '@/lib/records/indexedDbStore';
import type { UnlockRecord } from '@/lib/records/types';
import type { MusicVibe, VACRSScore } from '@/types';
import { MUSIC_PERSONAS, personaPortraitSrc, type Persona } from '@/utils/musicPersonas';
import { MUSIC_VIBES } from '@/utils/musicVibes';
import { darkenHex } from '@/utils/color';
import { getMetricDescription } from '@/utils/metricDescriptions';
import { getDominantTrait } from '@/utils/vacrs';
import { ThemedCardBackground } from '../ThemedCardBackground';
import { MetricInfo } from '../MetricInfo';
import { SectionShareButton } from '../SectionShareButton';
import { ShareModal } from '../ShareModal';
import type { ShareContent } from '../ShareCardTemplate';
import { PersonaPresentation, UnlockBadge } from './PersonaCard';

const VIBE_TRAITS: Array<{ key: keyof VACRSScore; label: string; tooltip: string }> = [
  { key: 'valence', label: 'Mood', tooltip: 'valence' },
  { key: 'arousal', label: 'Energy', tooltip: 'arousal' },
  { key: 'complexity', label: 'Depth', tooltip: 'complexity' },
  { key: 'rawness', label: 'Texture', tooltip: 'rawness' },
  { key: 'socialPresence', label: 'Setting', tooltip: 'social-presence' },
];

type OpenDetail =
  | { kind: 'persona'; persona: Persona; at: string }
  | { kind: 'vibe'; vibe: MusicVibe; at: string };

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
  const [open, setOpen] = useState<OpenDetail | null>(null);
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
            const date = unlock ? unlockDate(unlock.at) : 'Not yet';
            const body = (
              <>
                {vibe.image && (
                  <Image
                    src={vibe.image}
                    alt=""
                    width={72}
                    height={72}
                    className={`h-16 w-16 rounded-full transition duration-200 ${unlock ? 'group-hover:scale-110' : 'opacity-35 grayscale'}`}
                  />
                )}
                <p className={`mt-2 text-sm font-semibold leading-tight ${unlock ? 'text-white' : 'text-gray-500'}`}>{vibe.name}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                  {date}
                </p>
              </>
            );
            return (
              <li key={vibe.id}>
                {unlock ? (
                  <button
                    type="button"
                    onClick={() => setOpen({ kind: 'vibe', vibe, at: unlock.at })}
                    aria-label={`${vibe.name}, unlocked ${date}`}
                    className="group flex w-full flex-col items-center rounded-2xl border border-white/15 bg-white/[0.04] px-3 py-4 text-center transition duration-200 hover:-translate-y-1 hover:border-white/40 hover:bg-white/[0.09] hover:shadow-[0_14px_28px_-14px_var(--tile)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    style={{ ['--tile' as string]: vibe.color.light }}
                  >
                    {body}
                  </button>
                ) : (
                  <div className="flex flex-col items-center rounded-2xl border border-white/5 bg-black/20 px-3 py-4 text-center">
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        {vibes.size > 0 && (
          <div className="mt-4 flex justify-center">
            <SectionShareButton onClick={() => setShare(vibeCollectionShare(vibes))} />
          </div>
        )}
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
                <button
                  type="button"
                  onClick={() => setOpen({ kind: 'persona', persona, at: unlock.at })}
                  aria-label={`${persona.name}, unlocked ${date}`}
                  className="group relative z-0 h-12 w-12 overflow-hidden rounded-lg border transition duration-200 ease-out hover:z-10 hover:-translate-y-1 hover:scale-125 hover:ring-2 hover:ring-white hover:shadow-[0_12px_22px_-4px_var(--tile)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  style={{ borderColor: `${persona.color}99`, ['--tile' as string]: persona.color }}
                >
                  <img
                    src={personaPortraitSrc(persona.id)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-200 group-hover:scale-110"
                  />
                </button>
              </li>
            );
          })}
        </ul>
        {personas.size > 0 && (
          <div className="mt-4 flex justify-center">
            <SectionShareButton onClick={() => setShare(personaCollectionShare(personas))} />
          </div>
        )}
      </section>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-6 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={open.kind === 'persona' ? 'persona-detail-title' : 'vibe-detail-title'}
            className="relative my-auto w-full max-w-4xl"
            onClick={event => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute -top-3 -right-3 z-10 rounded-full border border-white/10 bg-gray-800 p-2 text-white shadow-lg hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
            {open.kind === 'persona' ? (
              <PersonaPresentation
                persona={open.persona}
                unlockedOn={unlockDate(open.at)}
                titleId="persona-detail-title"
              />
            ) : (
              <VibePresentation
                vibe={open.vibe}
                unlockedOn={unlockDate(open.at)}
                titleId="vibe-detail-title"
              />
            )}
            <div className="mt-4 flex justify-center">
              <SectionShareButton onClick={() => setShare(itemShare(open))} />
            </div>
          </div>
        </div>
      )}
      <ShareModal content={share} onClose={() => setShare(null)} />
    </div>
  );
}

function SharePortrait({ src, glow }: { src: string; glow: string }) {
  return (
    <div
      className="h-48 w-48 overflow-hidden rounded-full border-4 border-white/10"
      style={{ boxShadow: `0 0 60px ${glow}50` }}
    >
      <img src={src} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

function ShareMosaic({ items }: { items: Array<{ src: string; round: boolean }> }) {
  return (
    <div className="flex max-w-[28rem] flex-wrap justify-center gap-2">
      {items.slice(0, 18).map((item, index) => (
        <img
          key={`${item.src}-${index}`}
          src={item.src}
          alt=""
          className={`h-14 w-14 object-cover ${item.round ? 'rounded-full' : 'rounded-xl'}`}
        />
      ))}
    </div>
  );
}

function vibeCollectionShare(found: Map<string, UnlockRecord>): ShareContent {
  const vibes = MUSIC_VIBES.filter(vibe => found.has(vibe.id));
  const lead = vibes[0];
  return {
    eyebrow: 'Vibe collection',
    title: vibes.length === 1 ? lead.name : `${vibes.length} vibes`,
    value: `${vibes.length} of ${MUSIC_VIBES.length}`,
    description: 'Vibes this account has landed on.',
    color: lead?.color ?? { light: '#f472b6', dark: '#831843' },
    visual: (
      <ShareMosaic items={vibes.flatMap(vibe => (vibe.image ? [{ src: vibe.image, round: true }] : []))} />
    ),
  };
}

function personaCollectionShare(found: Map<string, UnlockRecord>): ShareContent {
  const personas = MUSIC_PERSONAS.filter(persona => found.has(persona.id));
  const lead = personas[0];
  const color = lead?.color ?? '#c4b5fd';
  return {
    eyebrow: 'Persona collection',
    title: personas.length === 1 ? lead.name : `${personas.length} personas`,
    value: `${personas.length} of ${MUSIC_PERSONAS.length}`,
    description: 'Personas this account has landed on.',
    color: { light: color, dark: darkenHex(color, 0.6) },
    visual: (
      <ShareMosaic items={personas.map(persona => ({ src: personaPortraitSrc(persona.id), round: false }))} />
    ),
  };
}

function itemShare(open: OpenDetail): ShareContent {
  if (open.kind === 'persona') {
    const { persona, at } = open;
    return {
      eyebrow: 'Listener persona',
      title: persona.name,
      value: `Unlocked ${unlockDate(at)}`,
      description: persona.description,
      color: { light: persona.color, dark: darkenHex(persona.color, 0.6) },
      visual: <SharePortrait src={personaPortraitSrc(persona.id)} glow={persona.color} />,
    };
  }
  const { vibe, at } = open;
  return {
    eyebrow: 'Vibe',
    title: vibe.name,
    value: `Unlocked ${unlockDate(at)}`,
    description: vibe.description,
    color: { light: vibe.color.light, dark: darkenHex(vibe.color.dark, 0.55) },
    visual: vibe.image ? <SharePortrait src={vibe.image} glow={vibe.color.light} /> : undefined,
  };
}

function VibePresentation({ vibe, unlockedOn, titleId }: { vibe: MusicVibe; unlockedOn?: string; titleId?: string }) {
  const colors = { light: vibe.color.light, dark: darkenHex(vibe.color.dark, 0.55) };

  return (
    <ThemedCardBackground
      color={colors}
      className="rounded-3xl border shadow-2xl"
      style={{ borderColor: `${colors.light}30` }}
    >
      <div className="flex flex-col items-center px-6 py-8 text-center sm:px-10 sm:py-10">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/45">Vibe</p>
        {vibe.image && (
          <div
            className="mt-5 h-40 w-40 overflow-hidden rounded-full border-4"
            style={{ borderColor: `${colors.light}66`, boxShadow: `0 0 48px ${colors.light}55` }}
          >
            <img src={vibe.image} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <h2 id={titleId} className="mt-5 text-3xl font-black tracking-tight sm:text-5xl" style={{ color: colors.light }}>
          {vibe.name}
        </h2>
        <p className="mt-3 max-w-md text-base leading-relaxed text-white/85">{vibe.description}</p>
        {unlockedOn && <UnlockBadge label={`Unlocked ${unlockedOn}`} color={colors.light} />}
        <dl className="mt-8 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-5">
          {VIBE_TRAITS.map(trait => (
            <div
              key={trait.key}
              className="rounded-2xl border px-3 py-2.5"
              style={{ borderColor: `${colors.light}28`, backgroundColor: `${colors.light}10` }}
            >
              <dt className="flex items-center justify-center gap-1 text-[11px] uppercase tracking-wider text-white/45">
                {trait.label}
                <MetricInfo description={getMetricDescription(trait.tooltip)} />
              </dt>
              <dd className="mt-0.5 text-sm font-semibold" style={{ color: colors.light }}>
                {getDominantTrait(trait.key, vibe.targetScore[trait.key]).label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </ThemedCardBackground>
  );
}
