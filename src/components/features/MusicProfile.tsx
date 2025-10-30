import { Headphones, Users, Music, Clock, Sparkles, Palette, Disc, Disc3, Disc2, TrendingUp, Star } from 'lucide-react';
import { Stats } from '@/types';
import { formatNumber, formatDuration, getGenreColorClass } from "@/utils";
import { analyzePopularity } from "@/utils/popularity";
import { MusicVibes } from "./MusicVibes";
import { StatCard } from './StatCard';


interface MusicProfileProps {
  stats: Stats;
  isLoadingTimeRange: boolean;
  playLimit: number;
  onPlayLimitChange: (limit: number) => void;
}

export default function MusicProfile({ stats, isLoadingTimeRange, playLimit, onPlayLimitChange }: MusicProfileProps) {
  // Calculate average plays per day (assuming 30 days for the time range)
  const avgPlaysPerDay = Math.round(stats.overview.totalPlays / 30);

  const popularity = analyzePopularity(stats.tracks.map(track => track.track));

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
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <h2 className="px-2 py-1 bg-white/5 rounded-md text-xs text-white/60 border border-white/10 w-fit">
                    Recently Played
                  </h2>
                  <div className="flex items-center gap-2">
                    {[50, 25, 10, 5].map((limit) => (
                      <button
                        key={limit}
                        onClick={() => onPlayLimitChange(limit)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          playLimit === limit
                            ? 'bg-pink-500 text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                        disabled={isLoadingTimeRange}
                      >
                        {limit}
                      </button>
                    ))}
                    <span className="px-2.5 py-1 bg-white/5 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                      <span className="font-medium text-white">{stats.overview.totalPlays}</span> plays
                    </span>
                  </div>
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

        {/* Music Vibe Banner */}
        {stats.genres?.length > 0 && (
          <div className="mb-6">
            <MusicVibes 
              genreStats={stats.genres}
              topArtist={stats.artists.length > 0 ? {
                name: stats.artists[0].artist.name,
                image: stats.artists[0].artist.images?.[0]?.url,
                percentage: Math.round((stats.artists[0].playCount / stats.overview.totalPlays) * 100),
                count: stats.artists[0].playCount
              } : undefined}
              topGenre={stats.genres.length > 0 ? {
                name: stats.genres[0].genre,
                percentage: Math.round((stats.genres[0].playCount / stats.overview.totalPlays) * 100),
                count: stats.genres[0].playCount,
                image: (() => {
                  // First find an artist that has this genre
                  const genreArtist = stats.artists.find(a => 
                    a.artist.genres?.includes(stats.genres[0].genre)
                  );
                  
                  if (!genreArtist) return undefined;
                  
                  // Then find a track by this artist
                  const track = stats.tracks.find(t => 
                    t.track.album?.images?.[0]?.url &&
                    t.track.artists.some(a => a.id === genreArtist.artist.id)
                  );
                  
                  return track?.track.album.images[0]?.url;
                })()
              } : undefined}
            />
          </div>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${isLoadingTimeRange ? 'opacity-50' : ''}`}>

          {/* Artist Card */}
          <StatCard
            icon={Users}
            title="Artists"
            value={stats.overview.uniqueArtists}
            description={`${avgPlaysPerDay} plays per day`}
            gradient="bg-gradient-to-br from-purple-900/80 to-indigo-900/80"
            iconColor="#a78bfa"
            items={stats.artists
              .sort((a, b) => b.playCount - a.playCount)
              .map(artist => ({
                name: artist.artist.name,
                count: artist.playCount,
                image: artist.artist.images?.[0]?.url
              }))}
            score={stats.overview.artistDiversity}
            scoreLabel="Diversity"
            mostPlayed={stats.artists
              .sort((a, b) => b.playCount - a.playCount)
              .map(artist => ({
                name: artist.artist.name,
                count: artist.playCount
              }))}
          />

          {/* Track Card */}
          <StatCard
            icon={Music}
            title="Tracks"
            value={stats.overview.uniqueTracks}
            description={`${Math.round((stats.overview.uniqueTracks / stats.overview.totalPlays) * 100)}% unique`}
            gradient="bg-gradient-to-br from-amber-900/80 to-pink-900/80"
            iconColor="#f59e0b"
            items={stats.tracks
              .sort((a, b) => b.playCount - a.playCount)
              .map(track => ({
                name: track.track.name,
                count: track.playCount,
                image: track.track.album?.images?.[0]?.url
              }))}
            score={stats.overview.uniqueTracks / stats.overview.totalPlays}
            scoreLabel="Uniqueness"
            mostPlayed={stats.tracks
              .sort((a, b) => b.playCount - a.playCount)
              .map(track => ({
                name: track.track.name,
                count: track.playCount
              }))}
          />

          {/* Genre Card */}
          <StatCard
            icon={Palette}
            title="Genres"
            value={stats.overview.uniqueGenres}
            description={`${Math.round(stats.overview.genreDiversity * 100)}% diverse`}
            gradient="bg-gradient-to-br from-blue-900/80 to-cyan-900/80"
            iconColor="#60a5fa"
            items={stats.genres
              .map((genre, i) => {
                const gradientClass = getGenreColorClass(genre.genre, "gradient");
                const textClass = 'text-white font-semibold';
                return {
                  name: genre.genre,
                  count: genre.playCount,
                  bgClass: `bg-gradient-to-r ${gradientClass}`,
                  textClass: textClass
                };
              })}
            score={stats.overview.genreDiversity}
            scoreLabel="Diversity"
            mostPlayed={stats.genres
              .map(genre => ({
                name: genre.genre,
                count: genre.playCount
              }))}
          />

          {/* Popularity Card */}
          <StatCard
            icon={TrendingUp}
            title="Popularity"
            value={`${popularity.range[0]}-${popularity.range[1]}`}
            description={`Average ${stats.overview.averagePopularity}%`}
            gradient="bg-gradient-to-br from-emerald-900/80 to-teal-900/80"
            iconColor="#34d399"
            score={stats.overview.averagePopularity / 100}
            scoreLabel="Average Popularity"
            badge={{
              label: popularity.label,
              description: popularity.description,
              score: popularity.diversityScore
            }}
            mostPlayed={stats.tracks
              .map(track => track.track)
              .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
              .map(track => ({
                name: track.name,
                count: track.popularity || 0,
                label: `${track.popularity}%`
              }))}
          />
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
