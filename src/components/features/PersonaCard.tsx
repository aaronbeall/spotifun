import React from "react";

export const PersonaCard: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-pink-900 rounded-xl p-8 shadow-xl border border-pink-700/30 flex flex-col items-center justify-center">
      <div className="relative w-32 h-32 mb-6">
        {/* Avatar circle */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400 to-blue-400 shadow-2xl border-4 border-white/10 flex items-center justify-center">
          <span className="text-6xl font-bold text-white/80">🎧</span>
        </div>
        {/* Decorative rings */}
        <div className="absolute inset-0 rounded-full border-2 border-pink-400/30 animate-spin-slow"></div>
        <div className="absolute inset-2 rounded-full border-2 border-blue-400/20 animate-spin-reverse-slower"></div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Listener Persona</h3>
      <div className="mb-4 text-white/80 text-center max-w-md">
        <span className="block text-lg font-semibold text-pink-300 mb-1">The Eclectic Explorer</span>
        <span className="block text-sm">You love discovering new sounds, mixing genres, and exploring music from all corners of Spotify. Your listening journey is vibrant, unpredictable, and always evolving.</span>
      </div>
      <div className="flex gap-4 mt-4">
        <div className="flex flex-col items-center">
          <span className="text-pink-400 text-xl">🌈</span>
          <span className="text-xs text-white/70 mt-1">Genre Diversity</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-blue-400 text-xl">🔥</span>
          <span className="text-xs text-white/70 mt-1">Energy</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-yellow-400 text-xl">⭐</span>
          <span className="text-xs text-white/70 mt-1">Hits & Gems</span>
        </div>
      </div>
      <div className="mt-6 text-xs text-white/50 text-center max-w-xs">
        <span className="block">Personalized avatars and deeper insights coming soon!</span>
      </div>
    </div>
  );
};

// Animations for decorative rings
// Add to your global CSS:
// .animate-spin-slow { animation: spin 6s linear infinite; }
// .animate-spin-reverse-slower { animation: spin-reverse 12s linear infinite; }
// @keyframes spin { 100% { transform: rotate(360deg); } }
// @keyframes spin-reverse { 100% { transform: rotate(-360deg); } }
