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

export type GenreColorType = 'gradient' | 'border' | 'bg' | 'text';

type GenreColor = {
  color: string;
  gradient: string;
  border: string;
  bg: string;
  text: string;
};

// Base color definitions without opacity
const genreColorThemes = [
  // Purple/Blue
  {
    gradient: 'from-purple-500 to-blue-500',
    border: 'border-purple-500',
    bg: 'bg-purple-500',
    text: 'text-purple-500',
    color: '#6366f1',
  },
  // Pink/Rose
  {
    gradient: 'from-pink-500 to-rose-500',
    border: 'border-pink-500',
    bg: 'bg-pink-500',
    text: 'text-pink-500',
    color: '#ec4899',
  },
  // Cyan/Emerald
  {
    gradient: 'from-cyan-500 to-emerald-500',
    border: 'border-cyan-500',
    bg: 'bg-cyan-500',
    text: 'text-cyan-500',
    color: '#06b6d4',
  },
  // Amber/Orange
  {
    gradient: 'from-amber-500 to-orange-500',
    border: 'border-amber-500',
    bg: 'bg-amber-500',
    text: 'text-amber-500',
    color: '#f59e0b',
  },
  // Violet/Fuchsia
  {
    gradient: 'from-violet-500 to-fuchsia-500',
    border: 'border-violet-500',
    bg: 'bg-violet-500',
    text: 'text-violet-500',
    color: '#8b5cf6',
  },
  // Emerald/Teal
  {
    gradient: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-500',
    bg: 'bg-emerald-500',
    text: 'text-emerald-500',
    color: '#10b981',
  },
  // Rose/Pink
  {
    gradient: 'from-rose-500 to-pink-500',
    border: 'border-rose-500',
    bg: 'bg-rose-500',
    text: 'text-rose-500',
    color: '#f43f5e',
  },
  // Blue/Indigo
  {
    gradient: 'from-blue-500 to-indigo-500',
    border: 'border-blue-500',
    bg: 'bg-blue-500',
    text: 'text-blue-500',
    color: '#3b82f6',
  },
  // Fuchsia/Purple
  {
    gradient: 'from-fuchsia-500 to-purple-600',
    border: 'border-fuchsia-500',
    bg: 'bg-fuchsia-500',
    text: 'text-fuchsia-500',
    color: '#d946ef',
  },
  // Sky/Cyan
  {
    gradient: 'from-sky-500 to-cyan-400',
    border: 'border-sky-500',
    bg: 'bg-sky-500',
    text: 'text-sky-500',
    color: '#0ea5e9',
  },
  // Lime/Emerald
  {
    gradient: 'from-lime-400 to-emerald-500',
    border: 'border-lime-400',
    bg: 'bg-lime-400',
    text: 'text-lime-400',
    color: '#84cc16',
  },
  // Yellow/Amber
  {
    gradient: 'from-yellow-400 to-amber-500',
    border: 'border-yellow-400',
    bg: 'bg-yellow-400',
    text: 'text-yellow-400',
    color: '#fde047',
  },
  // Red/Orange
  {
    gradient: 'from-red-500 to-orange-500',
    border: 'border-red-500',
    bg: 'bg-red-500',
    text: 'text-red-500',
    color: '#ef4444',
  },
  // Indigo/Violet
  {
    gradient: 'from-indigo-500 to-violet-600',
    border: 'border-indigo-500',
    bg: 'bg-indigo-500',
    text: 'text-indigo-500',
    color: '#6366f1',
  },
  // Teal/Cyan
  {
    gradient: 'from-teal-400 to-cyan-500',
    border: 'border-teal-400',
    bg: 'bg-teal-400',
    text: 'text-teal-400',
    color: '#14b8a6',
  },
  // Pink/Rose/Fuchsia
  {
    gradient: 'from-pink-500 via-rose-500 to-fuchsia-500',
    border: 'border-pink-500',
    bg: 'bg-pink-500',
    text: 'text-pink-500',
    color: '#ec4899',
  },
  // Blue/Sky/Cyan
  {
    gradient: 'from-blue-500 via-sky-500 to-cyan-500',
    border: 'border-blue-500',
    bg: 'bg-blue-500',
    text: 'text-blue-500',
    color: '#0ea5e9',
  },
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

/**
 * Get a consistent color theme for a genre
 * @param genre - The genre name
 * @returns Object with color classes for different use cases
 */
export const getGenreColor = (genre: string): GenreColor => {
  const hash = hashString(genre.toLowerCase());
  return genreColorThemes[hash % genreColorThemes.length];
};

/**
 * Get a specific color class for a genre
 * @param genre - The genre name
 * @param type - The type of color class to return
 * @returns The requested color class as a string
 */
export const getGenreColorClass = (genre: string, type: GenreColorType): string => {
  const colors = getGenreColor(genre);
  return colors[type];
};

/**
 * Generate a mapping of genres to their color themes
 * @param genres - Array of genre names
 * @returns Object mapping each genre to its color theme
 */
export const getGenreColorMap = (genres: string[]): Record<string, GenreColor> => {
  const colorMap: Record<string, GenreColor> = {};
  genres.forEach(genre => {
    colorMap[genre] = getGenreColor(genre);
  });
  return colorMap;
};
