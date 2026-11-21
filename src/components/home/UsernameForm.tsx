'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Headphones } from 'lucide-react';
import { cn } from '@/utils';

const ERRORS: Record<string, string> = {
  invalid_username: 'That doesn’t look like a Last.fm username.',
  user_not_found: 'Last.fm has never heard of that one. Typo?',
  lastfm_unavailable: 'Last.fm isn’t answering right now. Try again in a minute.',
};

/** Username box that starts a profile. Last.fm data is public, so there's no password and no sign-in. */
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
      <div className="flex flex-col gap-2 rounded-full sm:flex-row sm:items-center sm:border sm:border-white/15 sm:bg-white/5 sm:p-1.5 sm:backdrop-blur">
        <label className="flex flex-1 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-3 sm:border-0 sm:bg-transparent sm:py-1.5">
          <Headphones className="h-4 w-4 shrink-0 text-fuchsia-300" />
          <span className="sr-only">Your Last.fm username</span>
          <input
            value={username}
            onChange={event => setUsername(event.target.value)}
            placeholder="Your Last.fm username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus={autoFocus}
            className="w-full min-w-0 bg-transparent text-white placeholder:text-gray-500 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={status === 'checking' || !username.trim()}
          className="group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 font-semibold text-white shadow-lg shadow-fuchsia-500/25 hover:from-violet-400 hover:to-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-70 sm:py-2.5"
        >
          {status === 'checking' ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Looking…
            </>
          ) : (
            <>
              Dig in
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
      {error && <p role="alert" className="mt-2 px-4 text-sm text-pink-300">{error}</p>}
      <p className="mt-3 px-1 text-sm text-gray-500">
        No Last.fm yet?{' '}
        <a
          href="https://www.last.fm/about/trackmymusic"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-300 underline decoration-violet-300/30 underline-offset-2 hover:text-violet-200"
        >
          Hook up your music app
        </a>{' '}
        and come back once a few plays have landed.
      </p>
    </form>
  );
}
