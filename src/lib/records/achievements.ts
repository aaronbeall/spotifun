import { MUSIC_VIBES } from '@/utils/musicVibes';
import type { ActivityRecord, Journal, UnlockRecord } from './types';

export interface AchievementView {
  id: string;
  title: string;
  detail: string;
  group: 'visit' | 'look' | 'persona' | 'vibe';
  progress: number;
  goal: number;
  earned: boolean;
  /** When the journal first crossed this badge's goal. Absent while it is locked. */
  earnedAt?: string;
}

const VIBE_TOTAL = MUSIC_VIBES.length;

function results(journal: Journal): ActivityRecord[] {
  return journal.activity.filter(event => event.kind === 'result' && event.ok);
}

function logins(journal: Journal): ActivityRecord[] {
  return journal.activity.filter(event => event.kind === 'login' && event.ok);
}

function localDay(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function distinctDays(events: ActivityRecord[]): number {
  return new Set(events.map(event => localDay(event.at))).size;
}

function detailValues(events: ActivityRecord[], key: string): Set<string> {
  const values = new Set<string>();
  for (const event of events) {
    const value = event.detail[key];
    if (typeof value === 'string' && value) values.add(value);
  }
  return values;
}

function unlocksOf(journal: Journal, kind: UnlockRecord['kind']): UnlockRecord[] {
  return journal.unlocks.filter(unlock => unlock.kind === kind);
}

function sideCount(unlocks: UnlockRecord[], field: 'valence' | 'arousal', a: string, b: string): number {
  const sides = new Set(unlocks.map(unlock => unlock[field]).filter(side => side === a || side === b));
  return sides.size;
}

function afterHours(journal: Journal): number {
  const hit = journal.activity.some(event => {
    const hour = new Date(event.at).getHours();
    return hour >= 22 || hour < 5;
  });
  return hit ? 1 : 0;
}

interface AchievementSpec {
  id: string;
  title: string;
  detail: string;
  group: AchievementView['group'];
  goal: number;
  progress: (journal: Journal) => number;
}

const ACHIEVEMENTS: AchievementSpec[] = [
  {
    id: 'signed-in',
    title: 'Signed in',
    detail: 'Connect Spotify on this browser.',
    group: 'visit',
    goal: 1,
    progress: journal => Math.min(1, logins(journal).length),
  },
  {
    id: 'back-again',
    title: 'Back again',
    detail: 'Open Spotifun on two different days.',
    group: 'visit',
    goal: 2,
    progress: journal => distinctDays(logins(journal)),
  },
  {
    id: 'regular',
    title: 'Regular',
    detail: 'Open Spotifun on five different days.',
    group: 'visit',
    goal: 5,
    progress: journal => distinctDays(logins(journal)),
  },
  {
    id: 'after-hours',
    title: 'After hours',
    detail: 'Use Spotifun between 10pm and 5am.',
    group: 'visit',
    goal: 1,
    progress: afterHours,
  },
  {
    id: 'first-look',
    title: 'First look',
    detail: 'Load one profile.',
    group: 'look',
    goal: 1,
    progress: journal => results(journal).length,
  },
  {
    id: 'five-looks',
    title: 'Five looks',
    detail: 'Load five profiles.',
    group: 'look',
    goal: 5,
    progress: journal => results(journal).length,
  },
  {
    id: 'twenty-looks',
    title: 'Twenty looks',
    detail: 'Load twenty profiles.',
    group: 'look',
    goal: 20,
    progress: journal => results(journal).length,
  },
  {
    id: 'four-shelves',
    title: 'Four shelves',
    detail: 'Open recent plays, top artists, top tracks, and a playlist.',
    group: 'look',
    goal: 4,
    progress: journal => detailValues(results(journal), 'mode').size,
  },
  {
    id: 'three-eras',
    title: 'Three eras',
    detail: 'Open a profile for about 4 weeks, 6 months, and several years.',
    group: 'look',
    goal: 3,
    progress: journal => detailValues(results(journal), 'timeRange').size,
  },
  {
    id: 'first-name',
    title: 'A name',
    detail: 'Land on a persona.',
    group: 'persona',
    goal: 1,
    progress: journal => unlocksOf(journal, 'persona').length,
  },
  {
    id: 'three-names',
    title: 'Three names',
    detail: 'Land on three different personas.',
    group: 'persona',
    goal: 3,
    progress: journal => unlocksOf(journal, 'persona').length,
  },
  {
    id: 'eight-names',
    title: 'Eight names',
    detail: 'Land on eight different personas.',
    group: 'persona',
    goal: 8,
    progress: journal => unlocksOf(journal, 'persona').length,
  },
  {
    id: 'both-moods',
    title: 'Both moods',
    detail: 'Land on a brighter persona and a darker one.',
    group: 'persona',
    goal: 2,
    progress: journal => sideCount(unlocksOf(journal, 'persona'), 'valence', 'positive', 'negative'),
  },
  {
    id: 'both-energies',
    title: 'Both energies',
    detail: 'Land on an energetic persona and a calm one.',
    group: 'persona',
    goal: 2,
    progress: journal => sideCount(unlocksOf(journal, 'persona'), 'arousal', 'energetic', 'calm'),
  },
  {
    id: 'first-vibe',
    title: 'A vibe',
    detail: 'Land on a vibe.',
    group: 'vibe',
    goal: 1,
    progress: journal => unlocksOf(journal, 'vibe').length,
  },
  {
    id: 'five-vibes',
    title: 'Five vibes',
    detail: 'Land on five different vibes.',
    group: 'vibe',
    goal: 5,
    progress: journal => unlocksOf(journal, 'vibe').length,
  },
  {
    id: 'all-vibes',
    title: 'Every vibe',
    detail: `Land on all ${VIBE_TOTAL} vibes.`,
    group: 'vibe',
    goal: VIBE_TOTAL,
    progress: journal => unlocksOf(journal, 'vibe').length,
  },
];

function journalThrough(journal: Journal, at: string): Journal {
  return {
    genreMisses: journal.genreMisses,
    activity: journal.activity.filter(event => event.at <= at),
    unlocks: journal.unlocks.filter(unlock => unlock.at <= at),
  };
}

/** Earliest journal timestamp at which this badge's progress reached its goal. */
function firstEarnedAt(spec: AchievementSpec, journal: Journal): string | undefined {
  if (spec.progress(journal) < spec.goal) return undefined;
  const times = [...journal.activity.map(event => event.at), ...journal.unlocks.map(unlock => unlock.at)].sort();
  let previous = '';
  for (const at of times) {
    if (at === previous) continue;
    previous = at;
    if (spec.progress(journalThrough(journal, at)) >= spec.goal) return at;
  }
  return undefined;
}

export function evaluateAchievements(journal: Journal): AchievementView[] {
  return ACHIEVEMENTS.map(spec => {
    const progress = Math.min(spec.goal, spec.progress(journal));
    const earned = progress >= spec.goal;
    return {
      id: spec.id,
      title: spec.title,
      detail: spec.detail,
      group: spec.group,
      progress,
      goal: spec.goal,
      earned,
      earnedAt: earned ? firstEarnedAt(spec, journal) : undefined,
    };
  });
}

export function earnedIds(journal: Journal): Set<string> {
  return new Set(evaluateAchievements(journal).filter(achievement => achievement.earned).map(achievement => achievement.id));
}
