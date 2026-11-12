import React, { useMemo } from "react";
import { LockOpen, Share2 } from 'lucide-react';
import { Stats } from "@/types";
import { getUserPersona, personaPortraitSrc } from "@/utils/musicPersonas";
import { darkenHex } from "@/utils/color";
import { ThemedCardBackground } from "../ThemedCardBackground";
import { generatePersonaCaption } from "@/utils/visualizationCaptions";
import { MetricInfo } from '../MetricInfo';
import { getMetricDescription } from '@/utils/metricDescriptions';
import type { Persona, PersonaDimensions } from "@/utils/musicPersonas";

interface PersonaCardProps {
  stats: Stats;
  onShare?: () => void;
}

const TRAITS: Array<{
  key: keyof PersonaDimensions;
  label: string;
  tooltip: string;
  words: Record<string, string>;
}> = [
  { key: 'genreDiversity', label: 'Taste', tooltip: 'persona-genre-diversity', words: { high: 'Eclectic', low: 'Focused' } },
  { key: 'trackPopularity', label: 'Scene', tooltip: 'persona-popularity', words: { high: 'Mainstream', low: 'Underground' } },
  { key: 'artistConsistency', label: 'Loyalty', tooltip: 'persona-artist-loyalty', words: { high: 'Devoted', low: 'Wandering' } },
  { key: 'era', label: 'Era', tooltip: 'persona-era', words: { new: 'Modern', old: 'Classic' } },
  { key: 'valence', label: 'Mood', tooltip: 'persona-mood', words: { positive: 'Bright', negative: 'Somber' } },
  { key: 'arousal', label: 'Energy', tooltip: 'persona-energy', words: { energetic: 'Lively', calm: 'Gentle' } },
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

/** Ribbon on a collection detail card marking when that persona or vibe was found. */
export function UnlockBadge({ label, color }: { label: string; color: string }) {
  const ink = inkFor(color);
  return (
    <p className="mt-4 inline-flex items-end">
      <span aria-hidden className="h-7 w-2.5" style={{ background: color, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 70%)' }} />
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em]"
        style={{ background: color, color: ink }}
      >
        <LockOpen className="h-3.5 w-3.5" aria-hidden />
        {label}
      </span>
      <span aria-hidden className="h-7 w-2.5" style={{ background: color, clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 100%)' }} />
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
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {TRAITS.map(trait => (
              <div
                key={trait.key}
                className="rounded-2xl border px-3 py-2.5"
                style={{ borderColor: `${colors.light}28`, backgroundColor: `${colors.light}10` }}
              >
                <dt className="flex items-center justify-center gap-1 text-[11px] uppercase tracking-wider text-white/45 md:justify-start">
                  {trait.label}
                  <MetricInfo description={getMetricDescription(trait.tooltip)} />
                </dt>
                <dd className="mt-0.5 text-sm font-semibold" style={{ color: colors.light }}>
                  {traitValue(persona, trait.key, trait.words)}
                </dd>
              </div>
            ))}
          </dl>
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
