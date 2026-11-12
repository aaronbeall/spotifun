'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { evaluateAchievements } from '@/lib/records/achievements';
import { getRecordStore } from '@/lib/records/indexedDbStore';
import type { Journal } from '@/lib/records/types';

function countPhrase(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

function journalSummary(journal: Journal): string {
  const personas = journal.unlocks.filter(unlock => unlock.kind === 'persona').length;
  const vibes = journal.unlocks.filter(unlock => unlock.kind === 'vibe').length;
  const badges = evaluateAchievements(journal).filter(achievement => achievement.earned).length;
  const parts = [
    personas > 0 ? countPhrase(personas, 'persona') : '',
    vibes > 0 ? countPhrase(vibes, 'vibe') : '',
    badges > 0 ? countPhrase(badges, 'badge') : '',
  ].filter(Boolean);
  return parts.length > 0 ? `${parts.join(', ')} saved in this browser.` : 'Nothing saved for this account yet.';
}

function SettingSwitch({
  checked,
  label,
  detail,
  onChange,
}: {
  checked: boolean;
  label: string;
  detail: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-1 text-sm leading-relaxed text-gray-400">{detail}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-green-600' : 'bg-gray-700'}`}
      >
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}

export function SettingsDialog({
  open,
  demo,
  isDev,
  displayName,
  userId,
  journalTick,
  lastFmEnabled,
  debugPanelEnabled,
  onLastFmChange,
  onDebugChange,
  onJournalCleared,
  onClose,
}: {
  open: boolean;
  demo: boolean;
  isDev: boolean;
  displayName: string;
  userId: string;
  journalTick: number;
  lastFmEnabled: boolean;
  debugPanelEnabled: boolean;
  onLastFmChange: (enabled: boolean) => void;
  onDebugChange: (enabled: boolean) => void;
  onJournalCleared: () => void;
  onClose: () => void;
}) {
  const [summary, setSummary] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [forgetting, setForgetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setConfirming(false);
      setError(null);
      return;
    }
    if (demo) return;
    let cancelled = false;
    getRecordStore(userId).readJournal()
      .then(journal => {
        if (!cancelled) setSummary(journalSummary(journal));
      })
      .catch(() => {
        if (!cancelled) setSummary('The journal in this browser could not be read.');
      });
    return () => {
      cancelled = true;
    };
  }, [open, demo, userId, journalTick]);

  if (!open) return null;

  const forget = async () => {
    setForgetting(true);
    setError(null);
    try {
      await getRecordStore(userId).clearJournal();
      setConfirming(false);
      onJournalCleared();
    } catch {
      setError('Could not forget the journal. Try again.');
    } finally {
      setForgetting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
        onClick={event => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-3 -right-3 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-gray-800 text-white shadow-lg hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 id="settings-title" className="text-lg font-semibold text-white">Settings</h2>

        {demo ? (
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            {displayName}&apos;s example profile is not kept in this browser, so there is no journal to forget.
          </p>
        ) : (
          <div className="mt-5 space-y-6">
            <SettingSwitch
              checked={lastFmEnabled}
              label="Enrich genres with Last.fm"
              detail="When Spotify returns few genres for an artist, look that artist up by name. Last.fm is not told who you are."
              onChange={onLastFmChange}
            />
            <div className="border-t border-white/10 pt-5">
              <p className="text-sm font-medium text-white">Listening journal</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-400">
                Unlocks and badges for {displayName} stay in this browser. They are not uploaded.
              </p>
              <p className="mt-2 text-sm text-gray-300">{summary ?? 'Reading this browser…'}</p>
              {confirming ? (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3">
                  <p className="text-sm leading-relaxed text-gray-300">
                    Forget the journal for {displayName}? Unlocks and badges stored in this browser are removed.
                    The profile you have open can earn them again the next time it loads.
                  </p>
                  {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={forget}
                      disabled={forgetting}
                      className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60"
                    >
                      {forgetting ? 'Forgetting…' : 'Forget journal'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(false)}
                      disabled={forgetting}
                      className="rounded-full border border-white/15 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 disabled:opacity-60"
                    >
                      Keep it
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="mt-4 rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/10"
                >
                  Forget journal
                </button>
              )}
            </div>
          </div>
        )}

        {isDev && (
          <div className={demo ? 'mt-5 border-t border-white/10 pt-5' : 'mt-6 border-t border-white/10 pt-5'}>
            <SettingSwitch
              checked={debugPanelEnabled}
              label="Genre debug panel"
              detail="Show how genre tags were matched. Only visible in development."
              onChange={onDebugChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
