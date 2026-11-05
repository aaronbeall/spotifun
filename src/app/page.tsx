'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, Headphones, MessageCircle, Repeat, Sparkles, Trophy } from 'lucide-react';
import { HeroWaves } from '@/components/home/HeroWaves';
import { VibeGlobe } from '@/components/home/VibeGlobe';
import type { Stats } from '@/types';
import { cn } from '@/utils';

// The showcase renders the real dashboard components, which pull in d3 and friends.
// Load them after the hero so the first paint stays light.
const WrappedMusicProfile = dynamic(() => import('@/components/features/WrappedMusicProfile').then(m => m.WrappedMusicProfile), { ssr: false });
const FunStats = dynamic(() => import('@/components/features/FunStats'), { ssr: false });
const Achievements = dynamic(() => import('@/components/features/Achievements'), { ssr: false });
const OnRepeat = dynamic(() => import('@/components/home/OnRepeat').then(m => m.OnRepeat), { ssr: false });
const GroupChat = dynamic(() => import('@/components/home/GroupChat').then(m => m.GroupChat), { ssr: false });

const EXAMPLE_STATS_URL = '/api/demo/stats?timeRange=medium_term&limit=50&mode=recent';

/** Sam's listening, from the same pipeline as the real dashboard */
function useExampleStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch(EXAMPLE_STATS_URL)
      .then(response => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data: Stats) => { if (!cancelled) setStats(data); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);
  return { stats, failed };
}

const reveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: 'easeOut' as const },
};

function ConnectButton({ isConnecting, onClick, className }: { isConnecting: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={isConnecting}
      className={cn(
        'group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 font-semibold text-white',
        'shadow-lg shadow-fuchsia-500/25 hover:from-violet-400 hover:to-fuchsia-400 hover:shadow-fuchsia-500/40 disabled:cursor-wait disabled:opacity-80',
        className,
      )}
    >
      {isConnecting ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Connecting...
        </>
      ) : (
        <>
          <Headphones className="h-4 w-4" />
          Connect Spotify
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}

function SectionTitle({ icon: Icon, iconClass, title, children }: { icon: typeof Sparkles; iconClass: string; title: string; children?: React.ReactNode }) {
  return (
    <motion.div {...reveal} className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
      <h2 className="flex flex-col items-center justify-center gap-2 font-display text-3xl font-extrabold tracking-tight text-white sm:flex-row sm:gap-3 sm:text-4xl">
        <Icon className={cn('h-7 w-7 shrink-0', iconClass)} />
        {title}
      </h2>
      {children && <p className="mt-3 text-lg text-gray-400">{children}</p>}
    </motion.div>
  );
}

function Placeholder({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-3xl border border-white/5 bg-gray-800/60', className)} />;
}

export default function Home() {
  const [isConnecting, setIsConnecting] = useState(false);
  const globeRef = useRef<HTMLDivElement>(null);
  const { stats, failed } = useExampleStats();

  const handleConnect = () => {
    setIsConnecting(true);
    window.location.href = '/api/auth/spotify';
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-gray-950 text-white">
      {/* Hero */}
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_70%_40%,rgba(124,58,237,0.28),transparent_60%),radial-gradient(ellipse_at_10%_90%,rgba(217,70,239,0.16),transparent_55%)]" />
        <HeroWaves anchorRef={globeRef} className="absolute inset-0 -z-10 h-full w-full opacity-90 lg:[mask-image:linear-gradient(90deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.35)_35%,black_60%)]" />

        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10" />
            <span className="text-2xl font-black italic lowercase tracking-tight text-violet-400">spotifun</span>
          </Link>
          <Link href="/example" className="hidden rounded-full px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white sm:inline-flex">
            Peek at Sam&apos;s profile
          </Link>
        </header>

        <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-6 px-4 pb-12 sm:px-6 sm:pb-16 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="order-2 lg:order-1">
            <h1 className="font-display text-[2.6rem] font-extrabold leading-[0.95] tracking-tight sm:text-6xl xl:text-7xl">
              Get nerdy about
              <br />
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">your listening.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-300 sm:mt-6 sm:text-lg">
              Spotifun digs through your Spotify history and turns it into vibes, genre maps, stream charts, a listener persona and a few silly badges.
              Poke around, see what turns up, and send the weird bits to your friends.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
              <ConnectButton isConnecting={isConnecting} onClick={handleConnect} />
              <Link
                href="/example"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 font-semibold text-gray-100 backdrop-blur hover:border-white/30 hover:bg-white/10"
              >
                <Eye className="h-4 w-4 text-fuchsia-300" />
                Peek at Sam&apos;s profile
              </Link>
            </div>
            <p className="mt-5 text-sm text-gray-500">Sam is pretend. The music is real.</p>
          </motion.div>

          <motion.div
            ref={globeRef}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="relative order-1 mx-auto aspect-square w-full max-w-[min(340px,40svh)] sm:max-w-[460px] lg:order-2 lg:max-w-[620px]"
          >
            <VibeGlobe className="h-full w-full" />
          </motion.div>
        </div>
      </section>

      {failed && (
        <p className="mx-auto max-w-xl px-4 py-16 text-center text-gray-400">
          Sam&apos;s profile didn&apos;t load just now. <Link href="/example" className="text-violet-300 underline">Try the full version</Link>.
        </p>
      )}

      {!failed && (
        <main className="relative">
          {/* Profile carousel, live */}
          <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
            <SectionTitle icon={Sparkles} iconClass="text-fuchsia-400" title="Flip through Sam's profile">
              This is the real thing, running on Sam&apos;s listening. Click around. Every card has a share button.
            </SectionTitle>
            <motion.div {...reveal}>
              {stats ? (
                <WrappedMusicProfile stats={stats} isLoadingTimeRange={false} playLimit={50} onPlayLimitChange={() => {}} />
              ) : (
                <Placeholder className="h-[560px]" />
              )}
            </motion.div>
          </section>

          {/* Top artists and tracks */}
          <section className="py-14 sm:py-20">
            <div className="px-4 sm:px-6">
              <SectionTitle icon={Repeat} iconClass="text-green-400" title="Who's on repeat">
                Top artists, tracks and genres, for the last four weeks, six months or all time.
              </SectionTitle>
            </div>
            {stats ? <OnRepeat stats={stats} /> : <Placeholder className="mx-auto h-72 max-w-6xl" />}
          </section>

          {/* Sharing */}
          <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div {...reveal} className="text-center lg:text-left">
                <h2 className="flex flex-col items-center justify-center gap-2 font-display text-3xl font-extrabold tracking-tight sm:flex-row sm:gap-3 sm:text-4xl lg:justify-start">
                  <MessageCircle className="h-7 w-7 text-sky-400" />
                  For the group chat
                </h2>
                <p className="mt-4 text-lg text-gray-400">
                  Any card can become a tidy little image. What happens after that is between you and your friends.
                </p>
              </motion.div>
              <motion.div {...reveal}>{stats ? <GroupChat stats={stats} /> : <Placeholder className="mx-auto h-[620px] max-w-[340px]" />}</motion.div>
            </div>
          </section>

          {/* Fun stats and achievements */}
          <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
            <SectionTitle icon={Trophy} iconClass="text-yellow-400" title="Odd little facts">
              A story from this view, and findings like a replay, a deep cut, or songs that span decades.
            </SectionTitle>
            <motion.div {...reveal} className="space-y-8">
              {stats ? (
                <>
                  <FunStats stats={stats} />
                  {/* Eight stacked badges is a lot of thumb-scrolling on a phone, so show a peek */}
                  <div className="relative max-h-[560px] overflow-hidden sm:max-h-none sm:overflow-visible">
                    <Achievements stats={stats} />
                    <div className="absolute inset-x-0 bottom-0 flex h-40 items-end justify-center bg-gradient-to-t from-gray-950 via-gray-950/90 to-transparent pb-4 sm:hidden">
                      <Link href="/example" className="rounded-full border border-white/15 bg-gray-800/90 px-5 py-2 text-sm font-medium text-gray-100">
                        See the rest of Sam&apos;s findings
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <Placeholder className="h-96" />
              )}
            </motion.div>
          </section>
        </main>
      )}

      {/* Closing */}
      <section className="relative isolate overflow-hidden border-t border-white/5">
        <Image src="/home/art-spiral.webp" alt="" fill sizes="100vw" className="-z-10 object-cover opacity-25" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-950 via-gray-950/70 to-gray-950" />
        <motion.div {...reveal} className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:py-28">
          <Image src="/logo.png" alt="" width={72} height={72} className="h-16 w-16" />
          <h2 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Curious what&apos;s in yours?</h2>
          <p className="mt-4 text-lg text-gray-400">It only reads your listening history. Your playlists stay exactly as they are.</p>
          <ConnectButton isConnecting={isConnecting} onClick={handleConnect} className="mt-8" />
        </motion.div>
      </section>

      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-gray-500 sm:flex-row sm:px-6">
          <p>A just-for-fun side project. Not affiliated with Spotify.</p>
          <p className="flex gap-3">
            <Link href="/about" className="hover:text-gray-300">About</Link>
            <Link href="/about/vacrs" className="hover:text-gray-300">VACRS</Link>
            <span>Sam is pretend. The artists, songs and artwork are real.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
