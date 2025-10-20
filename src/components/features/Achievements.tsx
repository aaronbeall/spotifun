'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Music, Clock, Target, Zap, Heart, Award, Lock, CheckCircle } from 'lucide-react';

interface AchievementsProps {
  stats: {
    overview: {
      totalPlays: number;
      uniqueArtists: number;
      uniqueTracks: number;
      totalDuration: number;
      averageSessionLength: number;
      genreDiversity: number;
      artistDiversity: number;
    };
    genres: Array<{
      genre: string;
      playCount: number;
    }>;
  };
}

export default function Achievements({ stats }: AchievementsProps) {
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    const generateAchievements = () => {
      const { totalPlays, uniqueArtists, uniqueTracks, totalDuration, genreDiversity } = stats.overview;
      
      const allAchievements = [
        {
          id: 'first_track',
          title: 'First Steps',
          description: 'Played your first track',
          icon: <Music className="w-6 h-6" />,
          unlocked: totalPlays >= 1,
          progress: Math.min(totalPlays, 1),
          maxProgress: 1,
          color: 'from-green-500 to-emerald-600'
        },
        {
          id: 'hundred_plays',
          title: 'Century Club',
          description: 'Reached 100 total plays',
          icon: <Trophy className="w-6 h-6" />,
          unlocked: totalPlays >= 100,
          progress: Math.min(totalPlays, 100),
          maxProgress: 100,
          color: 'from-blue-500 to-cyan-600'
        },
        {
          id: 'thousand_plays',
          title: 'Millennium',
          description: 'Reached 1,000 total plays',
          icon: <Star className="w-6 h-6" />,
          unlocked: totalPlays >= 1000,
          progress: Math.min(totalPlays, 1000),
          maxProgress: 1000,
          color: 'from-purple-500 to-indigo-600'
        },
        {
          id: 'ten_thousand_plays',
          title: 'Music Marathon',
          description: 'Reached 10,000 total plays',
          icon: <Award className="w-6 h-6" />,
          unlocked: totalPlays >= 10000,
          progress: Math.min(totalPlays, 10000),
          maxProgress: 10000,
          color: 'from-yellow-500 to-orange-600'
        },
        {
          id: 'genre_explorer',
          title: 'Genre Explorer',
          description: 'Listened to 10 different genres',
          icon: <Zap className="w-6 h-6" />,
          unlocked: stats.genres.length >= 10,
          progress: Math.min(stats.genres.length, 10),
          maxProgress: 10,
          color: 'from-pink-500 to-rose-600'
        },
        {
          id: 'artist_collector',
          title: 'Artist Collector',
          description: 'Listened to 50 different artists',
          icon: <Heart className="w-6 h-6" />,
          unlocked: uniqueArtists >= 50,
          progress: Math.min(uniqueArtists, 50),
          maxProgress: 50,
          color: 'from-red-500 to-pink-600'
        },
        {
          id: 'music_master',
          title: 'Music Master',
          description: 'Listened to 500 different tracks',
          icon: <Target className="w-6 h-6" />,
          unlocked: uniqueTracks >= 500,
          progress: Math.min(uniqueTracks, 500),
          maxProgress: 500,
          color: 'from-indigo-500 to-purple-600'
        },
        {
          id: 'time_traveler',
          title: 'Time Traveler',
          description: 'Listened for 100+ hours total',
          icon: <Clock className="w-6 h-6" />,
          unlocked: totalDuration >= 100 * 60 * 60 * 1000, // 100 hours in ms
          progress: Math.min(totalDuration, 100 * 60 * 60 * 1000),
          maxProgress: 100 * 60 * 60 * 1000,
          color: 'from-teal-500 to-cyan-600'
        }
      ];

      return allAchievements;
    };

    setAchievements(generateAchievements());
  }, [stats]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
        <div className="ml-auto bg-gray-100 rounded-full px-3 py-1">
          <span className="text-sm font-medium text-gray-700">
            {unlockedCount}/{totalCount}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span>{Math.round((unlockedCount / totalCount) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`relative rounded-xl p-6 transition-all duration-300 ${
              achievement.unlocked 
                ? 'bg-gradient-to-r ' + achievement.color + ' text-white shadow-lg' 
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {/* Lock/Check Icon */}
            <div className="absolute top-4 right-4">
              {achievement.unlocked ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <Lock className="w-5 h-5 text-gray-400" />
              )}
            </div>

            {/* Achievement Icon */}
            <div className={`mb-4 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
              {achievement.icon}
            </div>

            {/* Achievement Details */}
            <h3 className={`text-lg font-bold mb-2 ${achievement.unlocked ? 'text-white' : 'text-gray-700'}`}>
              {achievement.title}
            </h3>
            <p className={`text-sm mb-4 ${achievement.unlocked ? 'text-white/90' : 'text-gray-500'}`}>
              {achievement.description}
            </p>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className={achievement.unlocked ? 'text-white/80' : 'text-gray-500'}>
                  Progress
                </span>
                <span className={achievement.unlocked ? 'text-white/80' : 'text-gray-500'}>
                  {achievement.id === 'time_traveler' 
                    ? `${Math.round(achievement.progress / (60 * 60 * 1000))}h / ${Math.round(achievement.maxProgress / (60 * 60 * 1000))}h`
                    : `${achievement.progress} / ${achievement.maxProgress}`
                  }
                </span>
              </div>
              <div className={`w-full rounded-full h-2 ${
                achievement.unlocked ? 'bg-white/20' : 'bg-gray-300'
              }`}>
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    achievement.unlocked ? 'bg-white' : 'bg-gray-500'
                  }`}
                  style={{ 
                    width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>

            {/* Unlocked Badge */}
            {achievement.unlocked && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                UNLOCKED!
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Achievement Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{unlockedCount}</div>
          <div className="text-sm text-gray-600">Achievements Unlocked</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalCount - unlockedCount}</div>
          <div className="text-sm text-gray-600">Still Locked</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{Math.round((unlockedCount / totalCount) * 100)}%</div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </div>
      </div>
    </div>
  );
}

