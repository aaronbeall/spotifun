import React, { useMemo } from "react";
import { motion } from 'framer-motion';
import { Star, Gem, Share2 } from 'lucide-react';
import { analyzePopularity, getPopularityExtremes } from '@/utils/popularity';
import { ImageBadge } from "../ImageBadge";
import { PopularityHistogram } from './PopularityHistogram';
import { SIGNATURE_EASE } from '@/utils/easing';

interface PopularityCardProps {
  tracks: SpotifyApi.TrackObjectFull[];
  onShare?: () => void;
}

// Matches the flanking top-artist/top-genre badge delays on the Vibes card
// (MusicVibes.tsx), so both cards' flanking elements reveal in sync.
const BADGES_BASE_DELAY = 0.15;
const BADGES_STAGGER = 0.15;

export const PopularityCard: React.FC<PopularityCardProps> = ({ tracks, onShare }) => {
  const analysis = useMemo(() => analyzePopularity(tracks), [tracks]);

  if (!tracks?.length) return null;

  // Calculate average popularity
  const avgPopularity = Math.round(tracks.reduce((sum, t) => sum + (t.popularity || 0), 0) / tracks.length);

  // Extract most and least popular tracks
  const { mostPopularTrack, leastPopularTrack, mostPopularCount, leastPopularCount } = getPopularityExtremes(tracks);

  return (
  <div className="bg-linear-to-br from-gray-900 to-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border border-white/5 shadow-2xl overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Track Popularity</h2>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Track popularity distribution and rating
          </p>
        </div>
        {onShare && (
          <button
            onClick={onShare}
            aria-label="Share"
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white transition-colors shrink-0 self-start"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Histogram Chart with Tooltip and Badges — a 1fr/auto/1fr grid keeps
          the histogram exactly centered no matter how the flanking badges'
          text truncates (both 1fr tracks are always equal width, regardless
          of content), while still letting each badge column flex to use
          whatever space is actually available (grid items get min-width: 0
          for free, so text truncation "just works" without extra hacks). On
          md+, the badges sit toward the inner edge of their track (snug
          against the chart, not floating mid-track) via justify-self.
          Below md, the 3-column row has no room to breathe (the chart alone
          is 400px), so it becomes a 2-column grid: the chart spans both
          columns on its own row, and the two badges sit side by side in the
          row below it. */}
      <div className="w-full grid grid-cols-2 md:grid-cols-[1fr_auto_1fr] items-center justify-items-center gap-6 md:gap-8">
        {/* Most Niche Badge (left, matches "Niche" side of scale) */}
        <motion.div
          className="flex flex-col items-center order-2 md:order-1 md:justify-self-end"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: SIGNATURE_EASE, delay: BADGES_BASE_DELAY }}
        >
          <ImageBadge
            title="Most Niche"
            name={leastPopularTrack.name}
            subtitle={leastPopularTrack.artists?.[0]?.name}
            image={leastPopularTrack.album?.images?.[0]?.url}
            count={leastPopularCount}
            color="#818cf8"
            icon={Gem}
            className="scale-90"
            percent={Math.round(leastPopularTrack.popularity || 0)}
          />
        </motion.div>
        {/* Histogram Chart */}
        <div className="flex flex-col items-center px-4 order-1 md:order-2 col-span-2 md:col-span-1 w-full md:w-auto">
          <PopularityHistogram tracks={tracks} large />
          <div className="flex justify-between w-full mt-2 text-xs text-white/60" style={{ maxWidth: 400 }}>
            <span className="text-left">Niche</span>
            <span className="text-right">Popular</span>
          </div>
        </div>
        {/* Most Popular Badge (right, matches "Popular" side of scale) */}
        <motion.div
          className="flex flex-col items-center order-3 md:justify-self-start"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: SIGNATURE_EASE, delay: BADGES_BASE_DELAY + BADGES_STAGGER }}
        >
          <ImageBadge
            title="Most Popular"
            name={mostPopularTrack.name}
            subtitle={mostPopularTrack.artists?.[0]?.name}
            image={mostPopularTrack.album?.images?.[0]?.url}
            count={mostPopularCount}
            color="#f472b6"
            icon={Star}
            className="scale-90"
            percent={Math.round(mostPopularTrack.popularity || 0)}
          />
        </motion.div>
      </div>

      {/* Headline stat, migrated from the old top-right badge */}
      <div className="text-center mt-8">
        <div className="text-4xl sm:text-5xl font-black text-yellow-400">
          {analysis.label}
        </div>
        <div className="text-lg font-bold text-white/80 mt-1">{avgPopularity}% average</div>
        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">{analysis.description}</p>
      </div>
    </div>
  );
};
