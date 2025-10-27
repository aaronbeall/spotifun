'use client';

import { useState, useEffect } from 'react';
import { Music, Palette, Clock, TrendingUp, Heart, Zap, Star, Target } from 'lucide-react';
import { MusicProfileStats } from '@/types';

interface MusicProfileProps {
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

export default function MusicProfile({ stats }: MusicProfileProps) {
  const [profile, setProfile] = useState<MusicProfileStats | null>(null);

  useEffect(() => {
    const generateProfile = (): MusicProfileStats => {
      const { genreDiversity, artistDiversity, averageSessionLength } = stats.overview;

      // Calculate listening personality
      let personality = 'Balanced Listener';
      let personalityDescription = 'You have a well-rounded music taste.';
      let personalityColor = 'from-blue-500 to-purple-600';

      if (genreDiversity > 0.7 && artistDiversity > 0.6) {
        personality = 'Music Explorer';
        personalityDescription = 'You love discovering new sounds and genres.';
        personalityColor = 'from-green-500 to-teal-600';
      } else if (artistDiversity < 0.4) {
        personality = 'Loyal Listener';
        personalityDescription = 'You have deep connections with your favorite artists.';
        personalityColor = 'from-red-500 to-pink-600';
      } else if (genreDiversity > 0.8) {
        personality = 'Genre Hopper';
        personalityDescription = 'You enjoy jumping between different musical styles.';
        personalityColor = 'from-purple-500 to-indigo-600';
      }

      // Calculate mood based on genres
      const topGenres = stats.genres.slice(0, 3).map(g => g.genre.toLowerCase());
      let mood = 'Energetic';
      let moodColor = 'from-yellow-500 to-orange-600';

      if (topGenres.some(g => g.includes('chill') || g.includes('ambient') || g.includes('lo-fi'))) {
        mood = 'Chill';
        moodColor = 'from-blue-500 to-cyan-600';
      } else if (topGenres.some(g => g.includes('rock') || g.includes('metal') || g.includes('punk'))) {
        mood = 'Intense';
        moodColor = 'from-red-500 to-orange-600';
      } else if (topGenres.some(g => g.includes('pop') || g.includes('dance') || g.includes('electronic'))) {
        mood = 'Upbeat';
        moodColor = 'from-pink-500 to-purple-600';
      }

      // Calculate peak hours (mock data for now)
      const peakHours = [14, 20, 22]; // 2 PM, 8 PM, 10 PM

      return {
        personality: {
          name: personality,
          description: personalityDescription,
          color: personalityColor,
          score: Math.round((genreDiversity + artistDiversity) * 50)
        },
        mood: {
          name: mood,
          color: moodColor,
          score: Math.round(Math.random() * 100)
        },
        discoveryScore: Math.round(artistDiversity * 100),
        consistencyScore: Math.round((1 - artistDiversity) * 100),
        peakHours,
        averageSessionLength: Math.round(averageSessionLength),
        primaryGenres: stats.genres.slice(0, 5).map(g => g.genre)
      };
    };

    setProfile(generateProfile());
  }, [stats]);

  if (!profile) return null;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Palette className="w-6 h-6 text-purple-500" />
        <h2 className="text-2xl font-bold text-gray-900">Your Music Profile</h2>
      </div>

      {/* Personality Card */}
      <div className={`bg-gradient-to-r ${profile.personality.color} rounded-xl p-6 text-white mb-6`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{profile.personality.name}</h3>
            <p className="text-white/90">{profile.personality.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Personality Score:</span>
          <div className="flex-1 bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-1000"
              style={{ width: `${profile.personality.score}%` }}
            />
          </div>
          <span className="text-sm font-semibold">{profile.personality.score}/100</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Mood */}
        <div className={`bg-gradient-to-r ${profile.mood.color} rounded-xl p-6 text-white`}>
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">Current Mood</span>
          </div>
          <div className="text-2xl font-bold mb-1">{profile.mood.name}</div>
          <div className="text-sm text-white/80">Based on your recent listening</div>
        </div>

        {/* Peak Hours */}
        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Peak Hours</span>
          </div>
          <div className="text-2xl font-bold mb-1">
            {profile.peakHours.map(hour => `${hour}:00`).join(', ')}
          </div>
          <div className="text-sm text-white/80">When you listen most</div>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Discovery</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{profile.discoveryScore}%</div>
          <div className="text-xs text-gray-500">New artists explored</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Consistency</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{profile.consistencyScore}%</div>
          <div className="text-xs text-gray-500">Artist loyalty</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Music className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Session Length</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{profile.averageSessionLength}m</div>
          <div className="text-xs text-gray-500">Average listening</div>
        </div>
      </div>

      {/* Primary Genres */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-yellow-500" />
          <span className="font-semibold text-gray-900">Your Primary Genres</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.primaryGenres.map((genre: string) => (
            <span
              key={genre}
              className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}