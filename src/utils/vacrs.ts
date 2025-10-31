import { VACRSScore } from "@/types";

  export const VACRS_COLORS = {
    valence: '#3B82F6', // Blue
    arousal: '#10B981', // Green
    complexity: '#F59E0B', // Yellow
    rawness: '#EC4899', // Pink
    socialPresence: '#8B5CF6', // Purple
  } satisfies Record<keyof VACRSScore, string>;