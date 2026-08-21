import { VACRSScore } from "@/types";

  export const VACRS_COLORS = {
    valence: '#3B82F6', // Blue
    arousal: '#10B981', // Green
    complexity: '#F59E0B', // Yellow
    rawness: '#EC4899', // Pink
    socialPresence: '#8B5CF6', // Purple
  } satisfies Record<keyof VACRSScore, string>;

  export const VACRS_NAMES = {
    valence: 'Valence',
    arousal: 'Arousal',
    complexity: 'Complexity',
    rawness: 'Rawness',
    socialPresence: 'Social Presence',
  } satisfies Record<keyof VACRSScore, string>;

  export const VACRS_RANGE_LABELS = {
    valence: ['Unpleasant', 'Pleasant'],
    arousal: ['Calm', 'Energetic'],
    complexity: ['Simple', 'Complex'],
    rawness: ['Polished', 'Raw'],
    socialPresence: ['Solitary', 'Communal'],
  } satisfies Record<keyof VACRSScore, [string, string]>;

  export const VACRS_DIMENSIONS = [
    'valence',
    'arousal',
    'complexity',
    'rawness',
    'socialPresence',
  ] as const satisfies readonly (keyof VACRSScore)[];

// VACRS itself (the dimension/axis names, the 0-1 scale) is internal
// machinery — user-facing content should talk about the trait a score leans
// toward instead ("78% Pleasant", not "Valence: 0.78"). Every dimension's
// score sits on a 0 (low-label) to 1 (high-label) scale with 0.5 as neutral;
// this reframes it as "how far toward which trait".
export function getDominantTrait(dim: keyof VACRSScore, score: number) {
  const isHigh = score >= 0.5;
  const percent = Math.round((isHigh ? score : 1 - score) * 100);
  const label = VACRS_RANGE_LABELS[dim][isHigh ? 1 : 0];
  return { label, percent, isHigh };
}