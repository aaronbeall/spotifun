import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'VACRS and personas — Spotifun',
  description: 'How Spotifun scores music on five traits, then snaps two of them plus four listening facts into one of 64 personas.',
};

const STEPS = [
  { n: '1', title: 'Genres', text: 'Tags on the artists in the view you have open.', panel: 'bg-violet-400/[0.07]' },
  { n: '2', title: 'Five scores', text: 'Each tag sits on five traits. The view is their weighted average.', panel: 'bg-white/[0.03]' },
  { n: '3', title: 'Snap two', text: 'Mood and energy are cut at the middle. The other three scores stay as they are.', panel: 'bg-amber-300/[0.06]' },
  { n: '4', title: 'Four facts', text: 'Genre spread, popularity, loyalty, and era come from the library, not from VACRS.', panel: 'bg-emerald-400/[0.06]' },
  { n: '5', title: 'One name', text: 'Six yes-or-no answers pick one of 64 personas.', panel: 'bg-pink-400/[0.07]' },
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

function GenresMark() {
  const rows = [
    { tag: 'pop', dot: 'bg-violet-300', pill: 'border-violet-300/50 text-violet-100' },
    { tag: 'jazz', dot: 'bg-cyan-300', pill: 'border-cyan-300/50 text-cyan-100' },
    { tag: 'soul', dot: 'bg-amber-300', pill: 'border-amber-300/50 text-amber-100' },
  ];
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 px-2 py-3" aria-hidden>
      {rows.map(row => (
        <div key={row.tag} className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${row.dot}`} />
          <span className="h-px w-4 shrink-0 bg-white/30" />
          <span className={`rounded-full border bg-black/25 px-2 py-0.5 text-[11px] font-medium ${row.pill}`}>{row.tag}</span>
        </div>
      ))}
    </div>
  );
}

function ScoresMark() {
  const marks = [0.78, 0.64, 0.42, 0.3, 0.56];
  return (
    <div className="flex w-full flex-col justify-center gap-1.5 px-2.5 py-3" aria-hidden>
      {marks.map((mark, index) => (
        <div key={AXES[index].name} className="flex items-center gap-1.5">
          <span className="w-3 font-mono text-[9px] text-gray-500">{AXES[index].name[0]}</span>
          <span
            className="relative h-1.5 flex-1 rounded-full"
            style={{ background: `linear-gradient(90deg, ${AXES[index].from}, ${AXES[index].to})` }}
          >
            <span
              className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
              style={{ left: `${mark * 100}%` }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

function SnapMark() {
  return (
    <div className="flex w-full flex-col justify-center gap-1.5 px-2.5 py-3" aria-hidden>
      {AXES.slice(0, 2).map(axis => (
        <span
          key={axis.name}
          className="relative h-3 overflow-hidden rounded-full"
          style={{ background: `linear-gradient(90deg, ${axis.from}, ${axis.to})` }}
        >
          <span className="absolute left-1/2 top-1/2 h-5 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-white shadow" />
        </span>
      ))}
      <span className="mt-1 flex flex-col gap-1.5 opacity-70">
        {AXES.slice(2).map(axis => (
          <span
            key={axis.name}
            className="h-1 rounded-full"
            style={{ background: `linear-gradient(90deg, ${axis.from}, ${axis.to})` }}
          />
        ))}
      </span>
    </div>
  );
}

function FactsMark() {
  return (
    <div className="grid h-full grid-cols-2 gap-1 p-1.5" aria-hidden>
      <div className="flex flex-col items-center justify-center rounded-lg bg-black/25 py-1.5">
        <svg viewBox="0 0 48 26" className="h-7 w-12">
          <circle cx="8" cy="7" r="3" fill="#a78bfa" />
          <circle cx="40" cy="6" r="3" fill="#22d3ee" />
          <circle cx="24" cy="14" r="3" fill="#fbbf24" />
          <circle cx="10" cy="21" r="2.4" fill="#fb7185" />
          <circle cx="36" cy="20" r="2.4" fill="#34d399" />
        </svg>
        <span className="text-[9px] uppercase tracking-wide text-gray-400">Spread</span>
      </div>
      <div className="flex flex-col items-center justify-center gap-1.5 rounded-lg bg-black/25 px-2 py-1.5">
        <span className="relative h-1.5 w-full rounded-full bg-white/10">
          <span className="absolute inset-y-0 left-0 w-[68%] rounded-full bg-emerald-400" />
          <span className="absolute left-1/2 top-1/2 h-3.5 w-px -translate-x-1/2 -translate-y-1/2 bg-white" />
        </span>
        <span className="text-[9px] uppercase tracking-wide text-gray-400">50</span>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg bg-black/25 py-1.5">
        <svg viewBox="0 0 48 26" className="h-7 w-12">
          <circle cx="12" cy="13" r="5" fill="#c4b5fd" />
          <circle cx="24" cy="13" r="5" fill="#c4b5fd" />
          <circle cx="36" cy="13" r="4.5" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" />
        </svg>
        <span className="text-[9px] uppercase tracking-wide text-gray-400">Loyal</span>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg bg-black/25 py-1.5">
        <svg viewBox="0 0 48 26" className="h-7 w-12">
          <line x1="4" y1="14" x2="44" y2="14" stroke="white" strokeOpacity="0.45" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="36" cy="14" r="4.5" fill="#f472b6" />
        </svg>
        <span className="text-[9px] uppercase tracking-wide text-gray-400">Era</span>
      </div>
    </div>
  );
}

function NameMark() {
  return (
    <div className="flex items-center justify-center px-3 py-4" aria-hidden>
      <div className="grid grid-cols-8 gap-[3px]">
        {Array.from({ length: 64 }, (_, index) => (
          <span
            key={index}
            className={
              index === 27
                ? 'h-2 w-2 rounded-[2px] bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.95)]'
                : 'h-2 w-2 rounded-[2px] bg-white/15'
            }
          />
        ))}
      </div>
    </div>
  );
}

const STEP_MARKS = [GenresMark, ScoresMark, SnapMark, FactsMark, NameMark];

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
        <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed">
          <p>
            Valence and arousal are not original here. They are the two axes of the circumplex model of
            affect{' '}
            <a href="https://doi.org/10.1037/h0077714" className="text-violet-300 underline decoration-violet-300/40 underline-offset-2 hover:text-violet-200" target="_blank" rel="noopener noreferrer">Russell, 1980</a>,
            which music research uses as a dimensional account of emotion{' '}
            <a href="https://doi.org/10.1177/0305735610362821" className="text-violet-300 underline decoration-violet-300/40 underline-offset-2 hover:text-violet-200" target="_blank" rel="noopener noreferrer">Eerola &amp; Vuoskoski, 2011</a>.
            VACRS keeps those two axes and adds three the circumplex does not have: complexity, rawness,
            and social presence. The scores written onto genres, the cut into a persona, and the four
            library facts are the expansion.
          </p>
          <ol className="list-decimal space-y-1 pl-5 text-xs text-gray-500">
            <li>
              Russell, J. A. (1980). A circumplex model of affect. <span className="italic">Journal of Personality and Social Psychology, 39</span>(6), 1161–1178.{' '}
              <a href="https://doi.org/10.1037/h0077714" className="text-gray-400 hover:text-gray-300" target="_blank" rel="noopener noreferrer">https://doi.org/10.1037/h0077714</a>
            </li>
            <li>
              Eerola, T., &amp; Vuoskoski, J. K. (2011). A comparison of the discrete and dimensional models of emotion in music. <span className="italic">Psychology of Music, 39</span>(1), 18–49.{' '}
              <a href="https://doi.org/10.1177/0305735610362821" className="text-gray-400 hover:text-gray-300" target="_blank" rel="noopener noreferrer">https://doi.org/10.1177/0305735610362821</a>
            </li>
          </ol>
        </div>
      </header>

      <ol className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:grid md:grid-cols-5 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
        {STEPS.map((step, index) => {
          const Mark = STEP_MARKS[index];
          return (
            <li key={step.n} className="flex w-40 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-white/10 md:w-auto">
              <div className={`flex h-28 items-center ${step.panel}`}>
                <div className="w-full">
                  <Mark />
                </div>
              </div>
              <div className="flex flex-1 flex-col bg-white/[0.02] p-3">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-400/15 font-mono text-[11px] text-violet-200">
                  {step.n}
                </span>
                <h2 className="mt-2 text-sm font-semibold text-white">{step.title}</h2>
                <p className="mt-1 text-[11px] leading-snug text-gray-400">{step.text}</p>
              </div>
            </li>
          );
        })}
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
