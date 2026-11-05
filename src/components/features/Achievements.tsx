'use client';

import { Search } from 'lucide-react';
import { Stats } from '@/types';
import { buildFindings, viewScope, type Finding } from '@/utils/listeningFacts';

interface AchievementsProps {
  stats: Stats;
}

function HitCard({ finding }: { finding: Finding }) {
  if (finding.kind === 'replay') {
    return (
      <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-fuchsia-600 to-orange-500 p-6 text-white shadow-lg">
        <div className="absolute -right-4 -top-3 rotate-12 rounded-md border-4 border-white/90 px-2 py-1 text-xs font-black tracking-[0.18em]">
          ×{finding.count}
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">Replay</p>
        <h3 className="mt-3 text-2xl font-black leading-tight">{finding.name}</h3>
        <p className="mt-2 text-sm text-white/80">{finding.artist}</p>
        <p className="mt-4 text-sm text-white/90">{finding.fact}</p>
      </article>
    );
  }

  if (finding.kind === 'streak') {
    const marks = Math.min(finding.count ?? 0, 16);
    return (
      <article className="rounded-2xl bg-[#1b1030] p-6 text-white shadow-lg ring-1 ring-violet-400/40">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-violet-300">Streak</p>
        <div className="mt-4 flex items-end gap-1" aria-hidden>
          {Array.from({ length: marks }, (_, index) => (
            <span
              key={index}
              className="w-2 rounded-full bg-violet-200"
              style={{ height: `${12 + (index % 5) * 6}px` }}
            />
          ))}
        </div>
        <h3 className="mt-4 text-2xl font-black leading-tight">{finding.name}</h3>
        <p className="mt-2 text-sm text-violet-100/80">{finding.fact}</p>
      </article>
    );
  }

  if (finding.kind === 'deepcut') {
    return (
      <article className="rounded-2xl bg-[#0c0a09] p-6 text-stone-300 shadow-lg ring-1 ring-stone-700">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-stone-500">Deep cut</p>
        <p className="mt-4 font-mono text-5xl font-bold tabular-nums text-amber-200/90">{finding.count}</p>
        <h3 className="mt-3 text-xl font-semibold text-stone-100">{finding.name}</h3>
        <p className="mt-1 text-sm text-stone-500">{finding.artist}</p>
      </article>
    );
  }

  if (finding.kind === 'span') {
    return (
      <article className="rounded-2xl bg-[#10141c] p-6 text-white shadow-lg ring-1 ring-sky-900">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-300/80">Year span</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <span className="text-3xl font-black tabular-nums text-amber-100">{finding.from}</span>
          <span className="mb-2 h-px flex-1 bg-gradient-to-r from-amber-200 to-sky-300" />
          <span className="text-3xl font-black tabular-nums text-sky-100">{finding.to}</span>
        </div>
        <p className="mt-3 text-sm text-white/70">{finding.count} years apart</p>
      </article>
    );
  }

  const percent = finding.percent ?? 0;
  return (
    <article className="flex items-center gap-5 rounded-2xl bg-emerald-950 p-6 text-white shadow-lg ring-1 ring-emerald-700/60">
      <div
        className="grid h-20 w-20 shrink-0 place-items-center rounded-full"
        style={{ background: `conic-gradient(#5eead4 ${percent * 3.6}deg, rgba(255,255,255,0.12) 0)` }}
        aria-hidden
      >
        <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-950 text-sm font-black">
          {percent}%
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300/80">Coverage</p>
        <h3 className="mt-2 text-lg font-bold leading-snug">{finding.fact}</h3>
      </div>
    </article>
  );
}

export default function Achievements({ stats }: AchievementsProps) {
  const findings = buildFindings(stats);
  const hits = findings.filter(finding => finding.hit);
  const misses = findings.filter(finding => !finding.hit);
  const scope = viewScope(stats);

  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-lg sm:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
            <Search className="h-6 w-6 text-emerald-300" />
            Findings
          </h2>
          <p className="mt-1 text-sm text-gray-400">Patterns in this view. They change when the source changes.</p>
        </div>
        <span className="rounded-full border border-gray-600 bg-gray-900/70 px-3 py-1 text-xs font-medium text-gray-300">
          {scope}
        </span>
      </div>

      {findings.length === 0 ? (
        <p className="text-sm text-gray-400">This view has no songs to measure.</p>
      ) : (
        <>
          {hits.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {hits.map(finding => (
                <HitCard key={finding.id} finding={finding} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Nothing in this view clears a mark. The measurements are below.</p>
          )}

          {misses.length > 0 && (
            <ul className="mt-6 divide-y divide-white/10 text-sm">
              {misses.map(finding => (
                <li key={finding.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <span className="font-medium text-gray-400">{finding.title}</span>
                  <span className="text-gray-300 sm:text-right">
                    {finding.fact}
                    <span className="mt-0.5 block text-xs text-gray-500">{finding.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
