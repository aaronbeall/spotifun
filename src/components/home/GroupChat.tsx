'use client';

import { useMemo } from 'react';
import { ShareCardTemplate } from '@/components/ShareCardTemplate';
import { findBestMatchingVibe } from '@/utils/musicVibesAnalyzer';
import type { Stats } from '@/types';
import { cn } from '@/utils';

const CARD_SCALE = 0.36;

function Bubble({ from, mine, children, className }: { from?: string; mine?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
      {from && <span className="mb-1 px-2 text-[11px] font-medium text-white/40">{from}</span>}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-snug',
          mine ? 'rounded-br-md bg-violet-600 text-white' : 'rounded-bl-md bg-gray-800 text-gray-100',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** A phone-sized group chat where Sam drops their vibe share card. */
export function GroupChat({ stats }: { stats: Stats }) {
  const { vibe, matchPercentage } = useMemo(() => findBestMatchingVibe(stats.genres), [stats.genres]);
  const topArtist = stats.artists[0]?.artist.name;
  const topGenre = stats.genres[0]?.genre;

  return (
    <div className="mx-auto w-full max-w-[340px] rounded-[2.5rem] border border-white/10 bg-gray-950 p-3 shadow-2xl shadow-violet-950/50">
      <div className="overflow-hidden rounded-[2rem] bg-gray-900">
        <div className="flex items-center gap-3 border-b border-white/5 bg-gray-900/90 px-4 pb-3 pt-5">
          <div className="flex -space-x-2">
            {['from-pink-500 to-orange-400', 'from-sky-500 to-violet-500', 'from-green-400 to-teal-500'].map(gradient => (
              <div key={gradient} className={cn('h-7 w-7 rounded-full border-2 border-gray-900 bg-gradient-to-br', gradient)} />
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">music nerds 🎧</p>
            <p className="text-[11px] text-white/40">Juno, Theo, Sam</p>
          </div>
        </div>
        <div className="space-y-3 px-3 py-4">
          <Bubble from="Juno">ok be honest. what have you been listening to</Bubble>
          <Bubble mine className="bg-transparent p-0">
            <div
              className="overflow-hidden rounded-2xl rounded-br-md"
              style={{ width: 640 * CARD_SCALE, height: 800 * CARD_SCALE }}
            >
              <div style={{ transform: `scale(${CARD_SCALE})`, transformOrigin: 'top left' }}>
                <ShareCardTemplate
                  content={{
                    eyebrow: 'Your Current Vibe',
                    title: vibe.name,
                    value: `${Math.round(matchPercentage)}% Match`,
                    description: vibe.description,
                    color: vibe.color,
                    visual: vibe.image ? (
                      <div className="h-56 w-56 overflow-hidden rounded-full border-4 border-white/10" style={{ boxShadow: `0 0 60px ${vibe.color.light}80` }}>
                        <img src={vibe.image} alt="" className="h-full w-full object-cover" />
                      </div>
                    ) : undefined,
                  }}
                />
              </div>
            </div>
          </Bubble>
          <Bubble from="Juno">
            {vibe.name.toLowerCase()}?? {topArtist ? <>with {topArtist} on top? respect</> : 'respect'}
          </Bubble>
          <Bubble from="Theo">mine says melancholic reflection. it&apos;s been a week</Bubble>
          <Bubble mine>{topGenre ? <>wait till you see how much {topGenre} is in there</> : 'send yours 👀'}</Bubble>
        </div>
      </div>
    </div>
  );
}
