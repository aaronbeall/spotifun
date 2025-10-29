export interface PopularityAnalysis {
  label: string;
  description: string;
  diversityScore: number;
  range: [number, number]
}

export function analyzePopularity(tracks: SpotifyApi.TrackObjectFull[]): PopularityAnalysis {
  if (!tracks.length) {
    return {
      label: 'No Data',
      description: 'Not enough data to analyze popularity',
      diversityScore: 0,
      range: [0, 0]
    };
  }

  const popularities = tracks
    .map(track => track.popularity || 0)
    .sort((a, b) => a - b);

  const min = Math.min(...popularities);
  const max = Math.max(...popularities);
  const range = max - min;

  // Calculate median
  const mid = Math.floor(popularities.length / 2);
  const median = popularities.length % 2 !== 0
    ? popularities[mid]
    : (popularities[mid - 1] + popularities[mid]) / 2;

  // Calculate interquartile range (IQR) for diversity measure
  const q1 = getPercentile(popularities, 25);
  const q3 = getPercentile(popularities, 75);
  const iqr = q3 - q1;

  // Calculate diversity score (0-100)
  // Higher score means more diverse in popularity
  const diversityScore = Math.min(100, Math.round((range / 100) * 50 + (iqr / 100) * 50));

  // Determine label based on median and diversity
  let label: string;
  let description: string;

  if (diversityScore < 20) {
    // Very consistent popularity
    if (median < 30) {
      label = 'Deep Cuts';
      description = 'You mostly listen to niche, lesser-known tracks';
    } else if (median < 70) {
      label = 'Mainstream';
      description = 'You mostly listen to popular tracks';
    } else {
      label = 'Trending Now';
      description = 'You mostly listen to top charting tracks';
    }
  } else if (diversityScore < 60) {
    // Moderately diverse
    if (median < 40) {
      label = 'Eclectic Mix';
      description = 'You enjoy a mix of niche and popular music';
    } else {
      label = 'Varied Tastes';
      description = 'Your music taste spans different popularity levels';
    }
  } else {
    // Very diverse
    if (median < 50) {
      label = 'Underground Explorer';
      description = 'You enjoy discovering hidden gems';
    } else if (median < 80) {
      label = 'Music Connoisseur';
      description = 'Your taste spans from deep cuts to chart-toppers';
    } else {
      label = 'Hit Seeker';
      description = 'You love both current hits and deep cuts';
    }
  }

  return {
    label,
    description,
    diversityScore,
    range: [min, max]
  };
}

function getPercentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  if (p <= 0) return arr[0];
  if (p >= 100) return arr[arr.length - 1];

  const index = (arr.length - 1) * p / 100;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) return arr[lower];

  // Linear interpolation
  return arr[lower] + (arr[upper] - arr[lower]) * (index - lower);
}
