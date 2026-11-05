import {
  emptyJournal,
  genreMissId,
  unlockId,
  type GenreMissRecord,
  type Journal,
  type NewActivity,
  type NewUnlock,
  type RecordStore,
  type UnlockRecord,
} from './types';

export function createMemoryRecordStore(
  userId: string,
  now: () => string = () => new Date().toISOString(),
): RecordStore {
  const journal = emptyJournal();

  return {
    async recordGenreMisses(names) {
      const at = now();
      for (const raw of names) {
        const label = raw.trim();
        if (!label) continue;
        const name = label.toLowerCase();
        const existing = journal.genreMisses.find(miss => miss.name === name);
        if (existing) {
          existing.times += 1;
          existing.lastSeenAt = at;
        } else {
          const created: GenreMissRecord = {
            id: genreMissId(userId, name),
            userId,
            name,
            label,
            times: 1,
            firstSeenAt: at,
            lastSeenAt: at,
          };
          journal.genreMisses.push(created);
        }
      }
    },

    async recordActivity(activity: NewActivity) {
      journal.activity.push({
        id: `${journal.activity.length}-${activity.kind}`,
        userId,
        at: now(),
        kind: activity.kind,
        name: activity.name,
        ok: activity.ok,
        detail: activity.detail ?? {},
      });
    },

    async recordUnlocks(unlocks: NewUnlock[]) {
      const fresh: UnlockRecord[] = [];
      const at = now();
      for (const unlock of unlocks) {
        const id = unlockId(userId, unlock.kind, unlock.key);
        if (journal.unlocks.some(saved => saved.id === id)) continue;
        const created: UnlockRecord = { ...unlock, id, userId, at };
        journal.unlocks.push(created);
        fresh.push(created);
      }
      return fresh;
    },

    async readJournal(): Promise<Journal> {
      return {
        genreMisses: journal.genreMisses.map(miss => ({ ...miss })),
        activity: journal.activity.map(event => ({ ...event, detail: { ...event.detail } })),
        unlocks: journal.unlocks.map(unlock => ({ ...unlock })),
      };
    },
  };
}
