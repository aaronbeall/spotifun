'use client';

import { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { ArtistGenreDebugInfo, GenreMatchKind, GenreTagDebugInfo, LastFmDebugStatus } from '@/types';

interface GenreDebugPanelProps {
  debugData?: ArtistGenreDebugInfo[];
  overallCoverage?: number;
  lastFmStatus?: LastFmDebugStatus;
  isLoading: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
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
    `"${t.tag}" (${t.source === 'spotify' ? 'Spotify' : `Last.fm, weight ${t.weight ?? '?'}/100`})`,
    `Match: ${KIND_META[t.kind].label} — ${KIND_META[t.kind].description}`
  ];
  if (t.filteredAsJunk) lines.push('Dropped by the Last.fm junk-tag filter before classification');
  if (t.node) lines.push(`Node: ${t.node}`);
  if (t.scoresFrom && t.scoresFrom !== t.node) lines.push(`Scores inherited from: ${t.scoresFrom}`);
  lines.push(t.usedInScoring ? 'Used in VACRS scoring' : 'NOT used in VACRS scoring');
  return lines.join('\n');
}

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="#1DB954" aria-label="Spotify" role="img">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function LastFmIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="#D51007" aria-label="Last.fm" role="img">
      <path d="M10.584 17.21l-.88-2.392s-1.43 1.594-3.573 1.594c-1.897 0-3.244-1.649-3.244-4.288 0-3.382 1.704-4.591 3.381-4.591 2.42 0 3.189 1.567 3.849 3.574l.88 2.749c.88 2.666 2.529 4.81 7.285 4.81 3.409 0 5.718-1.044 5.718-3.793 0-2.227-1.265-3.381-3.63-3.931l-1.758-.385c-1.21-.275-1.567-.77-1.567-1.595 0-.934.742-1.484 1.952-1.484 1.32 0 2.034.495 2.144 1.677l2.749-.33c-.22-2.474-1.924-3.492-4.729-3.492-2.474 0-4.893.935-4.893 3.932 0 1.87.907 3.051 3.189 3.601l1.87.44c1.402.33 1.869.907 1.869 1.704 0 1.017-.99 1.43-2.86 1.43-2.776 0-3.93-1.457-4.59-3.464l-.907-2.75c-1.155-3.573-2.997-4.893-6.653-4.893C2.144 5.333 0 7.89 0 12.233c0 4.18 2.144 6.434 5.993 6.434 3.106 0 4.591-1.457 4.591-1.457z" />
    </svg>
  );
}

function TagChip({ tag }: { tag: GenreTagDebugInfo }) {
  const meta = KIND_META[tag.kind];
  const showNode = tag.node && tag.node !== tag.tag.toLowerCase();
  return (
    <span
      title={tagTooltip(tag)}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-xs cursor-help ${meta.className} ${
        tag.usedInScoring ? '' : 'border-dashed opacity-70'
      } ${tag.filteredAsJunk ? 'opacity-50' : ''}`}
    >
      {tag.source === 'spotify'
        ? <SpotifyIcon className="w-3.5 h-3.5 shrink-0 rounded-full bg-gray-950 p-[1px]" />
        : <LastFmIcon className="w-3.5 h-3.5 shrink-0 rounded-full bg-gray-950 p-[1.5px]" />}
      <span className={tag.filteredAsJunk ? 'line-through' : ''}>{tag.tag}</span>
      {tag.weight !== undefined && <span className="opacity-50 text-[10px]">{tag.weight}</span>}
      {showNode && <span className="opacity-70">→ {tag.node}</span>}
      {tag.scoresFrom && tag.scoresFrom !== tag.node && (
        <span className="opacity-50">({tag.scoresFrom})</span>
      )}
    </span>
  );
}

function TagSummary({ title, titleClassName, chipClassName, entries }: {
  title: string;
  titleClassName: string;
  chipClassName: string;
  entries: Array<[string, number]>;
}) {
  return (
    <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
      <h4 className={`font-semibold text-sm mb-2 ${titleClassName}`}>{title} ({entries.length})</h4>
      <div className="flex flex-wrap gap-1 max-h-40 overflow-auto">
        {entries.length === 0 && <span className="text-gray-500 text-xs">None</span>}
        {entries.map(([tag, count]) => (
          <span key={tag} className={`px-1.5 py-0.5 rounded border text-xs ${chipClassName}`}>
            {tag}{count > 1 && <span className="opacity-60"> ×{count}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

const LAST_FM_STATUS_TEXT: Record<LastFmDebugStatus, string> = {
  'on': 'Last.fm: raw tags fetched for every artist',
  'disabled': 'Last.fm: enrichment turned off in the menu — no Last.fm tags',
  'no-api-key': 'Last.fm: LASTFM_API_KEY not set — no Last.fm tags'
};

/**
 * Dev-only debug panel for genre classification.
 * Shows how every Spotify genre and Last.fm tag resolved, per artist, as a bottom drawer.
 */
export function GenreDebugPanel({ debugData, overallCoverage, lastFmStatus, isLoading, isOpen, onOpenChange }: GenreDebugPanelProps) {
  const [onlyProblems, setOnlyProblems] = useState(false);

  const summary = useMemo(() => {
    const kindCounts = Object.fromEntries(KIND_ORDER.map(k => [k, 0])) as Record<GenreMatchKind, number>;
    const unmatched = new Map<string, number>();
    const moods = new Map<string, number>();
    const junk = new Map<string, number>();
    const bump = (m: Map<string, number>, tag: string) => m.set(tag, (m.get(tag) ?? 0) + 1);
    for (const artist of debugData ?? []) {
      for (const t of artist.tags) {
        kindCounts[t.kind]++;
        if (t.kind === 'descriptor') bump(moods, t.tag);
        if (t.filteredAsJunk) bump(junk, t.tag);
        else if (t.kind === 'unknown') bump(unmatched, t.tag);
      }
    }
    const byCount = (m: Map<string, number>) => Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
    return { kindCounts, unmatched: byCount(unmatched), moods: byCount(moods), junk: byCount(junk) };
  }, [debugData]);

  const data = debugData ?? [];
  const rows = onlyProblems
    ? data.filter(a => a.tags.length === 0 || a.tags.some(t => t.kind === 'unknown'))
    : data;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => onOpenChange(true)}
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
              <h3 className="text-yellow-400 font-bold text-lg">
                Genre Classification Debug
                {isLoading && <span className="ml-2 text-xs font-normal text-gray-400 animate-pulse">refreshing…</span>}
              </h3>
              <p className="text-gray-400 text-xs">
                Overall coverage: {overallCoverage !== undefined ? `${Math.round(overallCoverage * 100)}%` : 'N/A'}
                {' • '}
                {KIND_ORDER.map(k => `${KIND_META[k].label} ${summary.kindCounts[k]}`).join(' · ')}
                {lastFmStatus && <>{' • '}{LAST_FM_STATUS_TEXT[lastFmStatus]}</>}
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
                onClick={() => onOpenChange(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded"
                aria-label="Close debug panel"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-6">
            {data.length === 0 ? (
              <p className="text-gray-400 text-sm">
                {isLoading
                  ? 'Loading genre debug data…'
                  : 'No debug data in the last stats response. It is only returned by the dev server (NODE_ENV=development).'}
              </p>
            ) : (<>
            <div className="grid md:grid-cols-3 gap-4">
              <TagSummary
                title="Unmatched tags — candidates for the taxonomy or mood vocabulary"
                titleClassName="text-red-300"
                chipClassName={KIND_META.unknown.className}
                entries={summary.unmatched}
              />
              <TagSummary
                title="Mood tags recognized — shown here, not used in scoring"
                titleClassName="text-pink-300"
                chipClassName={KIND_META.descriptor.className}
                entries={summary.moods}
              />
              <TagSummary
                title="Dropped by Last.fm junk filter"
                titleClassName="text-gray-300"
                chipClassName="bg-gray-800 border-gray-600 text-gray-400 line-through"
                entries={summary.junk}
              />
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
                <SpotifyIcon className="w-3 h-3 inline align-[-2px]" /> = Spotify genre,{' '}
                <LastFmIcon className="w-3 h-3 inline align-[-2px]" /> = Last.fm tag. <b>→ node</b> shows the taxonomy node it resolved to;
                a node in parentheses means scores were inherited from that parent.
                Every raw tag is shown, whether or not it affects scoring. The small number on Last.fm chips is the
                tag&apos;s weight (0–100). Dashed chips are not used in VACRS scoring (mood tags, unmatched tags, and
                Last.fm tags for artists with 3+ Spotify genres). Struck-through chips were dropped by the Last.fm
                junk filter (nationality, decade, &quot;seen live&quot;, generic contexts like &quot;chill&quot;).
                Hover any chip for details.
              </p>
            </div>
            </>)}
          </div>
        </div>
      )}
    </>
  );
}
