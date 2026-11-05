import {
  genreMissId,
  unlockId,
  type ActivityRecord,
  type GenreMissRecord,
  type Journal,
  type NewActivity,
  type NewUnlock,
  type RecordStore,
  type UnlockRecord,
} from './types';

const DB_NAME = 'spotifun';
const DB_VERSION = 2;
const STORES = ['genreMisses', 'activity', 'unlocks'] as const;

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
  });
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      // Version 1 kept one journal for the whole browser. Drop it so two accounts stay separate.
      if (event.oldVersion < 2) {
        for (const name of STORES) {
          if (db.objectStoreNames.contains(name)) db.deleteObjectStore(name);
        }
      }
      for (const name of STORES) {
        if (db.objectStoreNames.contains(name)) continue;
        const store = db.createObjectStore(name, { keyPath: 'id' });
        store.createIndex('byUser', 'userId');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

let databasePromise: Promise<IDBDatabase> | null = null;

function database(): Promise<IDBDatabase> {
  databasePromise ??= openDatabase();
  return databasePromise;
}

function uniqueLabels(names: string[]): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const raw of names) {
    const label = raw.trim();
    if (!label) continue;
    const name = label.toLowerCase();
    if (seen.has(name)) continue;
    seen.add(name);
    labels.push(label);
  }
  return labels;
}

function readForUser<T>(store: IDBObjectStore, userId: string): Promise<T[]> {
  return requestToPromise(store.index('byUser').getAll(userId) as IDBRequest<T[]>);
}

export function createIndexedDbRecordStore(userId: string): RecordStore {
  return {
    async recordGenreMisses(names) {
      const labels = uniqueLabels(names);
      if (labels.length === 0) return;
      const db = await database();
      const at = new Date().toISOString();
      const transaction = db.transaction('genreMisses', 'readwrite');
      const store = transaction.objectStore('genreMisses');
      for (const label of labels) {
        const name = label.toLowerCase();
        const id = genreMissId(userId, name);
        const request = store.get(id) as IDBRequest<GenreMissRecord | undefined>;
        request.onsuccess = () => {
          const existing = request.result;
          const next: GenreMissRecord = existing
            ? { ...existing, times: existing.times + 1, lastSeenAt: at }
            : { id, userId, name, label, times: 1, firstSeenAt: at, lastSeenAt: at };
          store.put(next);
        };
      }
      await transactionDone(transaction);
    },

    async recordActivity(activity: NewActivity) {
      const db = await database();
      const record: ActivityRecord = {
        id: crypto.randomUUID(),
        userId,
        at: new Date().toISOString(),
        kind: activity.kind,
        name: activity.name,
        ok: activity.ok,
        detail: activity.detail ?? {},
      };
      const transaction = db.transaction('activity', 'readwrite');
      transaction.objectStore('activity').put(record);
      await transactionDone(transaction);
    },

    async recordUnlocks(unlocks) {
      if (unlocks.length === 0) return [];
      const db = await database();
      const at = new Date().toISOString();
      const transaction = db.transaction('unlocks', 'readwrite');
      const store = transaction.objectStore('unlocks');
      const fresh: UnlockRecord[] = [];
      for (const unlock of unlocks) {
        const id = unlockId(userId, unlock.kind, unlock.key);
        const request = store.get(id) as IDBRequest<UnlockRecord | undefined>;
        request.onsuccess = () => {
          if (request.result) return;
          const created: UnlockRecord = { ...unlock, id, userId, at };
          store.put(created);
          fresh.push(created);
        };
      }
      await transactionDone(transaction);
      return fresh;
    },

    async readJournal(): Promise<Journal> {
      const db = await database();
      const transaction = db.transaction(['genreMisses', 'activity', 'unlocks'], 'readonly');
      const [genreMisses, activity, unlocks] = await Promise.all([
        readForUser<GenreMissRecord>(transaction.objectStore('genreMisses'), userId),
        readForUser<ActivityRecord>(transaction.objectStore('activity'), userId),
        readForUser<UnlockRecord>(transaction.objectStore('unlocks'), userId),
      ]);
      await transactionDone(transaction);
      activity.sort((a, b) => a.at.localeCompare(b.at));
      return { genreMisses, activity, unlocks };
    },
  };
}

const stores = new Map<string, RecordStore>();

export function getRecordStore(userId: string): RecordStore {
  const existing = stores.get(userId);
  if (existing) return existing;
  const created = createIndexedDbRecordStore(userId);
  stores.set(userId, created);
  return created;
}
