"use client";

import { WrappedMusicProfile } from "@/components/features/WrappedMusicProfile";
import { Stats, TrackStats, ArtistStats, GenreStats } from "@/types";

const GENRES = ["pop", "rock", "jazz", "hip hop", "metal", "punk", "ambient", "folk", "r&b", "reggae"];

function makeTrack(i: number, name: string, artistName: string, artistId: string, popularity: number): SpotifyApi.TrackObjectFull {
  return {
    id: `track-${i}`,
    name,
    popularity,
    duration_ms: 200000,
    artists: [{ id: artistId, name: artistName } as SpotifyApi.ArtistObjectSimplified],
    album: {
      images: [{ url: `https://picsum.photos/seed/${i}/100` }],
    } as unknown as SpotifyApi.AlbumObjectSimplified,
  } as SpotifyApi.TrackObjectFull;
}

const trackDefs = [
  { name: "Neon Skyline", artist: "Aurora Vale", pop: 92 },
  { name: "Midnight Circuit", artist: "Glass Animals Jr", pop: 88 },
  { name: "Static Bloom", artist: "Fever Dial", pop: 74 },
  { name: "Concrete Bloom", artist: "Aurora Vale", pop: 63 },
  { name: "Slow Static", artist: "The Quiet Room", pop: 55 },
  { name: "Velvet Rust", artist: "Coalfield", pop: 47 },
  { name: "Paper Moths", artist: "Fever Dial", pop: 38 },
  { name: "Low Tide Echoes", artist: "Coalfield", pop: 29 },
  { name: "Hollow Signal", artist: "The Quiet Room", pop: 21 },
  { name: "Ash & Amber", artist: "Nightjar Route", pop: 14 },
];

const tracks: SpotifyApi.TrackObjectFull[] = trackDefs.map((t, i) =>
  makeTrack(i, t.name, t.artist, `artist-${t.artist}`, t.pop)
);

const trackStats: TrackStats[] = tracks.map((track, i) => ({
  track,
  playCount: 20 - i,
  firstPlayed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  lastPlayed: new Date(Date.now() - 1000 * 60 * 60 * i).toISOString(),
  totalDuration: track.duration_ms * (20 - i),
}));

const artistNames = Array.from(new Set(trackDefs.map(t => t.artist)));
const artistStats: ArtistStats[] = artistNames.map((name, i) => ({
  artist: {
    id: `artist-${name}`,
    name,
    genres: [GENRES[i % GENRES.length], GENRES[(i + 3) % GENRES.length]],
    images: [],
  } as unknown as SpotifyApi.ArtistObjectFull,
  playCount: 40 - i * 5,
  uniqueTracks: 4,
  totalDuration: 800000,
  genres: [GENRES[i % GENRES.length], GENRES[(i + 3) % GENRES.length]],
}));

const genreStats: GenreStats[] = GENRES.map((genre, i) => ({
  genre,
  playCount: 30 - i * 2,
  uniqueTracks: 5,
  uniqueArtists: 2,
  totalDuration: 600000,
}));

const recentlyPlayed: SpotifyApi.PlayHistoryObject[] = tracks.map((track, i) => ({
  track,
  played_at: new Date(Date.now() - 1000 * 60 * 30 * i).toISOString(),
  context: null,
} as unknown as SpotifyApi.PlayHistoryObject));

const stats: Stats = {
  overview: {
    totalPlays: 200,
    uniqueArtists: artistStats.length,
    uniqueTracks: tracks.length,
    uniqueGenres: genreStats.length,
    totalDuration: 4000000,
    averageSessionLength: 45,
    genreDiversity: 0.7,
    artistDiversity: 0.6,
    averagePopularity: 52,
  },
  recentlyPlayed,
  tracks: trackStats,
  artists: artistStats,
  genres: genreStats,
  topTracks: tracks,
  topArtists: artistStats.map(a => a.artist),
  timeRange: "medium_term",
  topGenres: genreStats.map(g => ({ genre: g.genre, count: g.playCount })),
};

export default function LayoutTestPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-5xl mx-auto">
        <WrappedMusicProfile
          stats={stats}
          isLoadingTimeRange={false}
          playLimit={50}
          onPlayLimitChange={() => {}}
        />
      </div>
    </div>
  );
}
