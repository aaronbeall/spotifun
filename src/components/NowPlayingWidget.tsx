'use client';

import { useEffect, useState } from 'react';
import { Music } from 'lucide-react';
import { NowPlaying } from '@/types';

const POLL_INTERVAL_MS = 15000;

function EqualizerBars() {
  return (
    <div className="flex items-end gap-0.5 w-3.5 h-3.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1 h-full bg-green-400 rounded-sm animate-eq-bar"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export function NowPlayingWidget() {
  const [current, setCurrent] = useState<NowPlaying | null>(null);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch('/api/player/current');
        if (!res.ok || cancelled) return;
        const data: NowPlaying = await res.json();
        if (!cancelled) setCurrent(data);
      } catch {
        // Silently ignore — the widget just won't update this tick.
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!current?.track) return null;

  const { track, isPlaying } = current;

  return (
    <div className="flex items-center gap-2.5 bg-gray-900/60 border border-gray-700/50 rounded-full pl-1.5 pr-3 py-1.5">
      <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-gray-700 flex items-center justify-center">
        {track.image ? (
          <img src={track.image} alt="" className="w-full h-full object-cover" />
        ) : (
          <Music className="w-4 h-4 text-gray-400" />
        )}
      </div>
      <div className="min-w-0 hidden md:block">
        <p className="text-xs font-medium text-white truncate max-w-[140px]">{track.name}</p>
        <p className="text-[11px] text-gray-400 truncate max-w-[140px]">{track.artist}</p>
      </div>
      <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
        {isPlaying && <EqualizerBars />}
      </div>
    </div>
  );
}
