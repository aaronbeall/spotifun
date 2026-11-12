import type { Stats } from '@/types';
import { findBestMatchingVibe } from '@/utils/musicVibesAnalyzer';
import { getUserPersona } from '@/utils/musicPersonas';
import { earnedIds, evaluateAchievements, type AchievementView } from './achievements';
import { getRecordStore } from './indexedDbStore';
import type { Detail, UnlockRecord } from './types';

export interface JournalNews {
  unlocks: UnlockRecord[];
  achievements: AchievementView[];
}

const EMPTY_NEWS: JournalNews = { unlocks: [], achievements: [] };

let activeUserId: string | null = null;
let lastFingerprint = '';
let lastFingerprintAt = 0;

/** Points later journal writes at this Spotify account. Pass null on logout. */
export function setActiveUser(userId: string | null): void {
  activeUserId = userId || null;
}

/** Lets the next profile look record again after the journal is forgotten. */
export function resetObservation(): void {
  lastFingerprint = '';
  lastFingerprintAt = 0;
}

function fingerprint(userId: string, stats: Stats, personaId: string, vibeId: string): string {
  return [userId, stats.mode, stats.timeRange, stats.playlist?.id ?? '', personaId, vibeId].join('|');
}

export async function observeLogin(user: { id?: string; display_name?: string }): Promise<void> {
  if (!user.id) return;
  setActiveUser(user.id);
  const notedKey = `spotifun.loginNoted:${user.id}`;
  if (sessionStorage.getItem(notedKey) === '1') return;
  sessionStorage.setItem(notedKey, '1');
  await getRecordStore(user.id).recordActivity({
    kind: 'login',
    name: 'spotify',
    ok: true,
    detail: {
      userId: user.id,
      displayName: user.display_name ?? '',
    },
  });
}

export function noteApiCall(name: string, ok: boolean, detail: Detail = {}): void {
  if (!activeUserId) return;
  void getRecordStore(activeUserId).recordActivity({ kind: 'api_call', name, ok, detail }).catch(() => {});
}

/**
 * Records one profile result and any persona or vibe it unlocks for the first time.
 * An identical result a couple of seconds later is ignored, so a doubled load does not count twice.
 */
export async function observeStatsResult(stats: Stats): Promise<JournalNews> {
  if (!activeUserId) return EMPTY_NEWS;
  const userId = activeUserId;
  const persona = getUserPersona(stats);
  const vibe = findBestMatchingVibe(stats.genres).vibe;
  const mark = fingerprint(userId, stats, persona.id, vibe.id);
  const now = Date.now();
  if (mark === lastFingerprint && now - lastFingerprintAt < 2500) return EMPTY_NEWS;
  lastFingerprint = mark;
  lastFingerprintAt = now;

  const store = getRecordStore(userId);
  const before = earnedIds(await store.readJournal());
  const detail: Detail = {
    mode: stats.mode,
    timeRange: stats.timeRange,
    playlistId: stats.playlist?.id ?? '',
    personaId: persona.id,
    personaName: persona.name,
    vibeId: vibe.id,
    vibeName: vibe.name,
    genreMisses: stats.unmatchedGenres?.length ?? 0,
  };

  await store.recordActivity({ kind: 'api_call', name: 'stats', ok: true, detail });
  await store.recordActivity({ kind: 'result', name: 'stats', ok: true, detail });
  await store.recordGenreMisses(stats.unmatchedGenres ?? []);
  const unlocks = await store.recordUnlocks([
    {
      kind: 'persona',
      key: persona.id,
      name: persona.name,
      color: persona.color,
      valence: persona.dimensions.valence,
      arousal: persona.dimensions.arousal,
    },
    {
      kind: 'vibe',
      key: vibe.id,
      name: vibe.name,
      color: vibe.color.light,
    },
  ]);

  const achievements = evaluateAchievements(await store.readJournal()).filter(achievement => (
    achievement.earned && !before.has(achievement.id)
  ));

  return { unlocks, achievements };
}
