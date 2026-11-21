'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { likelyNeedsConsentPrompt, readAnalyticsChoice, saveAnalyticsChoice } from '@/lib/consent';

/**
 * A small ask about usage analytics, shown only where the law expects one
 * (clocks set to Europe) and only until it's answered. Everyone can change
 * it later in Settings.
 */
export function ConsentNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (readAnalyticsChoice() === null && likelyNeedsConsentPrompt()) setShow(true);
  }, []);

  if (!show) return null;

  const choose = (choice: 'granted' | 'denied') => {
    saveAnalyticsChoice(choice);
    setShow(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Usage analytics"
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-md rounded-2xl border border-white/10 bg-gray-900/95 p-4 text-sm text-gray-300 shadow-2xl backdrop-blur sm:inset-x-auto sm:right-4 sm:bottom-4"
    >
      <p className="flex items-start gap-2">
        <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
        <span>
          Can Spotifun count which cards and views get poked at? It uses Google Analytics cookies and never sends your songs.{' '}
          <Link href="/about#privacy" className="text-violet-300 underline decoration-violet-300/40 underline-offset-2">Details</Link>
        </span>
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          data-analytics-label="Consent: no"
          onClick={() => choose('denied')}
          className="rounded-full border border-white/15 px-4 py-1.5 text-gray-200 hover:bg-white/10"
        >
          No thanks
        </button>
        <button
          type="button"
          data-analytics-label="Consent: yes"
          onClick={() => choose('granted')}
          className="rounded-full bg-violet-500 px-4 py-1.5 font-medium text-white hover:bg-violet-400"
        >
          Sure
        </button>
      </div>
    </div>
  );
}
