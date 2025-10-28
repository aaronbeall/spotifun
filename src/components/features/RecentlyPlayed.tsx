import { Headphones, Users, Music, Clock, Sparkles, Palette, Disc, Disc3, Disc2 } from 'lucide-react';
import { Stats } from '@/types';
import { formatNumber, formatDuration, getGenreColorClass } from "@/utils";

const GradientCard = ({
  icon: Icon,
  title,
  value,
  description,
  gradient,
  iconBg,
  iconColor = 'white',
  children
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | React.ReactNode;
  description: string;
  gradient: string;
  iconBg: string;
  iconColor?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 h-full ${gradient} shadow-lg`}>
      <div className="absolute top-4 right-4 w-16 h-16 rounded-full opacity-10 bg-white"></div>
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">{title}</p>
              <p className="text-2xl font-bold text-white mt-1">
                {value}
              </p>
            </div>
          </div>
        </div>
        <p className="text-sm text-white/80 mt-4">{description}</p>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
};

const ProgressStat = ({
  label,
  value,
  color
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div className="mt-4">
    <div className="flex justify-between text-xs text-white/80 mb-1">
      <span>{label}</span>
      <span className="font-medium">{Math.round(value * 100)}%</span>
    </div>
    <div className="w-full bg-white/20 rounded-full h-1.5">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${value * 100}%` }}
      />
    </div>
  </div>
);

const GenrePill = ({ genre, count }: { genre: string; count: number }) => {
  const gradientClass = `bg-gradient-to-r ${getGenreColorClass(genre, 'gradient')}`;

  return (
    <span
      className={`px-3 py-1.5 text-xs font-medium text-white rounded-full ${gradientClass}`}
    >
      {genre} • {count}
    </span>
  );
};

interface RecentlyPlayedProps {
  stats: Stats;
  isLoadingTimeRange: boolean;
}

export default function RecentlyPlayed({ stats, isLoadingTimeRange }: RecentlyPlayedProps) {
  // Calculate average plays per day (assuming 30 days for the time range)
  const avgPlaysPerDay = Math.round(stats.overview.totalPlays / 30);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700/50 overflow-hidden">
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-pink-500/10 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-blue-500/10 rounded-full filter blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
                  <Disc3 className="w-6 h-6 text-pink-400" />
                  Current Vibes
                </h2>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <span className="px-2.5 py-1 bg-white/5 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                    <span className="font-medium text-white">{stats.overview.totalPlays}</span> plays
                  </span>
                  <span className="px-2.5 py-1 bg-white/5 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span className="font-medium text-white">{formatDuration(stats.overview.totalDuration)}</span>
                  </span>
                </div>
              </div>
              <div className="text-sm font-medium text-white/90 flex items-center gap-2">
                <div className="px-3 py-1.5 bg-white/5 rounded-full backdrop-blur-sm">
                  <span className="bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent font-semibold">
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${isLoadingTimeRange ? 'opacity-50' : ''}`}>
          {/* Artist Card */}
          <GradientCard
            icon={Users}
            title="Artist Diversity"
            value={`${stats.overview.uniqueArtists} Artists`}
            description={`${avgPlaysPerDay} plays per day`}
            gradient="bg-gradient-to-br from-purple-900/80 to-indigo-900/80"
            iconBg="bg-purple-500/20"
          >
            <div className="space-y-3">
              <ProgressStat
                label="Variety Score"
                value={stats.overview.artistDiversity}
                color="bg-gradient-to-r from-pink-500 to-purple-500"
              />
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-white/80">Most Played</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stats.artists
                    .sort((a, b) => b.playCount - a.playCount)
                    .slice(0, 2)
                    .map((artist, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 text-xs font-medium text-white rounded-full bg-white/10 backdrop-blur-sm"
                      >
                        {artist.artist.name} • {artist.playCount}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </GradientCard>

          {/* Track Variety Card */}
          <GradientCard
            icon={Music}
            title="Track Variety"
            value={`${stats.overview.uniqueTracks} Tracks`}
            description={`${Math.round((stats.overview.uniqueTracks / stats.overview.totalPlays) * 100)}% unique`}
            gradient="bg-gradient-to-br from-amber-900/80 to-pink-900/80"
            iconBg="bg-amber-500/20"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-xs text-white/80">High variety of tracks</span>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-white/80">Most Played</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stats.tracks
                    .sort((a, b) => b.playCount - a.playCount)
                    .slice(0, 2)
                    .map((track, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white rounded-full bg-white/10 backdrop-blur-sm max-w-[140px]"
                        title={`${track.track.name} • ${track.playCount} plays`}
                      >
                        <span className="truncate">{track.track.name.split(' (')[0]}</span>
                        <span>•</span>
                        <span className="flex-shrink-0">{track.playCount}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </GradientCard>

          {/* Genre Exploration Card */}
          <GradientCard
            icon={Palette}
            title="Genre Exploration"
            value={`${stats.genres.length} Genres`}
            description={`${Math.round(stats.overview.genreDiversity * 100)}% Diversity`}
            gradient="bg-gradient-to-br from-blue-900/80 to-cyan-900/80"
            iconBg="bg-blue-500/20"
          >
            <div className="mt-3 space-y-4">
              <div className="mb-3">
                <ProgressStat
                  label="Diversity Score"
                  value={stats.overview.genreDiversity}
                  color="bg-gradient-to-r from-cyan-400 to-blue-500"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-white/80">Top Genres</span>
                  <span className="text-xs text-white/60">{stats.topGenres.length} total</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stats.topGenres.slice(0, 4).map((genre, index) => (
                    <GenrePill
                      key={index}
                      genre={genre.genre}
                      count={genre.count}
                    />
                  ))}
                </div>
              </div>
            </div>
          </GradientCard>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="flex items-center justify-between text-sm text-white/60">
            <div className="flex items-center gap-2">
              <Disc className="w-4 h-4 text-pink-400" />
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Powered by Spotify</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
