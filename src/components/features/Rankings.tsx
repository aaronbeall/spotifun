'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, Users, TrendingUp, Star } from 'lucide-react';
import { UserRanking } from '@/types';

interface Rankings {
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
  };
}

export default function Rankings({ stats }: Rankings) {
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [userRank, setUserRank] = useState<UserRanking | null>(null);

  useEffect(() => {
    // Mock rankings data - in a real app, this would come from an API
    const generateMockRankings = (): { rankings: UserRanking[]; userRank: UserRanking } => {
      const mockUsers: UserRanking[] = [
        { id: 'user1', name: 'MusicMaster2024', score: 9500, rank: 1 },
        { id: 'user2', name: 'VinylCollector', score: 8900, rank: 2 },
        { id: 'user3', name: 'BeatHunter', score: 8200, rank: 3 },
        { id: 'user4', name: 'SoundExplorer', score: 7800, rank: 4 },
        { id: 'user5', name: 'MelodyMaker', score: 7200, rank: 5 },
        { id: 'user6', name: 'RhythmRider', score: 6800, rank: 6 },
        { id: 'user7', name: 'HarmonySeeker', score: 6400, rank: 7 },
        { id: 'user8', name: 'TuneTracker', score: 5900, rank: 8 },
        { id: 'user9', name: 'AudioAdventurer', score: 5400, rank: 9 },
        { id: 'user10', name: 'SongSurfer', score: 4900, rank: 10 },
      ];

      // Calculate user's score based on their stats
      const userScore = Math.round(
        stats.overview.totalPlays * 0.4 +
        stats.overview.uniqueArtists * 2 +
        stats.overview.uniqueTracks * 0.5 +
        stats.overview.genreDiversity * 1000
      );

      // Insert user into rankings
      const allUsers = [...mockUsers, { id: 'current_user', name: 'You', score: userScore, rank: 0 }];
      allUsers.sort((a, b) => b.score - a.score);

      // Update ranks
      allUsers.forEach((user, index) => {
        user.rank = index + 1;
      });

      const userRankData = allUsers.find(user => user.id === 'current_user')!;
      const topRankings = allUsers.slice(0, 10);

      return { rankings: topRankings, userRank: userRankData };
    };

    const { rankings, userRank } = generateMockRankings();
    setRankings(rankings);
    setUserRank(userRank);
  }, [stats]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-500" />;
    return <Trophy className="w-5 h-5 text-gray-400" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500 to-yellow-700 border-yellow-600';
    if (rank === 2) return 'from-gray-500 to-gray-700 border-gray-600';
    if (rank === 3) return 'from-orange-500 to-orange-700 border-orange-600';
    return 'from-gray-700 to-gray-900 border-gray-600';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Global Rankings</h2>
      </div>

      {/* User's Rank */}
      {userRank && (
        <div className={`bg-gradient-to-r ${getRankColor(userRank.rank)} rounded-xl p-6 text-white mb-8 border`}>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold drop-shadow-md">#{userRank.rank}</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{userRank.name}</h3>
              <p className="text-white/90">Your current ranking</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatNumber(userRank.score)}</div>
              <div className="text-sm text-white/80">points</div>
            </div>
          </div>
        </div>
      )}

      {/* Top Rankings */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Top 10 Music Lovers
        </h3>

        {rankings.map(user => (
          <div
            key={user.id}
            className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
              user.id === 'current_user'
                ? 'bg-green-900/30 border-2 border-green-700/50 hover:border-green-600/70'
                : 'bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50'
            }`}
          >
            {/* Rank */}
            <div className="flex items-center gap-2">
              {getRankIcon(user.rank)}
              <span className="text-lg font-bold text-gray-200">#{user.rank}</span>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${user.id === 'current_user' ? 'text-green-300' : 'text-white'}`}>
                  {user.name}
                </span>
                {user.id === 'current_user' && (
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    YOU
                  </span>
                )}
              </div>
            </div>

            {/* Score */}
            <div className="text-right">
              <div className="text-lg font-bold text-white">{formatNumber(user.score)}</div>
              <div className="text-xs text-gray-300">points</div>
            </div>
          </div>
        ))}
      </div>

      {/* Ranking Categories */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg p-4 text-center border border-blue-800/30">
          <Star className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-blue-400">Total Plays</div>
          <div className="text-sm text-gray-300">40% of score</div>
        </div>
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 text-center border border-purple-800/30">
          <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-purple-400">Artist Diversity</div>
          <div className="text-sm text-gray-300">30% of score</div>
        </div>
        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-4 text-center border border-green-800/30">
          <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-green-400">Genre Exploration</div>
          <div className="text-sm text-gray-300">30% of score</div>
        </div>
      </div>

      {/* Ranking Info */}
      <div className="mt-6 bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
        <h4 className="font-semibold text-white mb-2">How Rankings Work</h4>
        <p className="text-sm text-gray-300">
          Rankings are calculated based on your total plays, artist diversity, and genre exploration.
          The more diverse your listening habits and the more music you discover, the higher your score!
        </p>
      </div>
    </div>
  );
}