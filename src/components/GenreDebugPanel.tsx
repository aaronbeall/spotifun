'use client';

import { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { ArtistGenreDebugInfo, GenreMatchKind, GenreTagDebugInfo } from '@/types';

interface GenreDebugPanelProps {
  debugData?: ArtistGenreDebugInfo[];
  overallCoverage?: number;
}

const KIND_META: Record<GenreMatchKind, { label: string; className: string; description: string }> = {
  exact: {
    label: 'exact',
    className: 'bg-green-900/40 border-green-600 text-green-200',
    description: 'Tag is a taxonomy node name'
  },
  alias: {
    label: 'alias',
    className: 'bg-teal-900/40 border-teal-600 text-teal-200',
    description: 'Tag is a listed alias of a node (e.g. "punk rock" → punk)'
  },
  partial: {
    label: 'partial',
    className: 'bg-lime-900/40 border-lime-600 text-lime-200',
    description: 'A node alias appears as whole words inside the tag (longest wins)'
  },
  keyword: {
    label: 'keyword',
    className: 'bg-amber-900/40 border-amber-600 text-amber-200',
    description: 'Only the last word of the tag matched a node'
  },
  descriptor: {
    label: 'mood',
    className: 'bg-pink-900/40 border-pink-600 text-pink-200',
    description: 'Not a genre, but a mood/descriptor in the descriptor vocabulary'
  },
  unknown: {
    label: 'unmatched',
    className: 'bg-red-900/40 border-red-600 text-red-200',
    description: 'Nothing matched'
  }
};

const KIND_ORDER: GenreMatchKind[] = ['exact', 'alias', 'partial', 'keyword', 'descriptor', 'unknown'];

function tagTooltip(t: GenreTagDebugInfo): string {
  const lines = [
    `"${t.tag}" (${t.source === 'spotify' ? 'Spotify' : 'Last.fm'})`,
    `Match: ${KIND_META[t.kind].label} — ${KIND_META[t.kind].description}`
  ];
  if (t.node) lines.push(`Node: ${t.node}`);
  if (t.scoresFrom && t.scoresFrom !== t.node) lines.push(`Scores inherited from: ${t.scoresFrom}`);
  lines.push(t.usedInScoring ? 'Used in VACRS scoring' : 'NOT used in VACRS scoring');
  return lines.join('\n');
}

function TagChip({ tag }: { tag: GenreTagDebugInfo }) {
  const meta = KIND_META[tag.kind];
  const showNode = tag.node && tag.node !== tag.tag.toLowerCase();
  return (
    <span
      title={tagTooltip(tag)}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-xs cursor-help ${meta.className} ${
        tag.usedInScoring ? '' : 'border-dashed opacity-70'
      }`}
    >
      <span className="text-[9px] font-bold uppercase opacity-70">{tag.source === 'spotify' ? 'S' : 'L'}</span>
      <span>{tag.tag}</span>
      {showNode && <span className="opacity-70">→ {tag.node}</span>}
      {tag.scoresFrom && tag.scoresFrom !== tag.node && (
        <span className="opacity-50">({tag.scoresFrom})</span>
      )}
    </span>
  );
}

/**
 * Dev-only debug panel for genre classification.
 * Shows how every Spotify genre and Last.fm tag resolved, per artist, as a bottom drawer.
 */
export function GenreDebugPanel({ debugData, overallCoverage }: GenreDebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [onlyProblems, setOnlyProblems] = useState(false);

  const summary = useMemo(() => {
    const kindCounts = Object.fromEntries(KIND_ORDER.map(k => [k, 0])) as Record<GenreMatchKind, number>;
    const unmatched = new Map<string, number>();
    const moods = new Map<string, number>();
    for (const artist of debugData ?? []) {
      for (const t of artist.tags) {
        kindCounts[t.kind]++;
        if (t.kind === 'unknown') unmatched.set(t.tag, (unmatched.get(t.tag) ?? 0) + 1);
        if (t.kind === 'descriptor') moods.set(t.tag, (moods.get(t.tag) ?? 0) + 1);
      }
    }
    const byCount = (m: Map<string, number>) => Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
    return { kindCounts, unmatched: byCount(unmatched), moods: byCount(moods) };
  }, [debugData]);

  if (process.env.NODE_ENV !== 'development' || !debugData || debugData.length === 0) {
    return null;
  }

  const rows = onlyProblems
    ? debugData.filter(a => a.tags.length === 0 || a.tags.some(t => t.kind === 'unknown'))
    : debugData;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 transition-all"
          aria-label="Open debug panel"
        >
          <span className="text-sm">Genre Debug</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/98 border-t-4 border-yellow-500 shadow-2xl max-h-[75vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-700 bg-gray-800/50 gap-4">
            <div>
              <h3 className="text-yellow-400 font-bold text-lg">Genre Classification Debug</h3>
              <p className="text-gray-400 text-xs">
                Overall coverage: {overallCoverage !== undefined ? `${Math.round(overallCoverage * 100)}%` : 'N/A'}
                {' • '}
                {KIND_ORDER.map(k => `${KIND_META[k].label} ${summary.kindCounts[k]}`).join(' · ')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyProblems}
                  onChange={e => setOnlyProblems(e.target.checked)}
                  className="accent-yellow-500"
                />
                Only artists with unmatched tags
              </label>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded"
                aria-label="Close debug panel"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 className="text-red-300 font-semibold text-sm mb-2">
                  Unmatched tags ({summary.unmatched.length}) — candidates for the taxonomy
                </h4>
                <div className="flex flex-wrap gap-1">
                  {summary.unmatched.length === 0 && <span className="text-gray-500 text-xs">None</span>}
                  {summary.unmatched.map(([tag, count]) => (
                    <span key={tag} className="px-1.5 py-0.5 rounded border text-xs bg-red-900/40 border-red-600 text-red-200">
                      {tag}{count > 1 && <span className="opacity-60"> ×{count}</span>}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 className="text-pink-300 font-semibold text-sm mb-2">
                  Mood tags recognized ({summary.moods.length}) — currently NOT used in scoring
                </h4>
                <div className="flex flex-wrap gap-1">
                  {summary.moods.length === 0 && <span className="text-gray-500 text-xs">None</span>}
                  {summary.moods.map(([tag, count]) => (
                    <span key={tag} className="px-1.5 py-0.5 rounded border text-xs bg-pink-900/40 border-pink-600 text-pink-200">
                      {tag}{count > 1 && <span className="opacity-60"> ×{count}</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-800 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-yellow-400 font-semibold border-b border-gray-700">Artist</th>
                  <th className="px-4 py-2 text-yellow-400 font-semibold border-b border-gray-700">Tags → matched node</th>
                  <th className="px-4 py-2 text-yellow-400 font-semibold border-b border-gray-700">VACRS</th>
                  <th className="px-4 py-2 text-yellow-400 font-semibold border-b border-gray-700">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(artist => (
                  <tr key={artist.artistName} className="border-b border-gray-800/50 hover:bg-gray-800/30 align-top">
                    <td className="px-4 py-2 text-white font-medium whitespace-nowrap">{artist.artistName}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        {artist.tags.length === 0 && <span className="text-gray-500 text-xs">No genres or tags</span>}
                        {artist.tags.map((t, i) => <TagChip key={`${t.source}-${t.tag}-${i}`} tag={t} />)}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-400 font-mono text-xs whitespace-nowrap">
                      {artist.vacrsScores ? (
                        <span>
                          V{artist.vacrsScores.valence.toFixed(2)} A{artist.vacrsScores.arousal.toFixed(2)}{' '}
                          C{artist.vacrsScores.complexity.toFixed(2)} R{artist.vacrsScores.rawness.toFixed(2)}{' '}
                          S{artist.vacrsScores.socialPresence.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-red-400">No scores</span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`font-semibold ${
                        artist.coverage >= 0.8 ? 'text-green-400' : artist.coverage >= 0.5 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {Math.round(artist.coverage * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-xs text-gray-300 space-y-2">
              <h4 className="text-yellow-400 font-semibold text-sm">Legend</h4>
              <div className="flex flex-wrap gap-2">
                {KIND_ORDER.map(k => (
                  <span key={k} className={`px-1.5 py-0.5 rounded border ${KIND_META[k].className}`} title={KIND_META[k].description}>
                    {KIND_META[k].label}: {KIND_META[k].description}
                  </span>
                ))}
              </div>
              <p>
                <b>S</b> = Spotify genre, <b>L</b> = Last.fm tag. <b>→ node</b> shows the taxonomy node it resolved to;
                a node in parentheses means scores were inherited from that parent.
                Dashed chips are not used in VACRS scoring (mood tags, unmatched tags, and Last.fm tags for artists
                with 3+ Spotify genres). Hover any chip for details.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
