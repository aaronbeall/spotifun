import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — Spotifun',
  description: 'What Spotifun is, how to get in touch, and the privacy and terms that cover your Spotify connection.',
};

export default function AboutPage() {
  return (
    <article className="space-y-12">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">About</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">A mirror for your listening</h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-300">
          Spotifun reads a Spotify account and turns it into a profile: who you play, which genres show up,
          how mainstream or niche the songs are, and a named listener persona. It is a personal project,
          built to make taste legible rather than to sell anything.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">What you can look at</h2>
        <p>
          After you connect Spotify, the dashboard can describe recently played tracks, your top artists,
          your top tracks, Liked Songs, or any playlist you own or follow. The same cards follow that choice:
          artists, tracks, genres, popularity, a trait spectrum, a vibe, and a persona.
        </p>
        <p>
          Rankings elsewhere on the dashboard are a sketch, not a live global leaderboard. Achievements are
          milestones computed from the view you have open.
        </p>
      </section>

      <section id="contact" className="scroll-mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-white">Contact</h2>
        <p>
          Bugs, questions, and requests to take something down go to the project repository.
        </p>
        <p>
          <a
            href="https://github.com/aaronbeall/spotifun/issues"
            className="text-violet-300 underline decoration-violet-300/40 underline-offset-2 hover:text-violet-200"
          >
            Open an issue on GitHub
          </a>
        </p>
      </section>

      <section id="privacy" className="scroll-mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-white">Privacy</h2>
        <p className="text-sm text-gray-500">Last updated October 31, 2026.</p>
        <p>
          Spotifun does not keep its own user database. Connecting Spotify grants the app permission to read
          your profile and email, top artists and tracks, recently played tracks, current playback, private
          and collaborative playlists, and Liked Songs. You can revoke that access from your Spotify account
          at any time.
        </p>
        <p>
          Spotify access and refresh tokens are stored in httpOnly cookies so the server can request your
          library on your behalf. The access cookie lasts as long as Spotify says the token does. The refresh
          cookie lasts 30 days. Spotifun does not sell this data and does not use it for advertising.
        </p>
        <p>
          When Spotify returns few genres for an artist, the server may look that artist up on Last.fm and
          cache the tags. That lookup is by artist name. Last.fm is not told who you are.
        </p>
      </section>

      <section id="terms" className="scroll-mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-white">Terms</h2>
        <p>
          Spotifun is offered as-is, for personal use. There is no warranty. The profiles are an interpretation
          of genre tags and your Spotify library. They are not a diagnosis, a credit score, or a statement from Spotify.
        </p>
        <p>
          You are responsible for the Spotify account you connect. Do not use Spotifun to scrape accounts that
          are not yours, or in a way that breaks Spotify&apos;s own terms.
        </p>
        <p>
          VACRS, the trait model described on the{' '}
          <Link href="/about/vacrs" className="text-violet-300 underline decoration-violet-300/40 underline-offset-2 hover:text-violet-200">
            VACRS page
          </Link>
          , is part of this project. The write-up is here so you can see how a persona is chosen. It is not a license
          to copy the model into another product.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Spotify and other names</h2>
        <p>
          Spotifun is not affiliated with, endorsed by, or sponsored by Spotify AB. Spotify and the Spotify
          logo are trademarks of Spotify AB. Last.fm is a trademark of its owner. Genre enrichment uses the Last.fm API.
        </p>
      </section>

      <Link
        href="/about/vacrs"
        className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-violet-400/40 hover:bg-white/[0.05]"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">The model</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">VACRS, and how it becomes a persona</h2>
        <p className="mt-2 text-gray-400">
          Five trait axes score the music. Six yes-or-no questions, two of them from those traits, name the listener.
        </p>
      </Link>
    </article>
  );
}
