'use client';

import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/utils';
import { UsernameForm } from './UsernameForm';

const SIGN_IN_ERRORS: Record<string, string> = {
  cancelled: 'No worries. Sign in whenever you like, or look someone up below.',
  expired: 'That sign-in took a wrong turn. Try once more?',
  rejected: 'Last.fm didn’t accept that sign-in. Try once more?',
  unavailable: 'Last.fm isn’t answering right now. Try again in a minute.',
  not_configured: 'Signing in isn’t switched on here yet. Look up your username below instead.',
};

/** The main way in: Last.fm's own sign-in page, then straight to your dashboard. */
export function SignInButton({ className }: { className?: string }) {
  const [error, setError] = useState<string | null>(null);

  // A failed sign-in comes back as /?signin=<reason>
  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get('signin');
    if (reason) setError(SIGN_IN_ERRORS[reason] ?? SIGN_IN_ERRORS.unavailable);
  }, []);

  return (
    <div className={className}>
      {/* A plain link: the API route answers with a redirect to Last.fm */}
      <a
        href="/api/auth/lastfm"
        className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-fuchsia-500/25 hover:from-violet-400 hover:to-fuchsia-400 sm:w-auto"
      >
        Sign in with Last.fm
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </a>
      {error && <p role="alert" className="mt-2 px-1 text-sm text-pink-300">{error}</p>}
    </div>
  );
}

/** Sign-in first, a username lookup second, and a nudge for people without Last.fm */
export function StartPanel({ className }: { className?: string }) {
  return (
    <div className={cn('w-full max-w-md', className)}>
      <SignInButton />
      <UsernameForm className="mt-4" />
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
    </div>
  );
}
