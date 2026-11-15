'use client';

import { useEffect, useMemo, useState } from 'react';
import { History } from 'lucide-react';
import { EraSnapshot, ErasResponse, Stats } from '@/types';
import { currentViewSnapshot, readShift } from '@/utils/listeningFacts';
import { noteApiCall } from '@/lib/records/observe';
import { ThemedCardBackground } from '@/components/ThemedCardBackground';
import { SectionShareButton } from '@/components/SectionShareButton';
import { overTimeShare } from '@/components/shareLists';
import type { ShareContent } from '@/components/ShareCardTemplate';
import { CARD_THEMES } from '@/utils/cardThemes';
import { TimeCompare } from './TimeCompare';

interface RankingsProps {
  stats: Stats;
  /** `/api` or `/api/demo`. The period dots come from `{apiBase}/stats/eras`. */
  apiBase?: string;
  onShare?: (content: ShareContent) => void;
}

export default function Rankings({ stats, apiBase = '/api', onShare }: RankingsProps) {
  const current = useMemo(() => currentViewSnapshot(stats), [stats]);
  const [eras, setEras] = useState<EraSnapshot[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setEras(null);
    setFailed(false);
    fetch(`${apiBase}/stats/eras`)
      .then(response => {
        if (apiBase === '/api') noteApiCall('eras', response.ok);
        if (!response.ok) throw new Error('eras failed');
        return response.json() as Promise<ErasResponse>;
      })
      .then(data => {
        if (!cancelled) setEras(data.eras);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  const shift = eras ? readShift(current, eras, stats) : null;

  return (
    <ThemedCardBackground color={CARD_THEMES.time} className="rounded-3xl border border-white/10 p-6 shadow-lg sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold" style={{ color: CARD_THEMES.time.light }}>
            <History className="h-6 w-6" />
            You, over time
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-400">
            The diamond is the source selected above. The dots are Spotify&apos;s top artists and tracks for each period, without Last.fm.
          </p>
        </div>
        {onShare && shift && eras && (
          <SectionShareButton onClick={() => onShare(overTimeShare({ shift, current, eras }))} />
        )}
      </div>

      {failed && (
        <p className="text-sm text-gray-400">Spotify didn&apos;t return the other time ranges.</p>
      )}

      {!failed && !eras && (
        <div className="space-y-4" aria-hidden>
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-full bg-white/5" />
          ))}
        </div>
      )}

      {eras && !shift && (
        <p className="text-sm text-gray-400">Spotify has no top artists or tracks for these periods yet.</p>
      )}

      {shift && eras && (
        <>
          <p className="mb-6 max-w-3xl text-base leading-relaxed text-white/90">{shift.sentence}</p>
          <TimeCompare current={current} eras={eras} standout={shift.standout} />
        </>
      )}
    </ThemedCardBackground>
  );
}
