import React, { useMemo } from "react";
import {
  CassetteTape,
  Feather,
  Flame,
  Focus,
  Footprints,
  Heart,
  Landmark,
  LockOpen,
  Moon,
  Radio,
  Share2,
  Shuffle,
  Sparkles,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { Stats } from "@/types";
import { getUserPersona, personaPortraitSrc } from "@/utils/musicPersonas";
import { darkenHex } from "@/utils/color";
import { ThemedCardBackground } from "../ThemedCardBackground";
import { generatePersonaCaption } from "@/utils/visualizationCaptions";
import type { Persona, PersonaDimensions } from "@/utils/musicPersonas";

interface PersonaCardProps {
  stats: Stats;
  onShare?: () => void;
}

const TRAITS: Array<{
  key: keyof PersonaDimensions;
  words: Record<string, string>;
  icons: Record<string, LucideIcon>;
}> = [
  { key: 'genreDiversity', words: { high: 'Eclectic', low: 'Focused' }, icons: { high: Shuffle, low: Focus } },
  { key: 'trackPopularity', words: { high: 'Mainstream', low: 'Underground' }, icons: { high: Radio, low: CassetteTape } },
  { key: 'artistConsistency', words: { high: 'Devoted', low: 'Wandering' }, icons: { high: Heart, low: Footprints } },
  { key: 'era', words: { new: 'Modern', old: 'Classic' }, icons: { new: Sparkles, old: Landmark } },
  { key: 'valence', words: { positive: 'Bright', negative: 'Somber' }, icons: { positive: Sun, negative: Moon } },
  { key: 'arousal', words: { energetic: 'Lively', calm: 'Gentle' }, icons: { energetic: Flame, calm: Feather } },
];

function traitValue(persona: Persona, key: keyof PersonaDimensions, words: Record<string, string>): string {
  return words[persona.dimensions[key]] ?? persona.dimensions[key];
}

function inkFor(hex: string): string {
  const rgb = hex.match(/\w\w/g)?.map(part => parseInt(part, 16));
  if (!rgb || rgb.length < 3) return '#1c1917';
  const luminance = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return luminance > 170 ? '#1c1917' : '#fff';
}

/** Notched end of an unlock ribbon, held in a flat shade so it sits behind the bright center. */
export function RibbonTail({ side, color, className, notch = 70 }: { side: 'left' | 'right'; color: string; className: string; notch?: number }) {
  const clip = side === 'left'
    ? `polygon(0 0, 100% 0, 100% 100%, 0 ${notch}%)`
    : `polygon(0 0, 100% 0, 100% ${notch}%, 0 100%)`;
  return (
    <span
      aria-hidden
      className={`w-2.5 shrink-0 ${className}`}
      style={{ background: darkenHex(color, 0.42), clipPath: clip }}
    />
  );
}

/** Ribbon on a collection detail card marking when that persona or vibe was found. */
export function UnlockBadge({ label, color }: { label: string; color: string }) {
  const ink = inkFor(color);
  return (
    <p className="mt-4 inline-flex items-end">
      <RibbonTail side="left" color={color} className="h-7" />
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em]"
        style={{ background: color, color: ink }}
      >
        <LockOpen className="h-3.5 w-3.5" aria-hidden />
        {label}
      </span>
      <RibbonTail side="right" color={color} className="h-7" />
    </p>
  );
}

export function PersonaPresentation({
  persona,
  note,
  unlockedOn,
  onShare,
  titleId,
}: {
  persona: Persona;
  note?: string;
  unlockedOn?: string;
  onShare?: () => void;
  titleId?: string;
}) {
  const colors = { light: persona.color, dark: darkenHex(persona.color, 0.6) };

  return (
    <ThemedCardBackground
      color={colors}
      className="rounded-3xl border shadow-2xl"
      style={{ borderColor: `${colors.light}30` }}
    >
      {onShare && (
        <button
          onClick={onShare}
          aria-label="Share"
          className="absolute top-6 right-6 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 border border-white/10 text-gray-200 hover:text-white transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>
      )}
      <div className="grid items-center gap-6 p-6 md:grid-cols-[minmax(0,17rem)_1fr] md:gap-10 md:p-8">
        <div
          className="relative mx-auto aspect-square w-full max-w-[17rem] overflow-hidden rounded-[2rem] border"
          style={{ borderColor: `${colors.light}55`, boxShadow: `0 0 0 6px ${colors.light}14` }}
        >
          <img
            src={personaPortraitSrc(persona.id)}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 text-center md:text-left">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/45">Listener persona</p>
          <h2 id={titleId} className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: colors.light }}>
            {persona.name}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-white/85">{persona.description}</p>
          {note && <p className="mt-2 text-sm leading-relaxed text-white/50">{note}</p>}
          {unlockedOn && <UnlockBadge label={`Unlocked ${unlockedOn}`} color={colors.light} />}
          <ul className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start">
            {TRAITS.map(trait => {
              const side = persona.dimensions[trait.key];
              const Icon = trait.icons[side];
              return (
                <li
                  key={trait.key}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold"
                  style={{ borderColor: `${colors.light}55`, backgroundColor: `${colors.light}18`, color: colors.light }}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
                  {traitValue(persona, trait.key, trait.words)}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </ThemedCardBackground>
  );
}

export const PersonaCard: React.FC<PersonaCardProps> = ({ stats, onShare }) => {
  const persona = useMemo(() => getUserPersona(stats), [stats]);
  const caption = useMemo(() => generatePersonaCaption(stats), [stats]);
  return <PersonaPresentation persona={persona} note={caption} onShare={onShare} />;
};
