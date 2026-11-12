'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Share2, X } from 'lucide-react';
import { getRecordStore } from '@/lib/records/indexedDbStore';
import type { UnlockRecord } from '@/lib/records/types';
import type { MusicVibe, VACRSScore } from '@/types';
import { MUSIC_PERSONAS, personaPortraitSrc, type Persona } from '@/utils/musicPersonas';
import { MUSIC_VIBES } from '@/utils/musicVibes';
import { darkenHex } from '@/utils/color';
import { VACRS_COLORS, VACRS_RANGE_LABELS } from '@/utils/vacrs';
import { ThemedCardBackground } from '../ThemedCardBackground';
import { SectionShareButton } from '../SectionShareButton';
import { ShareModal } from '../ShareModal';
import type { ShareContent } from '../ShareCardTemplate';
import { PersonaPresentation, UnlockBadge } from './PersonaCard';

const VIBE_TRAITS: Array<{ key: keyof VACRSScore; label: string }> = [
  { key: 'valence', label: 'Mood' },
  { key: 'arousal', label: 'Energy' },
  { key: 'complexity', label: 'Depth' },
  { key: 'rawness', label: 'Texture' },
  { key: 'socialPresence', label: 'Setting' },
];

/** How far a 0–1 score leans, in that dimension's own pole words. Exact center has no phrase. */
function likertPhrase(key: keyof VACRSScore, score: number): string | null {
  const [low, high] = VACRS_RANGE_LABELS[key];
  if (Math.abs(score - 0.5) < 0.001) return null;
  if (score < 0.2) return `Very ${low.toLowerCase()}`;
  if (score < 0.5) return low;
  if (score < 0.8) return high;
  return `Very ${high.toLowerCase()}`;
}

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

export function UnlockMeter({ found, total, accent, label }: { found: number; total: number; accent: string; label: string }) {
  const percent = total === 0 ? 0 : (found / total) * 100;
  return (
    <div className="flex items-center gap-1.5" aria-label={`${found} of ${total} ${label} unlocked`}>
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-black/40 ring-1 ring-white/10">
        <div
          className="h-full rounded-full"
          style={{
            width: found === 0 ? 0 : `max(${percent}%, 3px)`,
            background: `linear-gradient(90deg, ${accent}99, ${accent})`,
            boxShadow: found > 0 ? `0 0 8px ${accent}88` : undefined,
          }}
        />
      </div>
      <p className="shrink-0 text-[11px] font-semibold tabular-nums text-white">
        {found}
        <span className="font-medium text-white/40">/{total}</span>
      </p>
    </div>
  );
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
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Vibes</h3>
          <div className="flex items-center gap-2">
            <UnlockMeter found={vibes.size} total={MUSIC_VIBES.length} accent="#f0abfc" label="vibes" />
            {vibes.size > 0 && (
              <SectionShareButton onClick={() => setShare(vibeCollectionShare(vibes))} />
            )}
          </div>
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
                    className={`h-16 w-16 rounded-full ${unlock ? 'transition duration-200 group-hover:scale-110' : ''}`}
                  />
                )}
                <p className="mt-2 text-sm font-semibold leading-tight text-white">{vibe.name}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                  {date}
                </p>
              </>
            );
            const frame = 'flex w-full flex-col items-center rounded-2xl border px-3 py-4 text-center';
            return (
              <li key={vibe.id} className={unlock ? '' : 'grayscale opacity-40'}>
                {unlock ? (
                  <button
                    type="button"
                    onClick={() => setOpen({ kind: 'vibe', vibe, at: unlock.at })}
                    aria-label={`${vibe.name}, unlocked ${date}`}
                    className={`group ${frame} transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_28px_-14px_var(--tile)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white`}
                    style={{
                      background: `linear-gradient(165deg, ${vibe.color.light}38, ${vibe.color.dark}55)`,
                      borderColor: `${vibe.color.light}80`,
                      ['--tile' as string]: vibe.color.light,
                    }}
                  >
                    {body}
                  </button>
                ) : (
                  <div className={`${frame} border-white/10 bg-[#120c18]`}>
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Personas</h3>
          <div className="flex items-center gap-2">
            <UnlockMeter found={personas.size} total={MUSIC_PERSONAS.length} accent="#fcd34d" label="personas" />
            {personas.size > 0 && (
              <SectionShareButton onClick={() => setShare(personaCollectionShare(personas))} />
            )}
          </div>
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
              className="absolute -top-3 -right-3 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-gray-800 text-white shadow-lg hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
            {open.kind === 'persona' ? (
              <PersonaPresentation
                persona={open.persona}
                unlockedOn={unlockDate(open.at)}
                titleId="persona-detail-title"
                onShare={() => setShare(itemShare(open))}
              />
            ) : (
              <VibePresentation
                vibe={open.vibe}
                unlockedOn={unlockDate(open.at)}
                titleId="vibe-detail-title"
                onShare={() => setShare(itemShare(open))}
              />
            )}
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
      description: persona.description,
      banner: <UnlockBadge label={`Unlocked ${unlockDate(at)}`} color={persona.color} />,
      color: { light: persona.color, dark: darkenHex(persona.color, 0.6) },
      visual: <SharePortrait src={personaPortraitSrc(persona.id)} glow={persona.color} />,
    };
  }
  const { vibe, at } = open;
  return {
    eyebrow: 'Vibe',
    title: vibe.name,
    description: vibe.description,
    banner: <UnlockBadge label={`Unlocked ${unlockDate(at)}`} color={vibe.color.light} />,
    color: { light: vibe.color.light, dark: darkenHex(vibe.color.dark, 0.55) },
    visual: vibe.image ? <SharePortrait src={vibe.image} glow={vibe.color.light} /> : undefined,
  };
}

function VibePresentation({
  vibe,
  unlockedOn,
  titleId,
  onShare,
}: {
  vibe: MusicVibe;
  unlockedOn?: string;
  titleId?: string;
  onShare?: () => void;
}) {
  const colors = { light: vibe.color.light, dark: darkenHex(vibe.color.dark, 0.55) };

  return (
    <ThemedCardBackground
      color={colors}
      className="rounded-3xl border shadow-2xl"
      style={{ borderColor: `${colors.light}30` }}
    >
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
        <div className="mt-8 w-full max-w-lg space-y-3 text-left">
          {VIBE_TRAITS.map(trait => {
            const score = vibe.targetScore[trait.key];
            const phrase = likertPhrase(trait.key, score);
            const color = VACRS_COLORS[trait.key];
            const middle = Math.abs(score - 0.5) < 0.001;
            const towardHigh = score > 0.5;
            const [low, high] = VACRS_RANGE_LABELS[trait.key];
            const counter = 'text-right text-sm font-normal text-white/15';
            return (
              <div key={trait.key} className="grid grid-cols-[9rem_1fr_9rem] items-center gap-3">
                {!middle && !towardHigh ? (
                  <p className="text-right text-sm font-medium" style={{ color }}>{phrase}</p>
                ) : (
                  <p className={counter}>{low}</p>
                )}
                <div
                  className="relative h-6"
                  role="img"
                  aria-label={phrase ? `${trait.label}, ${phrase}` : `${trait.label}, between ${low} and ${high}`}
                >
                  <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-black/40" />
                  {middle ? (
                    <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ backgroundColor: color }} />
                  ) : (
                    <div
                      className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full"
                      style={{
                        width: `max(${Math.abs(score - 0.5) * 100}%, 14px)`,
                        [towardHigh ? 'left' : 'right']: '50%',
                        backgroundColor: color,
                      }}
                    />
                  )}
                </div>
                {!middle && towardHigh ? (
                  <p className="text-sm font-medium" style={{ color }}>{phrase}</p>
                ) : (
                  <p className="text-sm font-normal text-white/15">{high}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </ThemedCardBackground>
  );
}
