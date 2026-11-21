/**
 * Spotifun's own music shapes. Listening data comes from Last.fm and artwork, durations,
 * release dates and popularity come from Deezer, so neither service's types leak into the
 * app. Field names (duration_ms, played_at, release_date, images) follow the snake_case the
 * dashboard was first built on, so the components did not need renaming.
 */

export interface MusicImage {
  url: string;
  width?: number | null;
  height?: number | null;
}

/** An artist as credited on a track: enough to look the full artist up. */
export interface ArtistRef {
  /** Stable id derived from the name (Last.fm has no ids of its own for most artists) */
  id: string;
  name: string;
  /** Last.fm page for this artist */
  url?: string;
  mbid?: string;
}

export interface Artist extends ArtistRef {
  images: MusicImage[];
  /** Genre labels. Filled from Last.fm tags. */
  genres: string[];
  /** 0–100, from Deezer fan counts. Absent when the artist couldn't be matched. */
  popularity?: number;
  /** The listener's own play count in the requested period (Last.fm top artists) */
  playcount?: number;
}

export interface Album {
  id: string;
  name: string;
  images: MusicImage[];
  /** YYYY, YYYY-MM or YYYY-MM-DD. Filled from Deezer. */
  release_date?: string;
}

export interface Track {
  id: string;
  name: string;
  artists: ArtistRef[];
  album: Album;
  /** 0 when unknown */
  duration_ms: number;
  /** 0–100, from Deezer's track rank. Absent when the track couldn't be matched. */
  popularity?: number;
  /** Last.fm page for this track */
  url?: string;
  mbid?: string;
  /** The listener's own play count in the requested period (Last.fm top tracks) */
  playcount?: number;
}

/** One scrobble */
export interface Play {
  track: Track;
  /** ISO timestamp */
  played_at: string;
}
