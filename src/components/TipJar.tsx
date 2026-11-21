'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Coffee, X } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { markTipped, noteVisitAndCheckNudge, snoozeTipNudge, TIP_URL } from '@/lib/tips';

type Placement = 'footer' | 'menu' | 'nudge' | 'about';

function trackTip(action: 'shown' | 'click' | 'later' | 'already', placement: Placement) {
  trackEvent('tip', { action, placement });
}

/** A plain "tip jar" link. Renders nothing until a tip URL is configured. */
export function TipLink({ placement, className, children, onClick }: { placement: Placement; className?: string; children?: React.ReactNode; onClick?: () => void }) {
  if (!TIP_URL) return null;
  return (
    <a
      href={TIP_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        trackTip('click', placement);
        if (placement === 'nudge') markTipped();
        onClick?.();
      }}
      className={className}
    >
      {children ?? (
        <>
          <Coffee className="h-4 w-4" />
          Tip jar
        </>
      )}
    </a>
  );
}

/** How long a visit lasts before the jar speaks up. Long enough to have had some fun first. */
const NUDGE_DELAY_MS = 45_000;

/**
 * The light nag: a small card on the third visit or later, after some time on
 * the page. "Maybe later" quiets it for a few weeks; tipping or "already did"
 * quiets it for good. It never blocks anything.
 */
export function TipNudge({ enabled = true }: { enabled?: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!enabled || !noteVisitAndCheckNudge()) return;
    const timer = window.setTimeout(() => {
      setShow(true);
      trackTip('shown', 'nudge');
    }, NUDGE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [enabled]);

  const later = () => {
    snoozeTipNudge();
    trackTip('later', 'nudge');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          aria-label="Tip jar"
          className="fixed inset-x-3 bottom-3 z-[65] mx-auto max-w-sm rounded-2xl border border-amber-300/20 bg-gray-900/95 p-4 shadow-2xl backdrop-blur sm:inset-x-auto sm:right-4 sm:bottom-4"
        >
          <button
            type="button"
            onClick={later}
            aria-label="Close tip jar"
            className="absolute right-2 top-2 rounded-full p-1 text-gray-500 hover:bg-white/10 hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex gap-3 pr-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-300/15 text-xl" aria-hidden>
              🍌
            </span>
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white">Back for more, huh?</p>
              <p className="mt-1 leading-relaxed">
                Spotifun is one person, a monkey, and a server bill. If it&apos;s made you grin, a coffee keeps the vibes flowing.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-end gap-2 text-sm">
            <button
              type="button"
              onClick={() => {
                markTipped();
                trackTip('already', 'nudge');
                setShow(false);
              }}
              className="rounded-full px-3 py-1.5 text-gray-400 hover:bg-white/10 hover:text-gray-200"
            >
              Already did ❤️
            </button>
            <button
              type="button"
              onClick={later}
              className="rounded-full border border-white/15 px-3 py-1.5 text-gray-200 hover:bg-white/10"
            >
              Maybe later
            </button>
            <TipLink
              placement="nudge"
              onClick={() => setShow(false)}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-3.5 py-1.5 font-semibold text-gray-950 hover:bg-amber-200"
            >
              <Coffee className="h-4 w-4" />
              Buy a coffee
            </TipLink>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
