import { describe, expect, it } from 'vitest';
import { evaluateAchievements } from './achievements';
import { createMemoryRecordStore } from './memoryStore';
import { emptyJournal, type Journal } from './types';

function at(day: number, hour = 12): string {
  return new Date(2026, 10, day, hour, 0, 0).toISOString();
}

describe('evaluateAchievements', () => {
  it('starts with every badge locked', () => {
    const views = evaluateAchievements(emptyJournal());
    expect(views.length).toBeGreaterThan(10);
    expect(views.every(view => !view.earned)).toBe(true);
  });

  it('earns visit, look, persona, and vibe badges from the journal', async () => {
    const store = createMemoryRecordStore('ada', () => at(4, 23));
    await store.recordActivity({ kind: 'login', name: 'spotify', ok: true, detail: {} });
    await store.recordActivity({
      kind: 'result',
      name: 'stats',
      ok: true,
      detail: { mode: 'recent', timeRange: 'short_term' },
    });
    await store.recordUnlocks([
      { kind: 'persona', key: 'hopper', name: 'The Playlist Hopper', color: '#ec4899', valence: 'positive', arousal: 'energetic' },
      { kind: 'vibe', key: 'euphoria', name: 'Pure Euphoria', color: '#fde68a' },
    ]);

    const journal = await store.readJournal();
    const earned = new Set(evaluateAchievements(journal).filter(view => view.earned).map(view => view.id));
    expect(earned).toEqual(new Set(['signed-in', 'first-look', 'first-name', 'first-vibe', 'after-hours']));
  });

  it('counts distinct days, modes, eras, and both persona sides', () => {
    const journal: Journal = {
      genreMisses: [],
      unlocks: [
        { id: 'ada:persona:a', userId: 'ada', kind: 'persona', key: 'a', name: 'A', color: '#fff', at: at(1), valence: 'positive', arousal: 'calm' },
        { id: 'ada:persona:b', userId: 'ada', kind: 'persona', key: 'b', name: 'B', color: '#fff', at: at(2), valence: 'negative', arousal: 'energetic' },
      ],
      activity: [
        { id: '1', userId: 'ada', at: at(1), kind: 'login', name: 'spotify', ok: true, detail: {} },
        { id: '2', userId: 'ada', at: at(2), kind: 'login', name: 'spotify', ok: true, detail: {} },
        { id: '3', userId: 'ada', at: at(1), kind: 'result', name: 'stats', ok: true, detail: { mode: 'recent', timeRange: 'short_term' } },
        { id: '4', userId: 'ada', at: at(1), kind: 'result', name: 'stats', ok: true, detail: { mode: 'topArtists', timeRange: 'medium_term' } },
        { id: '5', userId: 'ada', at: at(1), kind: 'result', name: 'stats', ok: true, detail: { mode: 'topTracks', timeRange: 'long_term' } },
        { id: '6', userId: 'ada', at: at(1), kind: 'result', name: 'stats', ok: true, detail: { mode: 'playlist', timeRange: 'long_term' } },
      ],
    };
    const byId = new Map(evaluateAchievements(journal).map(view => [view.id, view]));
    expect(byId.get('back-again')?.earned).toBe(true);
    expect(byId.get('four-shelves')?.earned).toBe(true);
    expect(byId.get('three-eras')?.earned).toBe(true);
    expect(byId.get('both-moods')?.earned).toBe(true);
    expect(byId.get('both-energies')?.earned).toBe(true);
    expect(byId.get('three-names')?.earned).toBe(false);
  });

  it('does not record the same unlock twice', async () => {
    const store = createMemoryRecordStore('ada', () => at(1));
    const first = await store.recordUnlocks([{ kind: 'vibe', key: 'wonder', name: 'Wonder', color: '#fff' }]);
    const second = await store.recordUnlocks([{ kind: 'vibe', key: 'wonder', name: 'Wonder', color: '#fff' }]);
    expect(first).toHaveLength(1);
    expect(second).toHaveLength(0);
    expect((await store.readJournal()).unlocks).toHaveLength(1);
  });

  it('keeps two accounts in separate journals', async () => {
    const ada = createMemoryRecordStore('ada', () => at(1));
    const bea = createMemoryRecordStore('bea', () => at(1));
    await ada.recordUnlocks([{ kind: 'vibe', key: 'wonder', name: 'Wonder', color: '#fff' }]);
    await bea.recordActivity({ kind: 'login', name: 'spotify', ok: true });
    expect((await ada.readJournal()).unlocks.map(unlock => unlock.userId)).toEqual(['ada']);
    expect((await bea.readJournal()).unlocks).toHaveLength(0);
    expect((await bea.readJournal()).activity.map(event => event.userId)).toEqual(['bea']);
  });
});
