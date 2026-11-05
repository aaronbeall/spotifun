import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'VACRS and personas — Spotifun',
  description: 'How Spotifun scores music on five traits, then snaps two of them plus four listening facts into one of 64 personas.',
};

const STEPS = [
  { n: '1', title: 'Genres', text: 'Tags on the artists in the view you have open.' },
  { n: '2', title: 'Five scores', text: 'Each tag sits on five traits. The view is their weighted average.' },
  { n: '3', title: 'Snap two', text: 'Mood and energy are cut at the middle. The other three scores stay as they are.' },
  { n: '4', title: 'Four facts', text: 'Genre spread, popularity, loyalty, and era come from the library, not from VACRS.' },
  { n: '5', title: 'One name', text: 'Six yes-or-no answers pick one of 64 personas.' },
];

const AXES = [
  { name: 'Valence', low: 'Unpleasant', high: 'Pleasant', meaning: 'Dark or sad, through to bright or cheerful.', from: '#312e81', to: '#fbbf24' },
  { name: 'Arousal', low: 'Calm', high: 'Energetic', meaning: 'Slow and ambient, through to fast and driving.', from: '#0c4a6e', to: '#fb7185' },
  { name: 'Complexity', low: 'Simple', high: 'Complex', meaning: 'Repetitive and direct, through to dense and shifting.', from: '#334155', to: '#a78bfa' },
  { name: 'Rawness', low: 'Polished', high: 'Raw', meaning: 'Clean studio finish, through to lo-fi, live, or gritty.', from: '#94a3b8', to: '#d97706' },
  { name: 'Social presence', low: 'Solitary', high: 'Communal', meaning: 'A private listen, through to a room full of people.', from: '#1e1b4b', to: '#f472b6' },
];

const FACTS = [
  { name: 'Genre spread', low: 'Focused', high: 'Eclectic', line: 'Above 0.5 is eclectic. Exactly 0.5 stays focused.' },
  { name: 'Popularity', low: 'Niche', high: 'Mainstream', line: 'Average Spotify popularity. 50, and anything under it, stays niche.' },
  { name: 'Artist loyalty', low: 'Wanderer', high: 'Loyal', line: 'Returning to the same artists is loyal. A diversity of 0.5 counts as wandering.' },
  { name: 'Era', low: 'Classic', high: 'Current', line: 'Average release year. Five years ago, or newer, counts as current.' },
];

const HOPPER = [
  ['Mood', 'Brighter'],
  ['Energy', 'Energetic'],
  ['Genre spread', 'Eclectic'],
  ['Popularity', 'Mainstream'],
  ['Loyalty', 'Wanderer'],
  ['Era', 'Current'],
];

function Axis({
  name,
  low,
  high,
  meaning,
  from,
  to,
}: {
  name: string;
  low: string;
  high: string;
  meaning: string;
  from: string;
  to: string;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-white">{name}</h3>
      <div
        className="relative h-3 rounded-full"
        style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
        role="img"
        aria-label={`${name}, from ${low} at 0 to ${high} at 1. The middle is 0.5.`}
      >
        <span className="absolute left-1/2 top-1/2 h-5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] uppercase tracking-wide text-gray-500">
        <span>0 · {low}</span>
        <span>0.5</span>
        <span>{high} · 1</span>
      </div>
      <p className="mt-1 text-sm text-gray-400">{meaning}</p>
    </div>
  );
}

export default function VacrsPage() {
  return (
    <article className="space-y-14">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
          <Link href="/about" className="hover:text-violet-200">About</Link>
          <span className="text-gray-600"> / </span>
          VACRS
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">How a persona gets its name</h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-300">
          VACRS scores the music from 0 to 1 on five traits. The persona keeps only two of those scores,
          adds four facts about how you listen, and looks up one of 64 names.
        </p>
      </header>

      <ol className="grid gap-3 sm:grid-cols-5">
        {STEPS.map(step => (
          <li key={step.n} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <span className="font-mono text-xs text-violet-300">{step.n}</span>
            <h2 className="mt-2 text-sm font-semibold text-white">{step.title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-gray-400">{step.text}</p>
          </li>
        ))}
      </ol>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white">1–2. Genres become five scores</h2>
          <p className="mt-2 text-sm leading-relaxed">
            A genre tag is matched to a known trait profile. Tags that do not match are left out, which is
            the coverage number on the profile. Thin Spotify genres can pick up Last.fm tags first.
            Plays weight a recent-play view. Songs weight a playlist. The spectrum card is this average,
            still on a continuous scale. The mark in the middle of each bar is 0.5, neutral.
          </p>
        </div>
        <div className="space-y-5">
          {AXES.map(axis => (
            <Axis key={axis.name} {...axis} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white">3. Two scores snap. Three do not.</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Mood is valence. Energy is arousal. Above 0.5 is brighter or energetic. Exactly 0.5 stays
            darker or calm. Complexity, rawness, and social presence never choose the name.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-violet-400/30 bg-violet-400/[0.06] p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">Names the persona</p>
            <div className="mt-4 overflow-hidden rounded-full text-center text-xs font-semibold" role="img" aria-label="A score cut at 0.5. The left half is the low side. The right half is the high side.">
              <div className="flex h-11">
                <div className="flex flex-1 items-center justify-center bg-indigo-950 text-indigo-200">0.5 and below</div>
                <div className="flex flex-1 items-center justify-center bg-amber-300 text-amber-950">Above 0.5</div>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li className="flex justify-between gap-3">
                <span className="text-white">Valence</span>
                <span className="text-gray-400">Unpleasant → Pleasant</span>
              </li>
              <li className="flex justify-between gap-3">
                <span className="text-white">Arousal</span>
                <span className="text-gray-400">Calm → Energetic</span>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Stays on the spectrum</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <span className="font-medium text-white">Complexity</span>
                <span className="text-gray-400"> · simple to complex</span>
              </li>
              <li>
                <span className="font-medium text-white">Rawness</span>
                <span className="text-gray-400"> · polished to raw</span>
              </li>
              <li>
                <span className="font-medium text-white">Social presence</span>
                <span className="text-gray-400"> · solitary to communal</span>
              </li>
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              You still see these on the spectrum card. They are not asked when the persona is named.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">4. Four facts from the library</h2>
          <p className="mt-2 text-sm leading-relaxed">
            These are not VACRS scores. Each one is still forced to a side before the name is chosen.
          </p>
        </div>
        <ul className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
          {FACTS.map(fact => (
            <li key={fact.name} className="grid gap-3 bg-white/[0.02] px-4 py-4 sm:grid-cols-[9rem_1fr] sm:items-center">
              <div>
                <h3 className="text-sm font-semibold text-white">{fact.name}</h3>
                <p className="mt-1 text-xs text-gray-500">{fact.low} · {fact.high}</p>
              </div>
              <p className="text-sm text-gray-300">{fact.line}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">5. Six answers, one name</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Two sides on six questions is 64 combinations. Every combination has exactly one persona.
            This is one of them.
          </p>
        </div>
        <div className="rounded-2xl border border-pink-400/30 bg-pink-500/[0.07] p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-pink-300">Example</p>
          <h3 className="mt-2 text-3xl font-black italic tracking-tight text-white">The Playlist Hopper</h3>
          <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {HOPPER.map(([question, answer]) => (
              <li key={question} className="rounded-xl bg-black/30 px-3 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-pink-200/70">{question}</p>
                <p className="mt-1 text-sm font-semibold text-white">{answer}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-pink-100/80">
            Flip any one of those six and the name changes. The Shadow Curator, for instance, is eclectic,
            niche, loyal, current, darker, and calm.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400" aria-hidden>
          <span className="font-mono text-violet-300">2 × 2 × 2 × 2 × 2 × 2</span>
          <span className="h-px flex-1 bg-white/10" />
          <span className="font-semibold text-white">64 names</span>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 p-5">
          <h2 className="text-base font-semibold text-white">The portrait is a drawing of the name</h2>
          <p className="mt-2 text-sm leading-relaxed">
            The artwork does not remeasure the songs. It redraws the six answers: eclectic becomes complex,
            niche becomes raw, and wandering becomes communal.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 p-5">
          <h2 className="text-base font-semibold text-white">A vibe is the nearest score</h2>
          <p className="mt-2 text-sm leading-relaxed">
            A vibe matches the five continuous scores to the closest preset. The persona is the named cell
            in the six-answer table. They can sound alike and still not be the same result.
          </p>
        </div>
      </section>

      <p>
        <Link href="/about" className="text-violet-300 underline decoration-violet-300/40 underline-offset-2 hover:text-violet-200">
          Back to about
        </Link>
      </p>
    </article>
  );
}
