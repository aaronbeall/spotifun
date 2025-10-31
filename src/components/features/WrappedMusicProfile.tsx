import React, { useMemo, useState } from "react";
import { Award, BarChart, Activity, Star, User } from "lucide-react";
import { SequenceNavigator } from "./SequenceNavigator";
import { MusicVibes } from "./MusicVibes";
import { SpectrumCard } from "./SpectrumCard";
import { FlowCard } from "./FlowCard";
import { Stats } from "@/types";
import { PopularityCard } from "./PopularityCard";
import { PersonaCard } from "./PersonaCard";
import { FlowCardD3 } from "./FlowCardD3";

interface WrappedMusicProfileProps {
  stats: Stats;
  isLoadingTimeRange: boolean;
  playLimit: number;
  onPlayLimitChange: (limit: number) => void;
}

const CARD_ITEMS = [
  { label: "Vibes", icon: Award },
  { label: "Spectrum", icon: BarChart },
  { label: "Flow", icon: Activity },
  { label: "Popularity", icon: Star },
  { label: "Persona", icon: User },
];

export function WrappedMusicProfile({ stats, isLoadingTimeRange, playLimit, onPlayLimitChange }: WrappedMusicProfileProps) {
  const [currentCard, setCurrentCard] = useState(0);

  const recentlyPlayedGenres = useMemo(() => stats.recentlyPlayed.map(t => {
    const fullArtist = stats.artists.find(a => a.artist.id === t.track.artists[0].id);
    return fullArtist ? fullArtist.genres : [];
  }), [stats]);

  const genreImages = useMemo(() => {
    const genreMap = new Map<string, string>();

    stats.tracks.forEach(t => {
      t.track.artists.forEach(artist => {
        const fullArtist = stats.artists.find(a => a.artist.id === artist.id);
        if (fullArtist) {
          fullArtist.genres.forEach(genre => {
            if (!genreMap.has(genre) && t.track.album?.images?.[0]?.url) {
              genreMap.set(genre, t.track.album.images[0].url);
            }
          });
        }
      });
    });
    return genreMap;
  }, [stats]);

  return (
    <div className="space-y-6">
      <SequenceNavigator
        current={currentCard}
        setCurrent={setCurrentCard}
        items={CARD_ITEMS}
        className="mb-6"
      />
      <div>
        {currentCard === 0 && (
          <MusicVibes
            genreStats={stats.genres}
            topArtist={stats.artists.length > 0 ? {
              name: stats.artists[0].artist.name,
              image: stats.artists[0].artist.images?.[0]?.url,
              count: stats.artists[0].playCount,
            } : undefined}
            topGenre={stats.genres.length > 0 ? {
                name: stats.genres[0].genre,
                count: stats.genres[0].playCount,
                image: genreImages.get(stats.genres[0].genre),
              } : undefined}
          />
        )}
        {currentCard === 1 && (
          <SpectrumCard genreStats={stats.genres} />
        )}
        {currentCard === 2 && (
          <FlowCardD3
            tracks={stats.recentlyPlayed.map((t, i) => ({
              playedAt: t.played_at,
              genres: recentlyPlayedGenres[i] || [],
              track: t.track.name,
              artist: t.track.artists?.[0]?.name || ""
            }))}
          />
        )}
        {currentCard === 3 && (
          <PopularityCard tracks={stats.tracks.map(t => t.track)} />
        )}
        {currentCard === 4 && (
          <PersonaCard />
        )}
      </div>
    </div>
  );
}
