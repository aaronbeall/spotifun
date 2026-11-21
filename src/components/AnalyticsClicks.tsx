'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

const CLICKABLE = 'button, [role="button"], [role="switch"], [role="menuitem"], [role="menuitemcheckbox"]';

/**
 * The label GA sees. An explicit data-analytics-label wins. Inside a
 * data-analytics-redact container (lists of playlists, genres and the like)
 * the visible text is Spotify content, so only the container's own label goes.
 */
function controlLabel(control: Element): string {
  const explicit = control.getAttribute('data-analytics-label');
  if (explicit) return explicit;
  const redacted = control.closest('[data-analytics-redact]');
  if (redacted) return redacted.getAttribute('data-analytics-redact') || 'redacted';
  const label = control.getAttribute('aria-label')
    || control.getAttribute('title')
    || control.textContent
    || '';
  return label.replace(/\s+/g, ' ').trim().slice(0, 80);
}

/** Reports button clicks on every page. The label is the accessible name, not the account. */
export function AnalyticsClicks() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const control = target.closest(CLICKABLE);
      if (!control) return;
      const buttonName = controlLabel(control);
      if (!buttonName) return;
      trackEvent('button_click', {
        button_name: buttonName,
        page_path: window.location.pathname,
      });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
