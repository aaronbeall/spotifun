'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Music, Clock, TrendingUp, Heart, Zap, Star, Target, Award, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';
import { Stats } from "@/types";

interface FunStatsProps {
  stats: Stats;
}

interface StoryCard {
  icon: LucideIcon;
  title: string;
  value: string;
  description: string;
  gradient: string;
}

export default function FunStats({ stats }: FunStatsProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} days`;
    if (hours > 0) return `${hours} hours`;
    return `${minutes} minutes`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const calculateListeningPersonality = () => {
    const { genreDiversity, artistDiversity } = stats.overview;

    if (genreDiversity > 0.7 && artistDiversity > 0.6) {
      return 'Music Explorer';
    } else if (artistDiversity < 0.4) {
      return 'Loyal Listener';
    } else if (genreDiversity > 0.8) {
      return 'Genre Hopper';
    } else {
      return 'Balanced Listener';
    }
  };

  const cards: StoryCard[] = [
    {
      icon: Music,
      title: "Total Music Time",
      value: formatDuration(stats.overview.totalDuration),
      description: "You've spent this much time listening to music!",
      gradient: "from-indigo-500 via-blue-500 to-sky-400",
    },
    {
      icon: Heart,
      title: "Your Music Personality",
      value: calculateListeningPersonality(),
      description: "Based on your listening habits",
      gradient: "from-fuchsia-500 via-pink-500 to-rose-400",
    },
    {
      icon: TrendingUp,
      title: "Total Plays",
      value: formatNumber(stats.overview.totalPlays),
      description: "Songs you've played",
      gradient: "from-emerald-500 via-green-500 to-lime-400",
    },
    {
      icon: Star,
      title: "Artist Discovery",
      value: formatNumber(stats.overview.uniqueArtists),
      description: "Different artists you've explored",
      gradient: "from-amber-500 via-orange-500 to-yellow-400",
    },
    {
      icon: Zap,
      title: "Genre Diversity",
      value: `${Math.round(stats.overview.genreDiversity * 100)}%`,
      description: "How diverse your music taste is",
      gradient: "from-violet-500 via-purple-500 to-indigo-400",
    },
    {
      icon: Clock,
      title: "Average Session",
      value: `${Math.round(stats.overview.averageSessionLength)} min`,
      description: "Your typical listening session length",
      gradient: "from-cyan-500 via-sky-500 to-blue-400",
    },
  ];

  const goTo = (idx: number) => setCurrent((idx + cards.length) % cards.length);
  const active = cards[current];
  const ActiveIcon = active.icon;

  return (
    <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-700 animate-fade-in">
      <div className="flex items-center gap-2 mb-4 px-1">
        <Award className="w-5 h-5 text-yellow-400" />
        <h2 className="text-lg font-bold text-white">Your Music Story</h2>
      </div>

      {/* Story progress segments */}
      <div className="flex gap-1.5 px-1 mb-3">
        {cards.map((card, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Go to ${card.title}`}
            aria-current={idx === current ? 'step' : undefined}
            className="flex-1 h-1 rounded-full bg-white/15 overflow-hidden focus:outline-none focus-visible:ring-1 focus-visible:ring-white/60"
          >
            {idx === current && !reduceMotion ? (
              <div
                key={current}
                onAnimationEnd={() => goTo(current + 1)}
                className="h-full bg-white rounded-full animate-progress-fill"
                style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
              />
            ) : idx <= current ? (
              <div className="h-full w-full bg-white rounded-full" />
            ) : null}
          </button>
        ))}
      </div>

      {/* Story slide */}
      <div
        className="relative rounded-2xl group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`relative overflow-hidden bg-gradient-to-br ${active.gradient} rounded-2xl p-6 sm:p-8 min-h-[220px] flex flex-col justify-center`}
          >
            <ActiveIcon
              className="absolute -right-6 -bottom-6 w-44 h-44 text-white/10 rotate-[-12deg] pointer-events-none"
              strokeWidth={1.5}
            />

            <span className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">
              {active.title}
            </span>
            <div className="text-4xl sm:text-6xl font-black italic tracking-tight text-white mb-3 drop-shadow-sm break-words">
              {active.value}
            </div>
            <p className="text-sm text-white/80 max-w-xs">{active.description}</p>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => goTo(current - 1)}
          aria-label="Previous stat"
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 hover:bg-black/40 transition-opacity focus:opacity-100 focus:outline-none"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => goTo(current + 1)}
          aria-label="Next stat"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 hover:bg-black/40 transition-opacity focus:opacity-100 focus:outline-none"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Fun facts */}
      <div className="mt-4 flex flex-wrap gap-2 px-1">
        <div className="flex items-center gap-2 bg-gray-700/40 border border-gray-600/50 rounded-full px-3 py-1.5 text-xs text-gray-200">
          <Target className="w-3.5 h-3.5 text-green-400 shrink-0" />
          <span className="capitalize">{stats.genres[0]?.genre || 'Unknown'}</span>
          <span className="text-gray-400">· {formatNumber(stats.genres[0]?.playCount || 0)} plays</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-700/40 border border-gray-600/50 rounded-full px-3 py-1.5 text-xs text-gray-200">
          <TrendingUp className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>{Math.round(stats.overview.artistDiversity * 100)}% new artists per play</span>
        </div>
      </div>
    </div>
  );
}
