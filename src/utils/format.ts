// Format duration in milliseconds to a human-readable string (e.g., "2h 30m", "45m", "1d 6h")
export const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
};

// Format large numbers with appropriate suffixes (e.g., 1.5M, 2.3K)
export const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Generate consistent colors for genres based on genre name hash
export const getGenreColors = (genre: string) => {
  // Each color includes a gradient and matching border color
  const colors = [
    { gradient: 'from-purple-500/15 to-blue-500/15', border: 'border-purple-500/30' },
    { gradient: 'from-pink-500/15 to-rose-500/15', border: 'border-pink-500/30' },
    { gradient: 'from-cyan-500/15 to-emerald-500/15', border: 'border-cyan-500/30' },
    { gradient: 'from-amber-500/15 to-orange-500/15', border: 'border-amber-500/30' },
    { gradient: 'from-violet-500/15 to-fuchsia-500/15', border: 'border-violet-500/30' },
    { gradient: 'from-emerald-500/15 to-teal-500/15', border: 'border-emerald-500/30' },
    { gradient: 'from-rose-500/15 to-pink-500/15', border: 'border-rose-500/30' },
    { gradient: 'from-blue-500/15 to-indigo-500/15', border: 'border-blue-500/30' },
    { gradient: 'from-amber-500/15 to-yellow-500/15', border: 'border-amber-500/30' },
    { gradient: 'from-green-500/15 to-emerald-500/15', border: 'border-green-500/30' },
    { gradient: 'from-indigo-500/15 to-violet-500/15', border: 'border-indigo-500/30' },
    { gradient: 'from-rose-500/15 to-amber-500/15', border: 'border-rose-500/30' },
  ];

  // Simple hash function to convert string to a consistent number
  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  const hash = hashString(genre.toLowerCase());
  const colorIndex = hash % colors.length;
  return colors[colorIndex];
};

// Generate a mapping of genres to their colors
export const getGenreColorMap = (genres: string[]) => {
  const colorMap: Record<string, { gradient: string; border: string }> = {};
  genres.forEach(genre => {
    colorMap[genre] = getGenreColors(genre);
  });
  return colorMap;
};
