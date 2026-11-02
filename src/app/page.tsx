'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, Sparkles, BarChart3, Waves, Flame, UserRound, Share2, Trophy,
  Headphones, Eye, Lock, Star, type LucideIcon,
} from 'lucide-react';
import { MUSIC_VIBES } from '@/utils/musicVibes';
import { cn } from '@/utils';

type Shot = { src: string; width: number; height: number; alt: string };

const SHOTS = {
  dashboard: { src: '/home/dashboard.webp', width: 1600, height: 1075, alt: 'The Spotifun dashboard showing a Playful Whimsy vibe' },
  vibes: { src: '/home/vibes.webp', width: 1600, height: 1020, alt: 'Vibes card: 86% Playful Whimsy, with top artist and top genre' },
  spectrum: { src: '/home/spectrum.webp', width: 1600, height: 759, alt: 'Genre Spectrum card plotting genres from calm to energetic and polished to raw' },
  flow: { src: '/home/flow.webp', width: 1600, height: 849, alt: 'Listening Flow stream chart of genres over recent plays' },
  popularity: { src: '/home/popularity.webp', width: 1600, height: 721, alt: 'Track Popularity histogram labelled Varied Tastes' },
  persona: { src: '/home/persona.webp', width: 1600, height: 518, alt: 'Listener Persona card: The Eclectic Retrohead' },
  share: { src: '/home/share.webp', width: 1280, height: 1600, alt: 'A shareable Spotifun vibe card' },
  funstats: { src: '/home/funstats.webp', width: 1600, height: 483, alt: 'Fun Stats story carousel' },
  achievements: { src: '/home/achievements.webp', width: 1600, height: 1181, alt: 'Achievements grid with unlocked badges' },
  topArtists: { src: '/home/top-artists.webp', width: 1600, height: 755, alt: 'Top Artists grid' },
  topTracks: { src: '/home/top-tracks.webp', width: 1600, height: 950, alt: 'Top Tracks grid' },
} satisfies Record<string, Shot>;

const CARDS: { id: string; label: string; icon: LucideIcon; title: string; quip: string; shot: Shot; accent: string }[] = [
  {
    id: 'vibes', label: 'Vibes', icon: Sparkles, shot: SHOTS.vibes, accent: 'from-fuchsia-500 to-violet-500',
    title: 'Get a vibe, not a spreadsheet',
    quip: 'We match your recent plays against 15 hand-painted vibes. You might be Playful Whimsy. You might be Solemn Majesty. No take-backs.',
  },
  {
    id: 'spectrum', label: 'Spectrum', icon: BarChart3, shot: SHOTS.spectrum, accent: 'from-sky-400 to-blue-600',
    title: 'Your taste, on five sliders',
    quip: 'Pleasant or gloomy, calm or chaotic, polished or gloriously raw. Every genre you play gets plotted, so you can see how wide your range really is.',
  },
  {
    id: 'flow', label: 'Flow', icon: Waves, shot: SHOTS.flow, accent: 'from-pink-500 to-rose-500',
    title: 'Watch your day turn into a lava lamp',
    quip: 'A stream chart of your last plays. Spot the exact moment your focus playlist became a 2am pop spiral.',
  },
  {
    id: 'popularity', label: 'Popularity', icon: Flame, shot: SHOTS.popularity, accent: 'from-amber-400 to-orange-500',
    title: 'Mainstream or deep cut?',
    quip: 'Find out how niche you really are, plus your most obscure track to drop casually into conversation.',
  },
  {
    id: 'persona', label: 'Persona', icon: UserRound, shot: SHOTS.persona, accent: 'from-emerald-400 to-teal-500',
    title: 'Meet your listener persona',
    quip: 'The Eclectic Retrohead. The Trend Voyager. Your habits get a name, a description, and a one-of-a-kind generative avatar.',
  },
];

const FAQ = [
  { q: 'Is it free?', a: 'Yep, totally free. Log in and start snooping on yourself.' },
  { q: 'Can it mess with my playlists?', a: 'Nope. Spotifun only asks to read your listening history. It never edits, follows or posts anything.' },
  { q: 'Will it judge my music taste?', a: 'Only lovingly. Your 47th play of the same song is safe with us.' },
  { q: 'Do I have to wait until December?', a: "That's the whole point. Your stats are ready the second you log in, any day of the year." },
];

function connectSpotify() {
  window.location.href = '/api/auth/spotify';
}

function Sticker({ children, className, tilt = -6 }: { children: React.ReactNode; className?: string; tilt?: number }) {
  return (
    <div
      style={{ '--tilt': `${tilt}deg` } as React.CSSProperties}
      className={cn(
        'animate-wobble inline-flex items-center gap-1.5 rounded-full border-2 border-black px-4 py-2',
        'font-display text-sm font-extrabold text-black shadow-[4px_4px_0_0_#000] select-none whitespace-nowrap',
        className,
      )}
    >
      {children}
    </div>
  );
}

function Screenshot({ shot, className, preload, sizes = '(min-width: 1024px) 50vw, 100vw' }: { shot: Shot; className?: string; preload?: boolean; sizes?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl bg-gray-900 ring-1 ring-white/15 shadow-2xl shadow-black/60', className)}>
      <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes={sizes} preload={preload} loading={preload ? 'eager' : undefined} className="block h-auto w-full" />
    </div>
  );
}

function ConnectButton({ size = 'lg', isConnecting, onClick }: { size?: 'md' | 'lg'; isConnecting: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={isConnecting}
      className={cn(
        'group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-black bg-lime-300 font-display font-extrabold text-black',
        'shadow-[5px_5px_0_0_#000] hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0_#000] active:translate-y-0.5 active:shadow-[2px_2px_0_0_#000]',
        'disabled:cursor-wait disabled:opacity-80',
        size === 'lg' ? 'px-7 py-4 text-lg' : 'px-5 py-2.5 text-sm',
      )}
    >
      {isConnecting ? (
        <>
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
          Tuning in...
        </>
      ) : (
        <>
          <Headphones className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
          {size === 'lg' ? 'Connect with Spotify' : (
            <>
              <span className="sm:hidden">Connect</span>
              <span className="hidden sm:inline">Connect with Spotify</span>
            </>
          )}
          <ArrowRight className={cn(size === 'lg' ? 'h-5 w-5' : 'h-4 w-4', 'transition-transform group-hover:translate-x-1')} />
        </>
      )}
    </button>
  );
}

function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-lime-300">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">{title}</h2>
      {children && <p className="mt-5 text-lg text-white/70">{children}</p>}
    </div>
  );
}

const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: 'easeOut' as const },
};

export default function Home() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const card = CARDS[activeCard];

  const handleConnect = () => {
    setIsConnecting(true);
    connectSpotify();
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0c0716] text-white">
      {/* Background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[1100px] overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-fuchsia-600/35 blur-[120px]" />
        <div className="absolute right-[-10%] top-20 h-[520px] w-[520px] rounded-full bg-violet-600/40 blur-[120px]" />
        <div className="absolute left-1/3 top-[600px] h-[420px] w-[420px] rounded-full bg-lime-400/15 blur-[120px]" />
      </div>

      {/* Nav */}
      <header className="relative z-20">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="" width={44} height={44} className="h-11 w-11 -rotate-6 transition-transform hover:rotate-6" />
            <span className="font-display text-2xl font-extrabold italic lowercase tracking-tight text-violet-300">spotifun</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/demo" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white sm:inline-flex">
              Peek at a demo
            </Link>
            <ConnectButton size="md" isConnecting={isConnecting} onClick={handleConnect} />
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:pt-14">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/80 backdrop-blur">
              <Sparkles className="h-4 w-4 text-lime-300" />
              Like Wrapped, but you don&apos;t have to wait for December
            </div>
            <h1 className="mt-6 font-display text-6xl font-extrabold leading-[0.92] tracking-tight sm:text-7xl xl:text-[5.5rem]">
              Your Spotify,
              <br />
              but make it{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-lime-300 via-fuchsia-400 to-violet-400 bg-clip-text italic text-transparent">fun</span>
                <svg aria-hidden viewBox="0 0 200 20" className="absolute -bottom-2 left-0 w-full text-lime-300" preserveAspectRatio="none">
                  <path d="M2 14 C 40 4, 80 4, 110 12 S 170 18, 198 6" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
              .
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/75 sm:text-xl">
              Spotifun turns your listening history into vibes, charts, a listener persona, achievements and cards you&apos;ll actually want to post.
              It&apos;s nosy in the nicest possible way.
            </p>
            <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <ConnectButton isConnecting={isConnecting} onClick={handleConnect} />
              <Link href="/demo" className="group inline-flex items-center gap-2 rounded-full px-3 py-3 font-semibold text-white/85 hover:text-white">
                <Eye className="h-5 w-5 text-fuchsia-300" />
                <span className="underline decoration-fuchsia-400/60 decoration-2 underline-offset-4 group-hover:decoration-fuchsia-300">Snoop on a made-up listener first</span>
              </Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-white/50">
              <Lock className="h-4 w-4" /> Free. Read-only. Your playlists stay exactly where you left them.
            </p>
          </motion.div>

          {/* Collage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative mx-auto w-full max-w-2xl pb-16 sm:pb-24 lg:pb-10"
          >
            <Screenshot shot={SHOTS.vibes} preload className="relative -rotate-3 transition-transform duration-500 hover:rotate-0" />
            <div className="absolute -bottom-2 right-[-4%] w-[38%] rotate-[7deg] transition-transform duration-500 hover:rotate-2 sm:-bottom-6">
              <Screenshot shot={SHOTS.share} sizes="(min-width: 1024px) 20vw, 40vw" className="ring-2 ring-white/25" />
            </div>
            <Sticker className="absolute -left-3 -top-5 bg-lime-300 sm:-left-8" tilt={-8}>
              <Sparkles className="h-4 w-4" /> 86% Playful Whimsy
            </Sticker>
            <Sticker className="absolute -right-2 top-[38%] hidden bg-pink-400 sm:inline-flex" tilt={9}>
              certified dream pop enjoyer
            </Sticker>
            <Sticker className="absolute bottom-6 left-[6%] bg-amber-300 sm:bottom-10" tilt={-4}>
              <Trophy className="h-4 w-4" /> Genre Explorer unlocked
            </Sticker>
          </motion.div>
        </section>

        {/* Vibe marquee */}
        <section aria-label="The 15 vibes" className="relative -rotate-2 border-y-2 border-black bg-lime-300 py-4 shadow-[0_8px_0_0_#000]">
          <div className="flex w-max animate-marquee gap-4">
            {[...MUSIC_VIBES, ...MUSIC_VIBES].map((vibe, i) => (
              <div key={`${vibe.id}-${i}`} aria-hidden={i >= MUSIC_VIBES.length} className="flex shrink-0 items-center gap-3 rounded-full border-2 border-black bg-white py-1 pl-1 pr-5">
                {vibe.image && <Image src={vibe.image} alt="" width={40} height={40} className="h-10 w-10 rounded-full" />}
                <span className="font-display text-lg font-extrabold text-black">{vibe.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Profile carousel showcase */}
        <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
          <motion.div {...reveal}>
            <SectionHeading eyebrow="Your music profile" title={<>Five cards. <span className="italic text-fuchsia-400">Zero chill.</span></>}>
              Swipe through a Wrapped-style profile built from what you&apos;ve actually been playing lately. Go on, click around.
            </SectionHeading>
          </motion.div>

          <div className="mt-12 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Profile cards">
            {CARDS.map((c, i) => {
              const Icon = c.icon;
              const active = i === activeCard;
              return (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCard(i)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 font-display font-bold',
                    active
                      ? 'border-black bg-white text-black shadow-[3px_3px_0_0_#a3e635]'
                      : 'border-white/15 bg-white/5 text-white/75 hover:border-white/40 hover:text-white',
                  )}
                >
                  <Icon className="h-4 w-4" /> {c.label}
                </button>
              );
            })}
          </div>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <AnimatePresence mode="wait">
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <div className={cn('inline-flex rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg', card.accent)}>
                  <card.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 font-display text-3xl font-extrabold sm:text-4xl">{card.title}</h3>
                <p className="mt-4 text-lg leading-relaxed text-white/70">{card.quip}</p>
                <div className="mt-6 flex gap-1.5">
                  {CARDS.map((c, i) => (
                    <button
                      key={c.id}
                      aria-label={`Show ${c.label}`}
                      onClick={() => setActiveCard(i)}
                      className={cn('h-2 rounded-full', i === activeCard ? 'w-8 bg-lime-300' : 'w-2 bg-white/25 hover:bg-white/50')}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="relative">
              <div className={cn('absolute -inset-4 rotate-2 rounded-3xl bg-gradient-to-br opacity-60 blur-2xl', card.accent)} aria-hidden />
              <AnimatePresence mode="wait">
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, rotate: -3, scale: 0.96 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 3, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <Screenshot shot={card.shot} sizes="(min-width: 1024px) 60vw, 100vw" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Share cards */}
        <section className="relative overflow-hidden border-y border-white/10">
          <Image src="/home/art-zaps.webp" alt="" fill sizes="100vw" className="object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0716] via-[#0c0716]/85 to-[#0c0716]/40" aria-hidden />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-24 sm:px-6 lg:grid-cols-2">
            <motion.div {...reveal}>
              <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-lime-300">Share cards</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                Flex on the <span className="italic text-pink-400">group chat</span>.
              </h2>
              <p className="mt-5 max-w-lg text-lg text-white/75">
                Every card has a share button that spits out a tidy, story-sized image. Post your vibe, your persona or your suspiciously niche
                popularity score, and let your friends draw their own conclusions.
              </p>
              <ul className="mt-8 space-y-3 text-white/85">
                {['One tap, one image, zero cropping', 'Looks great on stories and in DMs', 'Basically a personality test with a better soundtrack'].map(item => (
                  <li key={item} className="flex items-center gap-3">
                    <Share2 className="h-5 w-5 shrink-0 text-lime-300" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div {...reveal} className="relative mx-auto w-full max-w-sm">
              <div className="absolute inset-0 translate-x-6 translate-y-6 rotate-6 rounded-2xl border-2 border-black bg-pink-400" aria-hidden />
              <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-3 rounded-2xl border-2 border-black bg-lime-300" aria-hidden />
              <Screenshot shot={SHOTS.share} sizes="(min-width: 1024px) 30vw, 80vw" className="relative -rotate-2 border-2 border-black" />
              <Sticker className="absolute -left-6 top-10 bg-white" tilt={-10}>
                <Share2 className="h-4 w-4" /> post it!
              </Sticker>
            </motion.div>
          </div>
        </section>

        {/* Bento of extras */}
        <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
          <motion.div {...reveal}>
            <SectionHeading eyebrow="And then some" title={<>The <span className="italic text-lime-300">deep cuts</span>.</>}>
              Top artists, top tracks, fun stats and achievements, over the last four weeks, six months or all time.
            </SectionHeading>
          </motion.div>

          <div className="mt-14 grid gap-6 lg:grid-cols-6">
            <BentoCard className="lg:col-span-4" title="Top artists, ranked" blurb="Your heavy rotation, in glorious grid form." icon={Star} shot={SHOTS.topArtists} />
            <BentoCard className="lg:col-span-2" title="Achievements" blurb="Unlock badges like Genre Explorer. Music Marathon is... a journey." icon={Trophy} shot={SHOTS.achievements} />
            <BentoCard className="lg:col-span-4" title="Top tracks" blurb="The songs you swear you don't play that much." icon={Headphones} shot={SHOTS.topTracks} />
            <BentoCard className="lg:col-span-2" title="Fun stats" blurb="A story carousel of oddly specific facts, like how many hours you spent listening." icon={Sparkles} shot={SHOTS.funstats} />
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-5xl px-4 pb-28 sm:px-6">
          <motion.div {...reveal}>
            <SectionHeading eyebrow="FAQ" title="Questions nobody asked" />
          </motion.div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {FAQ.map(({ q, a }, i) => (
              <motion.div
                key={q}
                {...reveal}
                transition={{ ...reveal.transition, delay: i * 0.08 }}
                className={cn(
                  'rounded-2xl border-2 border-black p-6 text-black shadow-[5px_5px_0_0_#000]',
                  ['bg-lime-300 -rotate-1', 'bg-pink-300 rotate-1', 'bg-violet-300 rotate-1', 'bg-amber-200 -rotate-1'][i % 4],
                )}
              >
                <h3 className="font-display text-xl font-extrabold">{q}</h3>
                <p className="mt-2 text-black/75">{a}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 pb-24 sm:px-6">
          <motion.div {...reveal} className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border-2 border-black shadow-[8px_8px_0_0_#000]">
            <Image src="/home/art-spiral.webp" alt="" fill sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-violet-950/80 via-fuchsia-900/60 to-black/70" aria-hidden />
            <div className="relative flex flex-col items-center px-6 py-20 text-center sm:py-24">
              <Image src="/logo.png" alt="" width={88} height={88} className="animate-wobble h-20 w-20" style={{ '--tilt': '-8deg' } as React.CSSProperties} />
              <h2 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">What&apos;s your vibe?</h2>
              <p className="mt-4 max-w-xl text-lg text-white/85">There&apos;s only one way to find out, and it takes about ten seconds.</p>
              <div className="mt-9">
                <ConnectButton isConnecting={isConnecting} onClick={handleConnect} />
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-white/50 sm:flex-row sm:px-6">
          <p>Made with way too many replays. Not affiliated with Spotify.</p>
          <p>Screenshots show Sam Pling, a totally made-up listener.</p>
        </div>
      </footer>
    </div>
  );
}

function BentoCard({ title, blurb, icon: Icon, shot, className }: { title: string; blurb: string; icon: LucideIcon; shot: Shot; className?: string }) {
  return (
    <motion.div
      {...reveal}
      className={cn(
        'group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-white/25 hover:bg-white/[0.07]',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-white/10 p-2">
          <Icon className="h-5 w-5 text-lime-300" />
        </div>
        <div>
          <h3 className="font-display text-xl font-extrabold">{title}</h3>
          <p className="mt-1 text-white/65">{blurb}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-1 items-center">
        <Screenshot
          shot={shot}
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="w-full transition-transform duration-500 group-hover:-rotate-1 group-hover:scale-[1.02]"
        />
      </div>
    </motion.div>
  );
}
