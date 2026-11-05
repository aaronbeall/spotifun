import React, { useMemo } from "react";
import { Share2 } from 'lucide-react';
import { Stats } from "@/types";
import { getUserPersona, MUSIC_PERSONAS, type Persona } from "@/utils/musicPersonas";
import { getPersonaCharacter, personaPortrait } from "@/utils/personaCharacters";
import { darkenHex, readableOnDark } from "@/utils/color";
import { ThemedCardBackground } from "../ThemedCardBackground";
import { generatePersonaCaption } from "@/utils/visualizationCaptions";
import { MetricInfo } from '../MetricInfo';
import { getMetricDescription } from '@/utils/metricDescriptions';

interface PersonaCardProps {
  stats: Stats;
  onShare?: () => void;
}

// Each persona dimension is a two-sided switch; the right-hand word is the
// "high" side. Showing both words makes the result read as a position, not a score.
function personaTraits(persona: Persona) {
  const d = persona.dimensions;
  return [
    { label: 'Genres', left: 'Focused', right: 'Wide', high: d.genreDiversity === 'high', tooltip: 'persona-genre-diversity' },
    { label: 'Popularity', left: 'Niche', right: 'Mainstream', high: d.trackPopularity === 'high', tooltip: 'persona-popularity' },
    { label: 'Artists', left: 'Hopper', right: 'Loyal', high: d.artistConsistency === 'high', tooltip: 'persona-artist-loyalty' },
    { label: 'Era', left: 'Classics', right: 'Fresh', high: d.era === 'new', tooltip: 'persona-era' },
    { label: 'Mood', left: 'Moody', right: 'Upbeat', high: d.valence === 'positive', tooltip: 'persona-mood' },
    { label: 'Energy', left: 'Calm', right: 'Energetic', high: d.arousal === 'energetic', tooltip: 'persona-energy' },
  ] as const;
}

/** The persona's character portrait, framed like a collectible card. */
export function PersonaPortrait({ persona, className = '', tilt = true }: { persona: Persona; className?: string; tilt?: boolean }) {
  const character = getPersonaCharacter(persona.id);
  const number = MUSIC_PERSONAS.findIndex(p => p.id === persona.id) + 1;
  const accent = readableOnDark(persona.color);
  return (
    <div className={`relative ${className}`}>
      <div
        className="pointer-events-none absolute inset-6 rounded-full blur-3xl opacity-60"
        style={{ background: persona.color }}
      />
      <div
        className={`relative rounded-[28px] p-2 shadow-2xl transition-transform duration-300 ${tilt ? '-rotate-2 hover:rotate-0' : ''}`}
        style={{ background: `linear-gradient(150deg, ${accent} 0%, ${darkenHex(persona.color, 0.55)} 100%)` }}
      >
        <div className="relative overflow-hidden rounded-[22px] bg-[#0a0812]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={personaPortrait(persona.id)}
            alt={character ? `${character.name}: ${character.bio}` : persona.name}
            className="block aspect-square w-full object-cover"
            draggable={false}
          />
          <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-white/85 backdrop-blur-sm">
            No. {String(number).padStart(2, '0')}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-2 px-2 pb-1 pt-2">
          <span className="font-display text-xl font-extrabold tracking-tight text-white drop-shadow">
            {character?.name ?? persona.name}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
            {number} of {MUSIC_PERSONAS.length}
          </span>
        </div>
      </div>
    </div>
  );
}

export const PersonaCard: React.FC<PersonaCardProps> = ({ stats, onShare }) => {
  const persona = useMemo(() => getUserPersona(stats), [stats]);
  const character = getPersonaCharacter(persona.id);
  const colors = useMemo(() => ({ light: persona.color, dark: darkenHex(persona.color, 0.6) }), [persona.color]);
  const accent = useMemo(() => readableOnDark(persona.color), [persona.color]);
  const caption = useMemo(() => generatePersonaCaption(stats), [stats]);
  const traits = personaTraits(persona);

  return (
    <ThemedCardBackground
      color={colors}
      className="rounded-3xl p-5 sm:p-8 shadow-2xl border"
      style={{ borderColor: `${colors.light}30` }}
    >
      {onShare && (
        <button
          onClick={onShare}
          aria-label="Share"
          className="absolute top-5 right-5 sm:top-6 sm:right-6 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white transition-colors shrink-0"
        >
          <Share2 className="w-4 h-4" />
        </button>
      )}

      <div className="grid items-center gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-10">
        <PersonaPortrait persona={persona} className="mx-auto mt-10 w-full max-w-[300px] md:mt-0 md:max-w-[440px]" />

        <div className="text-center md:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: `${accent}cc` }}>
            Your listener persona
          </p>
          <h3 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl" style={{ color: accent }}>
            {persona.name}
          </h3>
          {character && (
            <p className="mt-3 text-sm italic text-white/60">
              Meet <span className="font-semibold not-italic text-white/85">{character.name}</span>. {character.bio}
            </p>
          )}
          <p className="mt-3 text-base leading-relaxed text-white/85">{persona.description}</p>
          <p className="mt-2 text-xs text-white/50">{caption}</p>

          <div className="mt-6 space-y-2 text-left">
            {traits.map(trait => {
              const tooltip = getMetricDescription(trait.tooltip);
              return (
                <div key={trait.label} className="flex items-center gap-3">
                  <span className="flex w-[5.5rem] shrink-0 items-center text-[10px] font-semibold uppercase tracking-wider text-white/45 sm:w-24 sm:text-[11px]">
                    {trait.label}
                    {tooltip && <MetricInfo description={tooltip} />}
                  </span>
                  <div className="grid min-w-0 flex-1 grid-cols-2 rounded-full border border-white/10 bg-white/[0.04] p-0.5 text-[11px] sm:text-xs">
                    {[{ word: trait.left, on: !trait.high }, { word: trait.right, on: trait.high }].map(side => (
                      <span
                        key={side.word}
                        className={`truncate rounded-full px-1.5 py-1 text-center transition-colors sm:px-2 ${side.on ? 'font-semibold' : 'text-white/30'}`}
                        style={side.on ? { backgroundColor: `${accent}26`, color: accent, boxShadow: `inset 0 0 0 1px ${accent}40` } : undefined}
                      >
                        {side.word}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ThemedCardBackground>
  );
};
