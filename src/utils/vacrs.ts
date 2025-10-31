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