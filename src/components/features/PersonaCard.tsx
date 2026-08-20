import React, { useMemo } from "react";
import { Share2 } from 'lucide-react';
import { Stats } from "@/types";
import { getUserPersona, personaToArtProfile } from "@/utils/musicPersonas";
import { darkenHex } from "@/utils/color";
import { GenerativeArt } from "../GenerativeArt";

interface PersonaCardProps {
  stats: Stats;
  onShare?: () => void;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({ stats, onShare }) => {
  const persona = useMemo(() => getUserPersona(stats), [stats]);
  const colors = useMemo(() => ({ light: persona.color, dark: darkenHex(persona.color, 0.6) }), [persona.color]);
  const artProfile = useMemo(() => personaToArtProfile(persona), [persona]);

  return (
    <div
      className="relative rounded-3xl p-6 shadow-2xl border flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colors.dark}, #111827)`,
        borderColor: `${colors.light}30`,
      }}
    >
      {onShare && (
        <button
          onClick={onShare}
          aria-label="Share"
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white transition-colors shrink-0"
        >
          <Share2 className="w-4 h-4" />
        </button>
      )}
      <div className="relative w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
        <GenerativeArt seed={persona.id} colors={colors} profile={artProfile} className="w-full h-full" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Listener Persona</h3>
      <div className="mb-4 text-white/80 text-center max-w-md">
        <span className="block text-lg font-semibold mb-1" style={{ color: colors.light }}>{persona.name}</span>
        <span className="block text-sm">{persona.description}</span>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs">
        {[
          { label: 'Genre Diversity', value: persona.dimensions.genreDiversity },
          { label: 'Popularity', value: persona.dimensions.trackPopularity },
          { label: 'Artist Loyalty', value: persona.dimensions.artistConsistency },
          { label: 'Era', value: persona.dimensions.era },
          { label: 'Mood', value: persona.dimensions.valence },
          { label: 'Energy', value: persona.dimensions.arousal },
        ].map(({ label, value }) => (
          <span
            key={label}
            className="px-2.5 py-1 rounded-full border capitalize"
            style={{ borderColor: `${colors.light}30`, color: colors.light, backgroundColor: `${colors.light}0f` }}
          >
            {label}: {value}
          </span>
        ))}
      </div>
    </div>
  );
};
