'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';
import { cn } from '@/utils';

const ERRORS: Record<string, string> = {
  invalid_username: 'That doesn’t look like a Last.fm username.',
  user_not_found: 'Last.fm has never heard of that one. Typo?',
  lastfm_unavailable: 'Last.fm isn’t answering right now. Try again in a minute.',
};

/**
 * Username box for looking up any public Last.fm profile, like a friend's.
 * Signing in with Last.fm (SignInButton) is the main way in; this is the side door.
 */
export function UsernameForm({ className, autoFocus = false }: { className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username.trim() || status === 'checking') return;
    setStatus('checking');
    setError(null);
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (response.ok) {
        router.push('/dashboard');
        return;
      }
      const body = await response.json().catch(() => ({})) as { error?: string };
      setError(ERRORS[body.error ?? ''] ?? 'Something went sideways. Try again?');
    } catch {
      setError('Something went sideways. Try again?');
    }
    setStatus('idle');
  };

  return (
    <form onSubmit={submit} className={cn('w-full max-w-md', className)}>
      <div className="flex flex-col gap-2 rounded-full sm:flex-row sm:items-center sm:border sm:border-white/10 sm:bg-white/[0.03] sm:p-1 sm:backdrop-blur">
        <label className="flex flex-1 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-3 sm:border-0 sm:bg-transparent sm:py-1.5">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="sr-only">Any Last.fm username</span>
          <input
            value={username}
            onChange={event => setUsername(event.target.value)}
            placeholder="Or look up any Last.fm username"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus={autoFocus}
            className="w-full min-w-0 bg-transparent text-white placeholder:text-gray-500 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={status === 'checking' || !username.trim()}
          className="group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60 sm:py-2"
        >
          {status === 'checking' ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Looking…
            </>
          ) : (
            <>
              Look up
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
      {error && <p role="alert" className="mt-2 px-4 text-sm text-pink-300">{error}</p>}
    </form>
  );
}
