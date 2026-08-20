import React, { useMemo, useState } from "react";
import { Award, BarChart, Activity, Star, Gem, User, Users, Palette } from "lucide-react";
import { SequenceNavigator } from "./SequenceNavigator";
import { MusicVibes } from "./MusicVibes";
import { SpectrumCard, getVACRSDiversity } from "./SpectrumCard";
import { SpectrumDimensionBars } from "./SpectrumDimensionBars";
import { Stats } from "@/types";
import { PopularityCard } from "./PopularityCard";
import { PopularityHistogram } from "./PopularityHistogram";
import { PersonaCard } from "./PersonaCard";
import { FlowCardD3, CHART_MODE_TITLES, CHART_MODE_DESCRIPTIONS } from "./FlowCardD3";
import { FlowStreamChart, FlowChartMode, FlowTrack } from "./FlowStreamChart";
import { FlowLegend } from "./FlowLegend";
import { ShareModal } from "../ShareModal";
import { ShareContent } from "../ShareCardTemplate";
import { GenerativeArt } from "../GenerativeArt";
import { ImageBadge } from "../ImageBadge";
import { findBestMatchingVibe } from "@/utils/musicVibesAnalyzer";
import { analyzePopularity, getPopularityExtremes } from "@/utils/popularity";
import { getUserPersona, personaToArtProfile } from "@/utils/musicPersonas";
import { darkenHex } from "@/utils/color";

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

const CARD_THEMES = {
  spectrum: { light: '#60a5fa', dark: '#1e3a8a' },
  flow: { light: '#f472b6', dark: '#831843' },
  popularity: { light: '#facc15', dark: '#713f12' },
};

function CircularVisual({ children, glow }: { children: React.ReactNode; glow: string }) {
  return (
    <div
      className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/10"
      style={{ boxShadow: `0 0 60px ${glow}50` }}
    >
      {children}
    </div>
  );
}

export function WrappedMusicProfile({ stats, isLoadingTimeRange, playLimit, onPlayLimitChange }: WrappedMusicProfileProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [flowChartMode, setFlowChartMode] = useState<FlowChartMode>('genres');

  const recentlyPlayedGenres = useMemo(() => stats.recentlyPlayed.map(t => {
    const fullArtist = stats.artists.find(a => a.artist.id === t.track.artists[0].id);
    return fullArtist ? fullArtist.genres : [];
  }), [stats]);

  const flowTracks: FlowTrack[] = useMemo(() => stats.recentlyPlayed.map((t, i) => ({
    playedAt: t.played_at,
    genres: recentlyPlayedGenres[i] || [],
    track: t.track.name,
    artist: t.track.artists?.[0]?.name || "",
    image: t.track.album?.images?.[0]?.url,
  })), [stats, recentlyPlayedGenres]);

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

  const topArtist = useMemo(() => stats.artists.length > 0 ? {
    name: stats.artists[0].artist.name,
    image: stats.artists[0].artist.images?.[0]?.url,
    count: stats.artists[0].playCount,
  } : undefined, [stats]);

  const topGenre = useMemo(() => stats.genres.length > 0 ? {
    name: stats.genres[0].genre,
    count: stats.genres[0].playCount,
    image: genreImages.get(stats.genres[0].genre),
  } : undefined, [stats, genreImages]);

  // A purpose-built summary of whichever card is active, used to render the
  // shareable graphic (not a screenshot of the live interactive card). Each
  // case reuses the same visual component the live card renders, rather than
  // re-creating the chart/emblem.
  const shareContent = useMemo((): ShareContent => {
    switch (currentCard) {
      case 0: {
        const { vibe, matchPercentage } = findBestMatchingVibe(stats.genres);
        return {
          eyebrow: 'Your Current Vibe',
          title: vibe.name,
          value: `${Math.round(matchPercentage)}% Match`,
          description: vibe.description,
          color: vibe.color,
          visual: (
            <div className="flex items-center justify-center gap-3">
              {topArtist && (
                <ImageBadge
                  {...topArtist}
                  title="Top Artist"
                  color="#a78bfa"
                  icon={Users}
                  className="scale-90 mt-9"
                />
              )}
              {vibe.image && (
                <CircularVisual glow={vibe.color.light}>
                  <img src={vibe.image} alt={vibe.name} className="w-full h-full object-cover" />
                </CircularVisual>
              )}
              {topGenre && (
                <ImageBadge
                  {...topGenre}
                  title="Top Genre"
                  color="#60a5fa"
                  icon={Palette}
                  className="scale-90 mt-9"
                />
              )}
            </div>
          ),
        };
      }
      case 1: {
        const { diversityScore } = getVACRSDiversity(stats.genres);
        return {
          eyebrow: 'Genre Spectrum',
          title: 'Genre Diversity',
          value: `${Math.round(diversityScore)}% Diverse`,
          description: 'How your listening spreads across valence, arousal, complexity, rawness, and social presence.',
          color: CARD_THEMES.spectrum,
          visual: <SpectrumDimensionBars genreStats={stats.genres} interactive={false} compact />,
        };
      }
      case 2: {
        return {
          eyebrow: 'Listening Flow',
          title: CHART_MODE_TITLES[flowChartMode],
          description: CHART_MODE_DESCRIPTIONS[flowChartMode],
          color: CARD_THEMES.flow,
          visual: (
            <div className="flex flex-col items-center gap-4">
              <FlowStreamChart tracks={flowTracks} chartMode={flowChartMode} width={480} height={260} />
              <FlowLegend tracks={flowTracks} chartMode={flowChartMode} />
            </div>
          ),
        };
      }
      case 3: {
        const tracks = stats.tracks.map(t => t.track);
        const popularity = analyzePopularity(tracks);
        const { mostPopularTrack, leastPopularTrack, mostPopularCount, leastPopularCount } = getPopularityExtremes(tracks);
        return {
          eyebrow: 'Track Popularity',
          title: popularity.label,
          value: `${popularity.range[0]}–${popularity.range[1]}% range`,
          description: popularity.description,
          color: CARD_THEMES.popularity,
          visual: (
            <div className="flex items-center justify-center gap-3">
              <ImageBadge
                title="Most Niche"
                name={leastPopularTrack.name}
                subtitle={leastPopularTrack.artists?.[0]?.name}
                image={leastPopularTrack.album?.images?.[0]?.url}
                count={leastPopularCount}
                color="#818cf8"
                icon={Gem}
                className="scale-75"
                percent={Math.round(leastPopularTrack.popularity || 0)}
              />
              <PopularityHistogram tracks={tracks} interactive={false} />
              <ImageBadge
                title="Most Popular"
                name={mostPopularTrack.name}
                subtitle={mostPopularTrack.artists?.[0]?.name}
                image={mostPopularTrack.album?.images?.[0]?.url}
                count={mostPopularCount}
                color="#f472b6"
                icon={Star}
                className="scale-75"
                percent={Math.round(mostPopularTrack.popularity || 0)}
              />
            </div>
          ),
        };
      }
      case 4:
      default: {
        const persona = getUserPersona(stats);
        const colors = { light: persona.color, dark: darkenHex(persona.color, 0.6) };
        return {
          eyebrow: 'Your Listener Persona',
          title: persona.name,
          description: persona.description,
          color: colors,
          visual: (
            <CircularVisual glow={colors.light}>
              <GenerativeArt seed={persona.id} colors={colors} profile={personaToArtProfile(persona)} className="w-full h-full" />
            </CircularVisual>
          ),
        };
      }
    }
  }, [currentCard, stats, flowTracks, topArtist, topGenre, flowChartMode]);

  const openShare = () => setShareOpen(true);

  return (
    <div className="space-y-6">
      <SequenceNavigator
        current={currentCard}
        setCurrent={setCurrentCard}
        items={CARD_ITEMS}
        className="mb-2"
      />
      <div>
        {currentCard === 0 && (
          <MusicVibes
            genreStats={stats.genres}
            topArtist={topArtist}
            topGenre={topGenre}
            onShare={openShare}
          />
        )}
        {currentCard === 1 && (
          <SpectrumCard genreStats={stats.genres} onShare={openShare} />
        )}
        {currentCard === 2 && (
          <FlowCardD3 tracks={flowTracks} onShare={openShare} onChartModeChange={setFlowChartMode} />
        )}
        {currentCard === 3 && (
          <PopularityCard tracks={stats.tracks.map(t => t.track)} onShare={openShare} />
        )}
        {currentCard === 4 && (
          <PersonaCard stats={stats} onShare={openShare} />
        )}
      </div>

      <ShareModal content={shareOpen ? shareContent : null} onClose={() => setShareOpen(false)} />
    </div>
  );
}
