import React, { useMemo } from "react";
import { Star, Gem, Share2 } from 'lucide-react';
import { analyzePopularity, getPopularityExtremes } from '@/utils/popularity';
import { ImageBadge } from "../ImageBadge";
import { PopularityHistogram } from './PopularityHistogram';

interface PopularityCardProps {
  tracks: SpotifyApi.TrackObjectFull[];
  onShare?: () => void;
}

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

      {/* Histogram Chart with Tooltip and Badges */}
      <div className="w-full flex justify-center">
        <div className="flex items-center">
          {/* Most Niche Badge (left, matches "Niche" side of scale) */}
          <div className="shrink-0">
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
          </div>
          {/* Histogram Chart */}
          <div className="grow px-0 mx-8 flex flex-col items-center">
            <PopularityHistogram tracks={tracks} large />
            <div className="flex justify-between w-full mt-2 text-xs text-white/60" style={{ maxWidth: 400 }}>
              <span className="text-left">Niche</span>
              <span className="text-right">Popular</span>
            </div>
          </div>
          {/* Most Popular Badge (right, matches "Popular" side of scale) */}
          <div className="shrink-0 flex flex-col items-center">
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
          </div>
        </div>
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
