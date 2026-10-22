// Centralized descriptions for all metrics shown across the app
// Each description: 1-2 short sentences explaining what it measures and how to read high vs low

export const METRIC_DESCRIPTIONS: Record<string, string> = {
  // Spectrum Card Metrics
  'sonic-range': 'Measures how much your genres vary in their musical traits (mood, energy, complexity, etc.). Higher means your genres span a wider emotional and sonic palette.',
  'dominant-trait': 'The trait where your listening leans most strongly (e.g., 75% toward happy music). Shows your clearest preference across all dimensions.',
  'widest-range': 'The trait where your genres vary the most from one extreme to the other. Wide range means you enjoy both ends of that dimension.',
  
  // VACRS Dimensions
  'valence': 'Emotional tone from sad/negative to happy/positive. High valence means upbeat, cheerful music; low means melancholic or darker moods.',
  'arousal': 'Energy level from calm to intense. High arousal means energetic, fast-paced music; low means relaxing, ambient sounds.',
  'complexity': 'Musical intricacy from simple to complex. High complexity means intricate arrangements and varied structures; low means straightforward, repetitive patterns.',
  'rawness': 'Production style from polished to raw. High rawness means lo-fi, unpolished, or gritty production; low means clean, studio-produced sound.',
  'social-presence': 'How communal or solitary the music feels. High means party, dance, or group-oriented music; low means introspective, solitary listening.',
  
  // Overview Metrics
  'total-plays': 'Total number of tracks played in this view. In Top modes, this represents rank-based weight rather than actual play counts.',
  'unique-artists': 'Number of different artists in this view. Higher means more diverse artist exploration.',
  'unique-tracks': 'Number of different songs in this view. Higher means varied listening rather than repeating the same tracks.',
  'unique-genres': 'Number of different genres represented. Higher means eclectic taste across musical styles.',
  'total-duration': 'Combined listening time across all tracks. Shows how much time you\'ve spent with this music.',
  'genre-diversity': 'Ratio of unique genres to total genre tags across all your artists. Higher means less repetition in genre tags.',
  'artist-diversity': 'Ratio of unique artists to total plays. Higher means you sample widely rather than focusing on a few favorites.',
  'average-popularity': 'Average Spotify popularity rating (0-100) of your tracks. Higher means mainstream hits; lower means niche, underground music.',
  
  // Popularity Metrics
  'popularity-range': 'The spread from your most niche to most popular track. Wide range means you enjoy both underground and mainstream music.',
  'niche-percentage': 'Percentage of tracks with low popularity scores (under 40). Higher means you dig deeper into lesser-known music.',
  'mainstream-percentage': 'Percentage of tracks with high popularity scores (70+). Higher means you prefer well-known hits.',
  
  // Persona Dimensions
  'persona-genre-diversity': 'How varied your genre listening is. High means eclectic explorer; low means focused specialist.',
  'persona-popularity': 'Your preference for popular vs niche music. High means mainstream; low means underground.',
  'persona-artist-loyalty': 'How much you stick with favorite artists vs explore new ones. High means loyal; low means explorer.',
  'persona-era': 'Whether you prefer current hits or older classics. Modern means recent releases; classic means older music.',
  'persona-mood': 'Your typical emotional tone from sad to happy. Positive means upbeat; melancholic means darker moods.',
  'persona-energy': 'Your typical energy level from calm to energetic. High energy means intense, fast music; low means relaxing, mellow.',
  
  // Fun Stats
  'total-tracks-played': 'How many individual song plays you\'ve made. Each repeat counts separately.',
  'artist-discovery': 'How many different artists you\'ve explored. Higher means broader musical exploration.',
  'average-session': 'Average length of each track you listen to. Calculated as total listening time divided by number of plays.',
  
  // Stat Card Metrics (MusicProfile)
  'plays-per-day': 'Average number of plays per day over the past 30 days. Higher means more active listening.',
  'avg-weight': 'Average rank-based weight per track in Top modes. Higher means more heavily weighted toward top items.',
  'track-uniqueness': 'What percentage of plays are unique tracks vs repeats. Higher means more variety; lower means more repetition.',
  'track-count-only': 'Total number of unique tracks without repetition context.',
  
  // Rankings
  'ranking-score': 'Your score based on total plays, unique artists, unique tracks, and genre diversity. Higher means more active and diverse listening.',
  'ranking-position': 'Your position in the ranking. Lower number means higher rank.',
  
  // Vibe Metrics
  'vibe-match': 'How closely your listening matches this vibe\'s profile. Higher percentage means stronger alignment.',
  'current-vibe': 'The vibe that best matches your listening patterns right now. Based on your genre traits.',
  'top-vibe': 'The vibe that best matches your top music over this time period. Based on your most-played genre traits.',
};

export function getMetricDescription(key: string): string | undefined {
  return METRIC_DESCRIPTIONS[key];
}
