/**
 * Local journal of what one signed-in Spotify account has done in Spotifun on this browser.
 * Another account on the same browser has its own journal. The shapes are plain records so a
 * later shared backend can accept the same writes.
 */

export type DetailValue = string | number | boolean | null;
export type Detail = Record<string, DetailValue>;

export interface GenreMissRecord {
  /** `${userId}:${name}`. */
  id: string;
  userId: string;
  /** Lowercased label. */
  name: string;
  label: string;
  times: number;
  firstSeenAt: string;
  lastSeenAt: string;
}

export type ActivityKind = 'login' | 'api_call' | 'result';

export interface ActivityRecord {
  id: string;
  userId: string;
  at: string;
  kind: ActivityKind;
  /** Endpoint or action name, such as `stats` or `spotify`. */
  name: string;
  ok: boolean;
  detail: Detail;
}

export interface UnlockRecord {
  /** `${userId}:persona:<id>` or `${userId}:vibe:<id>`. */
  id: string;
  userId: string;
  kind: 'persona' | 'vibe';
  key: string;
  name: string;
  color: string;
  at: string;
  valence?: 'positive' | 'negative';
  arousal?: 'energetic' | 'calm';
}

export interface Journal {
  genreMisses: GenreMissRecord[];
  activity: ActivityRecord[];
  unlocks: UnlockRecord[];
}

export interface NewActivity {
  kind: ActivityKind;
  name: string;
  ok: boolean;
  detail?: Detail;
}

export interface NewUnlock {
  kind: UnlockRecord['kind'];
  key: string;
  name: string;
  color: string;
  valence?: UnlockRecord['valence'];
  arousal?: UnlockRecord['arousal'];
}

export interface RecordStore {
  recordGenreMisses(names: string[]): Promise<void>;
  recordActivity(activity: NewActivity): Promise<void>;
  /** Inserts unlocks that are not already stored. Returns the new ones. */
  recordUnlocks(unlocks: NewUnlock[]): Promise<UnlockRecord[]>;
  readJournal(): Promise<Journal>;
}

export function emptyJournal(): Journal {
  return { genreMisses: [], activity: [], unlocks: [] };
}

export function unlockId(userId: string, kind: UnlockRecord['kind'], key: string): string {
  return `${userId}:${kind}:${key}`;
}

export function genreMissId(userId: string, name: string): string {
  return `${userId}:${name}`;
}
