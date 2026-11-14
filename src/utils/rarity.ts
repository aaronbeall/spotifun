/** Five-step reading of a 0–1 rarity score. Each step keeps its own color. */
export const RARITY_STEPS = [
  { id: 'common', label: 'Common', min: 0, color: '#94a3b8' },
  { id: 'uncommon', label: 'Uncommon', min: 0.2, color: '#5eead4' },
  { id: 'unusual', label: 'Unusual', min: 0.4, color: '#fbbf24' },
  { id: 'rare', label: 'Rare', min: 0.6, color: '#c4b5fd' },
  { id: 'very-rare', label: 'Very rare', min: 0.8, color: '#fb7185' },
] as const;

export type RarityStep = (typeof RARITY_STEPS)[number];

/** The Likert step that contains this score. 1 is the top of Very rare. */
export function rarityStep(score: number): RarityStep {
  let step: RarityStep = RARITY_STEPS[0];
  for (const candidate of RARITY_STEPS) {
    if (score >= candidate.min) step = candidate;
  }
  return step;
}
