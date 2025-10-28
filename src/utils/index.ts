import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export * from './format';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate random colors for charts and visualizations
export const generateColors = (count: number): string[] => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];
  
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
};

// Get time period labels
export const getTimePeriodLabels = () => ({
  'short_term': 'Last 4 weeks',
  'medium_term': 'Last 6 months',
  'long_term': 'All time'
});

// Calculate listening personality based on stats
export const calculateListeningPersonality = (stats: {
  genreDiversity: number;
  artistDiversity: number;
  discoveryRate: number;
  consistencyScore: number;
}): string => {
  const { genreDiversity, artistDiversity, discoveryRate, consistencyScore } = stats;
  
  if (discoveryRate > 0.7 && genreDiversity > 0.6) {
    return 'Music Explorer';
  } else if (consistencyScore > 0.8 && artistDiversity < 0.4) {
    return 'Loyal Listener';
  } else if (genreDiversity > 0.8) {
    return 'Genre Hopper';
  } else if (discoveryRate < 0.3) {
    return 'Nostalgic Soul';
  } else {
    return 'Balanced Listener';
  }
};

// Generate achievement descriptions
export const getAchievementDescriptions = () => ({
  'first_track': 'Played your first track',
  'hundred_plays': 'Reached 100 total plays',
  'thousand_plays': 'Reached 1,000 total plays',
  'ten_thousand_plays': 'Reached 10,000 total plays',
  'genre_explorer': 'Listened to 10 different genres',
  'artist_collector': 'Listened to 50 different artists',
  'early_bird': 'Listened to music before 6 AM',
  'night_owl': 'Listened to music after midnight',
  'weekend_warrior': 'Listened for 5+ hours on a weekend',
  'discovery_master': 'Discovered 20 new artists in a month'
});

// Calculate peak listening hours
export const calculatePeakHours = (playHistory: SpotifyApi.PlayHistoryObject[]): number[] => {
  const hourCounts = new Array(24).fill(0);
  
  playHistory.forEach(item => {
    const hour = new Date(item.played_at).getHours();
    hourCounts[hour]++;
  });
  
  // Find the top 3 hours
  const sortedHours = hourCounts
    .map((count, hour) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(item => item.hour);
  
  return sortedHours;
};

// Generate fun stat messages
export const generateFunStats = (stats: {
  totalPlays: number;
  uniqueArtists: number;
  averageSessionLength: number;
  genreDiversity: number;
}): string[] => {
  const messages: string[] = [];
  
  if (stats.totalPlays > 10000) {
    messages.push(`You've played music ${formatNumber(stats.totalPlays)} times! That's dedication! 🎵`);
  }
  
  if (stats.uniqueArtists > 500) {
    messages.push(`You've discovered ${stats.uniqueArtists} different artists. You're a true music explorer! 🎭`);
  }
  
  if (stats.averageSessionLength > 60) {
    messages.push(`Your average listening session is ${Math.round(stats.averageSessionLength)} minutes. You really know how to vibe! 🎶`);
  }
  
  if (stats.genreDiversity > 0.8) {
    messages.push(`You listen to ${Math.round(stats.genreDiversity * 100)}% diverse genres. Your taste is beautifully eclectic! 🌈`);
  }
  
  return messages;
};