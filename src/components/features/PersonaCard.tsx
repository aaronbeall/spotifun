import React, { useMemo } from "react";
import { Stats } from "@/types";
import { getUserPersona } from "@/utils/musicPersonas";
import { darkenHex } from "@/utils/color";
import { GenerativeArt } from "../GenerativeArt";

interface PersonaCardProps {
  stats: Stats;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({ stats }) => {
  const persona = useMemo(() => getUserPersona(stats), [stats]);
  const colors = useMemo(() => ({ light: persona.color, dark: darkenHex(persona.color, 0.6) }), [persona.color]);
  const artProfile = useMemo(() => ({
    valence: persona.dimensions.valence === 'positive' ? 0.85 : 0.15,
    arousal: persona.dimensions.arousal === 'energetic' ? 0.85 : 0.15,
    complexity: persona.dimensions.genreDiversity === 'high' ? 0.85 : 0.15,
    rawness: persona.dimensions.trackPopularity === 'low' ? 0.85 : 0.15,
    socialPresence: persona.dimensions.artistConsistency === 'low' ? 0.85 : 0.15,
  }), [persona.dimensions]);

  return (
    <div
      className="rounded-xl p-8 shadow-xl border flex flex-col items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${colors.dark}, #111827)`,
        borderColor: `${colors.light}30`,
      }}
    >
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
