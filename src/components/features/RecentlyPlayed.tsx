import { Headphones, Users, Music, Clock } from 'lucide-react';
import { Stats } from '@/types';
import { formatNumber, formatDuration } from "@/utils";

interface RecentlyPlayedProps {
  stats: Stats;
  isLoadingTimeRange: boolean;
}

export default function RecentlyPlayed({ stats, isLoadingTimeRange }: RecentlyPlayedProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-8">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Headphones className="w-5 h-5 text-blue-400" />
        Recently Played
      </h2>
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4 ${isLoadingTimeRange ? 'opacity-50' : ''}`}>
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 group relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Headphones className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Plays</p>
              <p className="text-2xl font-bold text-white">{formatNumber(stats.overview.totalPlays)}</p>
            </div>
          </div>
          <div className="absolute top-2 right-2 text-gray-500 group-hover:text-gray-300 transition-colors" title="Total number of tracks you've played recently">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 group relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Unique Artists</p>
              <p className="text-2xl font-bold text-white">{formatNumber(stats.overview.uniqueArtists)}</p>
            </div>
          </div>
          <div className="absolute top-2 right-2 text-gray-500 group-hover:text-gray-300 transition-colors" title="Number of unique artists in your recently played tracks">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 group relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Unique Tracks</p>
              <p className="text-2xl font-bold text-white">{formatNumber(stats.overview.uniqueTracks)}</p>
            </div>
          </div>
          <div className="absolute top-2 right-2 text-gray-500 group-hover:text-gray-300 transition-colors" title="Number of unique tracks in your recently played history">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 group relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Listening Time</p>
              <p className="text-2xl font-bold text-white">{formatDuration(stats.overview.totalDuration)}</p>
            </div>
          </div>
          <div className="absolute top-2 right-2 text-gray-500 group-hover:text-gray-300 transition-colors" title="Total time spent listening to recently played tracks">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
