'use client';

import { useState, useEffect } from 'react';
import { Music, Clock, TrendingUp, Heart, Zap, Star, Target, Award } from 'lucide-react';

interface FunStatsProps {
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

export default function FunStats({ stats }: FunStatsProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

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

  const funStatsCards = [
    {
      icon: <Music className="w-8 h-8" />,
      title: "Total Music Time",
      value: formatDuration(stats.overview.totalDuration),
      description: "You've spent this much time listening to music!",
      color: "from-blue-500 to-purple-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Your Music Personality",
      value: calculateListeningPersonality(),
      description: "Based on your listening habits",
      color: "from-pink-500 to-red-600",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Total Plays",
      value: formatNumber(stats.overview.totalPlays),
      description: "Songs you've played",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Artist Discovery",
      value: formatNumber(stats.overview.uniqueArtists),
      description: "Different artists you've explored",
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Genre Diversity",
      value: `${Math.round(stats.overview.genreDiversity * 100)}%`,
      description: "How diverse your music taste is",
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Average Session",
      value: `${Math.round(stats.overview.averageSessionLength)} min`,
      description: "Your typical listening session length",
      color: "from-indigo-500 to-blue-600",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600"
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % funStatsCards.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [funStatsCards.length]);

  const currentCardData = funStatsCards[currentCard];

  return (
    <div className="bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Award className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">Your Music Story</h2>
      </div>

      <div className="relative">
        <div
          className={`transition-all duration-1000 ease-in-out ${
            isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
          }`}
        >
          <div className="bg-gray-700/50 rounded-xl p-6 mb-4 border border-gray-600">
            <div className="flex items-center gap-4">
              <div className="bg-gray-800 p-3 rounded-full border border-gray-600 shadow-sm">
                <div className={currentCardData.iconColor.replace('text-', 'text-').replace('600', '400')}>
                  {currentCardData.icon}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {currentCardData.title}
                </h3>
                <p className="text-sm text-gray-300">
                  {currentCardData.description}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className={`text-4xl font-bold bg-gradient-to-r ${currentCardData.color} bg-clip-text text-transparent`}>
                {currentCardData.value}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {funStatsCards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCard(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentCard ? 'bg-white w-8' : 'bg-gray-600 dark:bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Fun facts */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-green-400" />
            <span className="font-semibold text-white">Top Genre</span>
          </div>
          <p className="text-gray-200 capitalize">
            {stats.genres[0]?.genre || 'Unknown'} - {formatNumber(stats.genres[0]?.playCount || 0)} plays
          </p>
        </div>

        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-white">Discovery Rate</span>
          </div>
          <p className="text-gray-200">
            {Math.round(stats.overview.artistDiversity * 100)}% new artists per play
          </p>
        </div>
      </div>
    </div>
  );
}

