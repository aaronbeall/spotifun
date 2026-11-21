/** The tip jar (Ko-fi, Buy Me a Coffee, Stripe link…). Nothing tip-related shows until it's set. */
export const TIP_URL = process.env.NEXT_PUBLIC_TIP_URL || '';

const VISITS_KEY = 'spotifun.tip.visits';
const SNOOZE_KEY = 'spotifun.tip.snoozeUntil';
const DONE_KEY = 'spotifun.tip.done';
const SESSION_KEY = 'spotifun.tip.countedThisSession';

/** Ask on the third dashboard visit at the earliest. */
export const TIP_MIN_VISITS = 3;
/** "Maybe later" quiets the jar for this long. */
export const TIP_SNOOZE_DAYS = 21;

function read(key: string, storage: Storage = window.localStorage): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string, storage: Storage = window.localStorage) {
  try {
    storage.setItem(key, value);
  } catch {
    // Private mode. The nudge just won't remember.
  }
}

/** Counts one dashboard visit per browser session and says whether a gentle nudge is due. */
export function noteVisitAndCheckNudge(now = Date.now()): boolean {
  if (!TIP_URL || typeof window === 'undefined') return false;
  let visits = Number(read(VISITS_KEY)) || 0;
  if (!read(SESSION_KEY, window.sessionStorage)) {
    visits += 1;
    write(VISITS_KEY, String(visits));
    write(SESSION_KEY, '1', window.sessionStorage);
  }
  if (read(DONE_KEY)) return false;
  if (visits < TIP_MIN_VISITS) return false;
  const snoozeUntil = Number(read(SNOOZE_KEY)) || 0;
  return now >= snoozeUntil;
}

export function snoozeTipNudge(now = Date.now()) {
  write(SNOOZE_KEY, String(now + TIP_SNOOZE_DAYS * 24 * 60 * 60 * 1000));
}

/** They tipped, or said they did. Either way, stop asking. */
export function markTipped() {
  write(DONE_KEY, '1');
}
