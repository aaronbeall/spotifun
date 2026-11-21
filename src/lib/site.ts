/** Where the production site lives. Previews and local dev can override it. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://spotifun.app').replace(/\/+$/, '');

export const SITE_NAME = 'Spotifun';
