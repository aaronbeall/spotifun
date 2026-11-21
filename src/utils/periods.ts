import type { TimeRange } from '@/types';

/** Short labels for toggles */
export const PERIOD_LABEL: Record<TimeRange, string> = {
  '7day': '7 days',
  '1month': '1 month',
  '3month': '3 months',
  '6month': '6 months',
  '12month': '1 year',
  overall: 'All time',
};

/** Even shorter labels for tight toggles on phones */
export const PERIOD_SHORT_LABEL: Record<TimeRange, string> = {
  '7day': '7d',
  '1month': '1m',
  '3month': '3m',
  '6month': '6m',
  '12month': '1y',
  overall: 'All',
};

/** Fits "your top artists from ___" */
export const PERIOD_PHRASE: Record<TimeRange, string> = {
  '7day': 'the last 7 days',
  '1month': 'the last month',
  '3month': 'the last 3 months',
  '6month': 'the last 6 months',
  '12month': 'the last year',
  overall: 'all time',
};

export const PERIOD_COLOR: Record<TimeRange, string> = {
  '7day': '#a5f3fc',
  '1month': '#67e8f9',
  '3month': '#93c5fd',
  '6month': '#c4b5fd',
  '12month': '#f9a8d4',
  overall: '#fbbf24',
};
