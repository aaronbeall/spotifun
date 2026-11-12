type EventParams = Record<string, string>;

interface DataLayerEvent extends EventParams {
  event: string;
}

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

/** Sends one event through the dataLayer the Google tag is already watching. */
export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...params });
}

/** A persona, vibe, or badge the signed-in account just earned for the first time. */
export function trackUnlock(type: string, id: string, name: string) {
  trackEvent('unlock', {
    unlock_type: type,
    unlock_id: id,
    unlock_name: name,
  });
}
