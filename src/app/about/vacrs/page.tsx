import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'VACRS and personas — Spotifun',
  description: 'How Spotifun scores music on five traits and snaps that score, plus your listening habits, into one of 64 personas.',
};

const TRAITS = [
  ['Valence', 'Unpleasant', 'Pleasant', 'Emotional tone. Dark, tense, or sad on one side. Bright or cheerful on the other.'],
  ['Arousal', 'Calm', 'Energetic', 'How activated the music feels. Ambient and slow versus fast, loud, and driving.'],
  ['Complexity', 'Simple', 'Complex', 'How intricate the music is. Straightforward and repetitive versus dense and shifting.'],
  ['Rawness', 'Polished', 'Raw', 'Production. Clean studio finish versus lo-fi, live, or gritty.'],
  ['Social presence', 'Solitary', 'Communal', 'Whether the music feels like a private listen or a room full of people.'],
];

const SWITCHES = [
  ['Mood', 'Darker', 'Brighter', 'VACRS valence, split at the midpoint.'],
  ['Energy', 'Calm', 'Energetic', 'VACRS arousal, split at the midpoint.'],
  ['Genre spread', 'Focused', 'Eclectic', 'How many distinct genres you have, relative to the genre tags on those artists.'],
  ['Popularity', 'Niche', 'Mainstream', 'Average Spotify popularity. 50 is the line.'],
  ['Artist loyalty', 'Wanderer', 'Loyal', 'Returning to the same artists counts as loyal. Sampling widely counts as wandering.'],
  ['Era', 'Classic', 'Current', 'Average release year. Within the last five years counts as current.'],
];

export default function VacrsPage() {
  return (
    <article className="space-y-12">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
          <Link href="/about" className="hover:text-violet-200">About</Link>
          <span className="text-gray-600"> / </span>
          VACRS
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">VACRS, and the persona it names</h1>
        <p className="mt-4 text-lg leading-relaxed">
          VACRS is Spotifun&apos;s trait model. It places music on five axes from 0 to 1, with 0.5 as neutral.
          A persona is what you get when two of those axes, plus four facts about how you listen, are each
          forced to one side. There are 64 combinations, and each one has a name.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Five traits, not genres</h2>
        <p>
          Genres are the input. Traits are the description. A genre string is matched against a taxonomy.
          Tags that do not match are left out, which is why the profile also reports coverage: how much of
          the genre weight actually landed on a known trait. Artists with only a couple of Spotify genres
          may pick up extra tags from Last.fm before that match runs.
        </p>
        <p>
          Each included genre carries a score on every axis. Those scores are averaged, weighted by how often
          the genre shows up in the view you have open. Recently played tracks weight by plays. A playlist
          weights by the songs in it. The spectrum card is that average, still on a continuous scale.
        </p>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Trait</th>
                <th className="px-4 py-3 font-medium">0</th>
                <th className="px-4 py-3 font-medium">1</th>
                <th className="px-4 py-3 font-medium">What it means</th>
              </tr>
            </thead>
            <tbody>
              {TRAITS.map(([name, low, high, meaning]) => (
                <tr key={name} className="border-t border-white/10">
                  <td className="px-4 py-3 font-medium text-white">{name}</td>
                  <td className="px-4 py-3 text-gray-400">{low}</td>
                  <td className="px-4 py-3 text-gray-400">{high}</td>
                  <td className="px-4 py-3">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Six switches, one name</h2>
        <p>
          The persona does not keep the decimals. It asks six yes-or-no questions and looks the answer up
          in a complete table. Every combination maps to exactly one listener. Two questions come straight
          from VACRS. The other four come from the shape of the library, not from the trait score.
        </p>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Switch</th>
                <th className="px-4 py-3 font-medium">One side</th>
                <th className="px-4 py-3 font-medium">The other</th>
                <th className="px-4 py-3 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {SWITCHES.map(([name, low, high, source]) => (
                <tr key={name} className="border-t border-white/10">
                  <td className="px-4 py-3 font-medium text-white">{name}</td>
                  <td className="px-4 py-3 text-gray-400">{low}</td>
                  <td className="px-4 py-3 text-gray-400">{high}</td>
                  <td className="px-4 py-3">{source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Valence, arousal, and genre spread use a strict midpoint: exactly 0.5 stays on the low side,
          which means darker, calm, and focused. Popularity at 50 stays niche. A listener who splits plays
          evenly enough to land on 0.5 artist diversity counts as a wanderer. Era runs the other way: an
          average release year five years ago, or newer, counts as current.
        </p>
        <p>
          A few of the names that fall out of that grid: The Playlist Hopper is eclectic, mainstream, wandering,
          current, brighter, and energetic. The Shadow Curator is eclectic, niche, loyal, current, darker, and calm.
          The Melancholy Purist is focused, mainstream, loyal, classic, darker, and calm.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">What VACRS does not decide</h2>
        <p>
          Complexity, rawness, and social presence stay on the spectrum. They do not pick the persona name.
          The portrait drawn for a persona borrows them back as a picture of the six switches: an eclectic
          listener is drawn as complex, a niche listener as raw, and a wanderer as communal. That picture is
          a translation of the persona, not a second measurement of the songs.
        </p>
        <p>
          Vibes are a different reading of the same five scores. A vibe is whichever preset profile sits
          nearest the continuous average. The persona is the named cell in the six-switch table. They can
          agree in spirit and still not be the same sentence.
        </p>
      </section>

      <p>
        <Link href="/about" className="text-violet-300 underline decoration-violet-300/40 underline-offset-2 hover:text-violet-200">
          Back to about
        </Link>
      </p>
    </article>
  );
}
