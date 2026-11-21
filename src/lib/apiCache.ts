/**
 * Cached, rate-limited JSON fetches for the outside music APIs (Last.fm and Deezer).
 *
 * Three layers keep request counts low:
 * 1. Next's persistent fetch cache (the Vercel data cache in production), with a lifetime
 *    per kind of data: artist and track metadata for weeks, listening data for minutes.
 * 2. A cache-only probe before any network request. Next's cache lookup ignores the abort
 *    signal, but a miss passes it to the network fetch, which then rejects without a
 *    request. So cache hits return at once and only misses wait for the throttle below.
 * 3. A per-service throttle (requests spaced out per server instance), in-flight
 *    de-duplication, and a cooldown after a rate-limit error during which only cache hits
 *    are served.
 *
 * Both APIs report some errors with HTTP 200. Those bodies would otherwise be cached for
 * the full lifetime, so transient errors expire their cache entry right away.
 */
import { revalidateTag } from 'next/cache';

export type ServiceName = 'lastfm' | 'deezer';

interface ServiceConfig {
  /** Minimum gap between network requests from one server instance */
  minIntervalMs: number;
  /** How long to serve cache only after a rate-limit error */
  cooldownMs: number;
}

const SERVICES: Record<ServiceName, ServiceConfig> = {
  // Last.fm publishes no number; about 5 per second per IP is the commonly quoted ceiling.
  lastfm: { minIntervalMs: 220, cooldownMs: 60_000 },
  // Deezer allows 50 requests per 5 seconds.
  deezer: { minIntervalMs: 110, cooldownMs: 10_000 },
};

/** Cache lifetimes in seconds */
export const TTL = {
  minute: 60,
  fifteenMinutes: 15 * 60,
  hour: 60 * 60,
  sixHours: 6 * 60 * 60,
  day: 24 * 60 * 60,
  week: 7 * 24 * 60 * 60,
  month: 30 * 24 * 60 * 60,
} as const;

export class RateLimitedError extends Error {
  constructor(readonly service: ServiceName) {
    super(`${service} rate limit`);
    this.name = 'RateLimitedError';
  }
}

const nextSlot: Record<ServiceName, number> = { lastfm: 0, deezer: 0 };
const cooldownUntil: Record<ServiceName, number> = { lastfm: 0, deezer: 0 };
const inFlight = new Map<string, Promise<unknown>>();

export function isCoolingDown(service: ServiceName): boolean {
  return Date.now() < cooldownUntil[service];
}

export function startCooldown(service: ServiceName) {
  if (!isCoolingDown(service)) {
    console.warn(`${service} rate limit hit; serving cache only for ${SERVICES[service].cooldownMs / 1000}s`);
  }
  cooldownUntil[service] = Date.now() + SERVICES[service].cooldownMs;
}

/** Waits for this instance's next free request slot for `service`. */
async function throttle(service: ServiceName) {
  const now = Date.now();
  const slot = Math.max(now, nextSlot[service]);
  nextSlot[service] = slot + SERVICES[service].minIntervalMs;
  if (slot > now) await new Promise(resolve => setTimeout(resolve, slot - now));
}

export type ErrorKind = 'ok' | 'not-found' | 'rate-limited' | 'transient' | 'error';

export interface CachedJsonOptions<T> {
  service: ServiceName;
  /** Cache lifetime in seconds. 0 skips the cache (e.g. now playing). */
  revalidate: number;
  /** Cache tag, so a bad entry can be expired. Truncated to Next's 256 character limit. */
  tag: string;
  /** Reads an error out of a 200 body. Defaults to 'ok'. */
  classify?: (body: T) => ErrorKind;
  /** Skip the cache-only probe. Use for short-lived data that must refresh on time. */
  skipProbe?: boolean;
}

export type CachedJsonResult<T> =
  | { ok: true; body: T }
  | { ok: false; kind: Exclude<ErrorKind, 'ok'>; body?: T };

async function parse<T>(response: Response): Promise<T | undefined> {
  try {
    return await response.json() as T;
  } catch {
    return undefined;
  }
}

function settle<T>(service: ServiceName, tag: string, body: T | undefined, classify?: (body: T) => ErrorKind): CachedJsonResult<T> {
  if (body === undefined) {
    revalidateTag(tag, { expire: 0 });
    return { ok: false, kind: 'transient' };
  }
  const kind = classify?.(body) ?? 'ok';
  if (kind === 'ok') return { ok: true, body };
  if (kind === 'rate-limited') startCooldown(service);
  if (kind === 'rate-limited' || kind === 'transient') revalidateTag(tag, { expire: 0 });
  return { ok: false, kind, body };
}

/**
 * GETs `url` as JSON through the cache and throttle. Never throws for API or network
 * errors; the result says what went wrong.
 */
export async function cachedJson<T>(url: string, options: CachedJsonOptions<T>): Promise<CachedJsonResult<T>> {
  const { service, revalidate, classify } = options;
  const tag = options.tag.slice(0, 256);
  const init: RequestInit = revalidate > 0
    ? { next: { revalidate, tags: [tag] } }
    : { cache: 'no-store' };

  if (revalidate > 0 && !options.skipProbe) {
    try {
      const response = await fetch(url, { ...init, signal: AbortSignal.abort() });
      if (response.ok) return settle(service, tag, await parse<T>(response), classify);
    } catch {
      // Cache miss: the aborted network request rejected without being sent.
    }
  }

  if (isCoolingDown(service)) return { ok: false, kind: 'rate-limited' };

  const key = `${revalidate}:${url}`;
  const pending = inFlight.get(key) as Promise<CachedJsonResult<T>> | undefined;
  if (pending) return pending;

  const request = (async (): Promise<CachedJsonResult<T>> => {
    await throttle(service);
    if (isCoolingDown(service)) return { ok: false, kind: 'rate-limited' };
    try {
      const response = await fetch(url, init);
      if (response.status === 429) {
        startCooldown(service);
        return { ok: false, kind: 'rate-limited' };
      }
      if (response.status === 404) return { ok: false, kind: 'not-found' };
      if (!response.ok) {
        console.warn(`${service} API error ${response.status} for ${redact(url)}`);
        return { ok: false, kind: response.status >= 500 ? 'transient' : 'error' };
      }
      return settle(service, tag, await parse<T>(response), classify);
    } catch (error) {
      console.warn(`${service} request failed for ${redact(url)}:`, error);
      return { ok: false, kind: 'transient' };
    }
  })();

  inFlight.set(key, request);
  try {
    return await request;
  } finally {
    inFlight.delete(key);
  }
}

/** Keeps API keys out of logs */
function redact(url: string): string {
  return url.replace(/api_key=[^&]+/, 'api_key=…');
}

/** Runs `fn` over `items` with at most `limit` in flight. Order of results matches `items`. */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

/** Test hook: forget throttle slots and cooldowns. */
export function resetApiCacheState() {
  for (const service of Object.keys(SERVICES) as ServiceName[]) {
    nextSlot[service] = 0;
    cooldownUntil[service] = 0;
  }
  inFlight.clear();
}
