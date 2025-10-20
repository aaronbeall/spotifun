'use client';

import { useState } from 'react';
import { Music, BarChart3, Trophy, Users, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectSpotify = async () => {
    setIsConnecting(true);
    window.location.href = '/api/auth/spotify';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <div className="flex justify-center mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Music className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
            Spotifun
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Discover insights, stats, and fun feedback about your Spotify listening habits. 
            Get your personalized music profile and unlock achievements!
          </p>

          <button
            onClick={handleConnectSpotify}
            disabled={isConnecting}
            className="bg-white text-green-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                Connecting...
              </>
            ) : (
              <>
                Connect with Spotify
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white text-center hover:bg-white/20 transition-all duration-300">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-green-300" />
            <h3 className="text-xl font-semibold mb-2">Detailed Analytics</h3>
            <p className="text-white/80">Track your listening habits with comprehensive stats and insights</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white text-center hover:bg-white/20 transition-all duration-300">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-300" />
            <h3 className="text-xl font-semibold mb-2">Music Profile</h3>
            <p className="text-white/80">Get a personalized profile based on your music taste and habits</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white text-center hover:bg-white/20 transition-all duration-300">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
            <h3 className="text-xl font-semibold mb-2">Achievements</h3>
            <p className="text-white/80">Unlock fun achievements and milestones for your listening journey</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white text-center hover:bg-white/20 transition-all duration-300">
            <Users className="w-12 h-12 mx-auto mb-4 text-purple-300" />
            <h3 className="text-xl font-semibold mb-2">Rankings</h3>
            <p className="text-white/80">Compare your music habits with other users worldwide</p>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="mt-24 bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-white">
          <h2 className="text-3xl font-bold text-center mb-8">What You'll Discover</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-300 mb-2">Top Artists</div>
              <p className="text-white/80">See your most played artists with detailed statistics</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-300 mb-2">Genre Analysis</div>
              <p className="text-white/80">Discover your music taste patterns and genre preferences</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-300 mb-2">Fun Insights</div>
              <p className="text-white/80">Get personalized insights similar to Spotify Wrapped</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-white/60">
          <p>Made with ❤️ for music lovers everywhere</p>
        </div>
      </div>
    </div>
  );
}