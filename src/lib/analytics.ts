type EventParams = Record<string, string | number | boolean>;

interface DataLayerEvent {
  event: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/*
 * What goes to Google Analytics, and what doesn't.
 *
 * Events carry Spotifun's own words: which view, filter, card, persona, vibe
 * or badge. They never carry Spotify content (track, artist, album, playlist
 * or genre names, IDs, or images). Spotify's developer terms bar passing data
 * received from Spotify, even aggregated, to third-party analytics and ad
 * tools, and the privacy page promises the same. If you add an event, keep
 * its params to values this app defines.
 */

/** Sends one event through the dataLayer the Google tag is already watching. */
export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...params } satisfies DataLayerEvent);
}

/** A persona, vibe, or badge the signed-in account just earned for the first time. */
export function trackUnlock(type: string, id: string, name: string) {
  trackEvent('unlock', {
    unlock_type: type,
    unlock_id: id,
    unlock_name: name,
  });
}

/** Which slice of listening a profile describes, and how it was cut. */
export interface ProfileContext {
  /** recent | topArtists | topTracks | playlist (liked songs count as a source of their own) */
  source: string;
  time_range: string;
  /** How many recent plays were asked for; left out when it doesn't apply. */
  play_limit?: number;
  is_example: boolean;
}

/** The source, time range or play count above the profile changed. */
export function trackViewChange(control: 'source' | 'time_range' | 'play_limit' | 'list_time_range', value: string, context: ProfileContext) {
  trackEvent('view_change', { control, value, ...context });
}

/**
 * A profile finished loading. Persona and vibe are Spotifun's own labels; track
 * and genre counts are sizes, not content.
 */
export function trackProfileResult(result: {
  persona_id: string;
  persona_name: string;
  vibe_id: string;
  vibe_name: string;
  track_count: number;
  genre_count: number;
}, context: ProfileContext) {
  trackEvent('profile_result', { ...result, ...context });
}

/** A card in the profile carousel came into view. */
export function trackCardView(card: string, context?: Partial<ProfileContext>) {
  trackEvent('card_view', { card, ...context });
}

/** A section was picked from the header's jump menu. */
export function trackSectionJump(section: string) {
  trackEvent('section_jump', { section });
}

/** A "show all" list was expanded or collapsed. */
export function trackListExpand(list: 'artists' | 'tracks' | 'genres', expanded: boolean) {
  trackEvent('list_expand', { list, expanded });
}

/** A share card was opened, then shared or saved. */
export function trackShare(stage: 'open' | 'shared' | 'saved' | 'failed', card: string) {
  trackEvent('share', { stage, card });
}

/** Someone followed a link out to Spotify. Only the kind of thing, never which one. */
export function trackSpotifyOpen(kind: 'artist' | 'track' | 'genre' | 'album' | 'playlist') {
  trackEvent('spotify_open', { kind });
}
