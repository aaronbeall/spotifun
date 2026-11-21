import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — Spotifun',
  description: 'What Spotifun is, why it runs on Last.fm, how to get in touch, and the privacy and terms that cover it.',
};

export default function AboutPage() {
  return (
    <article className="space-y-12">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">About</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">A mirror for your listening</h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-300">
          Spotifun reads your Last.fm scrobbles and turns them into a profile: who you play, which genres show up,
          how mainstream or niche the songs are, and a named listener persona. It is a personal project,
          built to make taste legible and a little bit silly.
        </p>
      </header>

      <section id="history" className="scroll-mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-white">Why Last.fm and not Spotify</h2>
        <p>
          Spotifun started life on the Spotify Web API. Then, in 2025, Spotify stopped opening its API up to
          small developers: wider access now goes only to registered businesses with at least 250,000 monthly
          users, and every other app stays in development mode, where it works for five hand-picked people. A
          hobby project can&apos;t clear that bar, so Spotifun could never have opened its doors to everyone.
        </p>
        <p>
          So it moved to{' '}
          <a href="https://www.last.fm" target="_blank" rel="noopener noreferrer" className="text-violet-300 underline decoration-violet-300/40 underline-offset-2 hover:text-violet-200">
            Last.fm
          </a>
          , which has been keeping track of what people play for about twenty years. Last.fm can scrobble from
          Spotify, Apple Music, YouTube Music and most other players, so it works whatever you listen with. It
          also turned out to be a better fit: real play counts instead of a ranked list, a much longer history,
          six time periods instead of three, and no sign-in at all.
        </p>
        <p>
          The trade-off is that you need a Last.fm account that has been scrobbling for a while. If you are new to
          it,{' '}
          <a href="https://www.last.fm/about/trackmymusic" target="_blank" rel="noopener noreferrer" className="text-violet-300 underline decoration-violet-300/40 underline-offset-2 hover:text-violet-200">
            connect your music app
          </a>
          , listen for a few days, and come back.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">What you can look at</h2>
        <p>
          Type your Last.fm username and the dashboard can describe your recent scrobbles (up to the last 200),
          your top artists, your top tracks, or your Loved Tracks. Top lists come in six periods, from the last
          seven days to all time. The same cards follow that choice: artists, tracks, genres, popularity, a trait
          spectrum, a vibe, and a persona.
        </p>
        <p>
          Genres come from Last.fm&apos;s community tags. Artwork, song lengths, release years and popularity come
          from Deezer, matched by artist and song name, so a rare track can turn up without a cover.
        </p>
        <p>
          Music Story maps the view you have open: the persona, replays, streaks, deep cuts, and how many
          years the songs span. A separate comparison sets that view next to your own top artists across Last.fm
          periods. There is no global leaderboard.
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
        <p className="text-sm text-gray-500">Last updated November 21, 2026.</p>
        <p>
          Spotifun does not keep a user database and never asks for a password. It reads public Last.fm data
          for the username you type: your profile, recent scrobbles, top artists and tracks, and Loved Tracks.
          If your Last.fm profile hides its recent listening, Spotifun can&apos;t see it either.
        </p>
        <p>
          The username is kept in an httpOnly cookie for a year so the dashboard opens straight to your profile.
          Logging out deletes it.
        </p>
        <p>
          To stay within Last.fm&apos;s and Deezer&apos;s limits, the server caches their answers: listening data for a
          minute to a day, artist tags and artwork for up to a month. Deezer is asked about artists and songs by
          name; it is not told who you are.
        </p>
        <p>
          This browser keeps a separate journal for each username you look up: visits, the profile requests you
          make, the persona and vibe each result lands on, and genre names that do not match the trait list. The
          badges on your dashboard read that journal. It is not uploaded. Settings on the dashboard can forget it.
        </p>
        <p>
          The site loads Google Tag Manager (GTM-5ZH965VP) to measure how the site is used: which pages are
          opened, which buttons are clicked, and which personas, vibes, and badges are unlocked. That usage
          data is sent to Google. The listening journal stored in this browser is not uploaded, and neither
          are song or artist names.
        </p>
      </section>

      <section id="terms" className="scroll-mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-white">Terms</h2>
        <p>
          Spotifun is offered as-is, for personal use. There is no warranty. The profiles are an interpretation
          of genre tags and your scrobbles. They are not a diagnosis, a credit score, or a statement from Last.fm.
        </p>
        <p>
          Look up your own profile, or a friend&apos;s with their blessing. Do not use Spotifun to scrape profiles
          in bulk or in a way that breaks Last.fm&apos;s own terms. Visits are measured as described in the
          privacy section.
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
        <h2 className="text-xl font-semibold text-white">Credits and other names</h2>
        <p>
          Listening data is powered by AudioScrobbler, from{' '}
          <a href="https://www.last.fm" target="_blank" rel="noopener noreferrer" className="text-violet-300 underline decoration-violet-300/40 underline-offset-2 hover:text-violet-200">Last.fm</a>.
          Artwork and track details come from{' '}
          <a href="https://www.deezer.com" target="_blank" rel="noopener noreferrer" className="text-violet-300 underline decoration-violet-300/40 underline-offset-2 hover:text-violet-200">Deezer</a>.
          Spotifun is not affiliated with, endorsed by, or sponsored by Last.fm, Deezer, or Spotify AB. Their names
          are trademarks of their owners.
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
