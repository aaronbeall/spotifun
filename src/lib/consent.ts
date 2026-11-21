export type AnalyticsChoice = 'granted' | 'denied';

export const CONSENT_KEY = 'spotifun.analyticsConsent';

/** EEA, UK and Switzerland start with analytics off until the visitor says yes. */
export const CONSENT_REGIONS = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU',
  'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH',
];

/** Consent mode only reads the arguments object that gtag() pushes, not a plain array. */
function gtag(...args: unknown[]): void;
function gtag() {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

export function readAnalyticsChoice(): AnalyticsChoice | null {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

/** Remembers the choice and tells Google's consent mode right away. */
export function saveAnalyticsChoice(choice: AnalyticsChoice) {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // Private mode: the choice still applies to this page view.
  }
  gtag('consent', 'update', { analytics_storage: choice });
  window.dispatchEvent(new CustomEvent('spotifun:consent', { detail: choice }));
}

/** A rough guess at whether this visitor needs to be asked: their clock is set to Europe. */
export function likelyNeedsConsentPrompt(): boolean {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    return zone.startsWith('Europe/') || zone === 'Atlantic/Reykjavik' || zone === 'Atlantic/Canary' || zone === 'Atlantic/Madeira';
  } catch {
    return false;
  }
}

/**
 * The inline script that has to run before the Google Tag Manager container loads.
 * It sets consent defaults, then sends the gtm.js start event that the standard
 * GTM snippet sends (without it, All Pages triggers never fire).
 */
export const CONSENT_DEFAULTS_SCRIPT = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
gtag('consent', 'default', { analytics_storage: 'denied', region: ${JSON.stringify(CONSENT_REGIONS)} });
try { var c = localStorage.getItem('${CONSENT_KEY}'); if (c === 'granted' || c === 'denied') gtag('consent', 'update', { analytics_storage: c }); } catch (e) {}
dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });`;
