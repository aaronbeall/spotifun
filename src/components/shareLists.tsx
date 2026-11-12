import type { Stats } from '@/types';
import type { AchievementView } from '@/lib/records/achievements';
import { darkenHex } from '@/utils/color';
import { BadgeMark, badgeArt } from './features/BadgeMedal';
import { StoryTrail, type StoryNode } from './features/StoryTrail';
import { RankMark } from './RankMark';
import { UnlockBadge } from './features/PersonaCard';
import type { ShareContent } from './ShareCardTemplate';

const RANGE_LABEL: Record<Stats['timeRange'], string> = {
  short_term: 'the last 4 weeks',
  medium_term: 'the last 6 months',
  long_term: 'all time',
};

function unlockLabel(iso: string): string {
  return `Unlocked ${new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function viewPhrase(stats: Stats): string {
  if (stats.mode === 'playlist') return stats.playlist?.name ?? 'this playlist';
  if (stats.mode === 'recent') return 'recent plays';
  return RANGE_LABEL[stats.timeRange];
}

type RankedShareItem = { name: string; image?: string; detail?: string };

function PodiumFace({ item, rank, round }: { item: RankedShareItem; rank: 1 | 2 | 3; round: boolean }) {
  const lead = rank === 1;
  return (
    <div className={`flex flex-col items-center ${lead ? 'w-40' : 'w-28 pt-12'}`}>
      <div className="relative">
        <div
          className={`overflow-hidden bg-white/10 ${
            lead
              ? `h-36 w-36 border-2 border-white/50 ${round ? 'rounded-full' : 'rounded-3xl'}`
              : `h-24 w-24 border border-white/25 ${round ? 'rounded-full' : 'rounded-2xl'}`
          }`}
        >
          {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
        </div>
        <span className="absolute -right-1 -bottom-1">
          <RankMark rank={rank} size={lead ? 'lg' : 'md'} />
        </span>
      </div>
      <p className={`line-clamp-2 text-center leading-tight text-white ${item.detail ? 'min-h-[2.5em]' : ''} ${lead ? 'mt-4 text-base font-bold' : 'mt-3 text-xs font-semibold'}`}>
        {item.name}
      </p>
      {item.detail && (
        <p className="line-clamp-1 text-center text-[11px] leading-tight text-white/55">{item.detail}</p>
      )}
    </div>
  );
}

function RankedShareGrid({ items, round = false }: { items: RankedShareItem[]; round?: boolean }) {
  const [lead, ...rest] = items;
  if (!lead) return null;
  const [second, third, ...field] = rest;

  return (
    <div className="flex w-[32rem] flex-col items-center gap-5">
      <div className="grid grid-cols-[7rem_10rem_7rem] items-start gap-x-5">
        <div className="flex justify-center">{second && <PodiumFace item={second} rank={2} round={round} />}</div>
        <div className="flex justify-center">
          <PodiumFace item={lead} rank={1} round={round} />
        </div>
        <div className="flex justify-center">{third && <PodiumFace item={third} rank={3} round={round} />}</div>
      </div>
      {field.length > 0 && (
        <div className="flex items-start justify-center gap-3 border-t border-white/10 pt-4">
          {field.slice(0, 5).map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex w-[4.5rem] flex-col items-center">
              <div className="relative">
                <div
                  className={`h-14 w-14 overflow-hidden border border-white/15 bg-white/10 ${round ? 'rounded-full' : 'rounded-xl'}`}
                >
                  {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-center text-[10px] leading-tight text-white/60">{item.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function topArtistsShare(stats: Stats): ShareContent {
  const artists = stats.topArtists;
  const lead = artists[0]?.name;
  return {
    eyebrow: 'Top Artists',
    title: lead ?? 'No artists',
    value: artists.length === 1 ? '1 artist' : `${artists.length} artists`,
    description: lead ? `From ${viewPhrase(stats)}, led by ${lead}.` : `Nothing to rank in ${viewPhrase(stats)}.`,
    color: { light: '#facc15', dark: '#713f12' },
    visual: artists.length > 0 ? (
      <RankedShareGrid
        round
        items={artists.slice(0, 8).map(artist => ({
          name: artist.name,
          image: artist.images?.[0]?.url,
        }))}
      />
    ) : undefined,
  };
}

export function topGenresShare(stats: Stats, images: Map<string, string>): ShareContent {
  const genres = stats.topGenres;
  const lead = genres[0]?.genre;
  const label = (genre: string) => genre.replace(/\b\w/g, letter => letter.toUpperCase());
  return {
    eyebrow: 'Top Genres',
    title: lead ? label(lead) : 'No genres',
    value: genres.length === 1 ? '1 genre' : `${genres.length} genres`,
    description: lead ? `From ${viewPhrase(stats)}, led by ${label(lead)}.` : `Nothing to rank in ${viewPhrase(stats)}.`,
    color: { light: '#c084fc', dark: '#581c87' },
    visual: genres.length > 0 ? (
      <RankedShareGrid
        items={genres.slice(0, 8).map(({ genre, count }) => ({
          name: label(genre),
          image: images.get(genre),
          detail: `${count} ${count === 1 ? 'artist' : 'artists'}`,
        }))}
      />
    ) : undefined,
  };
}

export function topTracksShare(stats: Stats): ShareContent {
  const tracks = stats.topTracks;
  const lead = tracks[0];
  const by = lead?.artists?.map(artist => artist.name).join(', ');
  return {
    eyebrow: 'Top Tracks',
    title: lead?.name ?? 'No tracks',
    value: tracks.length === 1 ? '1 track' : `${tracks.length} tracks`,
    description: lead ? `From ${viewPhrase(stats)}, led by ${by ? `${lead.name}, ${by}` : lead.name}.` : `Nothing to rank in ${viewPhrase(stats)}.`,
    color: { light: '#4ade80', dark: '#14532d' },
    visual: tracks.length > 0 ? (
      <RankedShareGrid
        items={tracks.slice(0, 8).map(track => ({
          name: track.name,
          image: track.album?.images?.[0]?.url,
          detail: track.artists?.map(artist => artist.name).join(', '),
        }))}
      />
    ) : undefined,
  };
}

export function musicStoryShare(story: {
  title: string;
  accent?: string;
  scope: string;
  nodes: StoryNode[];
  citation: string | null;
}): ShareContent {
  const light = story.accent && story.accent.startsWith('#') ? story.accent : '#7dd3fc';
  return {
    eyebrow: 'Music Story',
    title: story.title,
    description: story.citation ?? 'A map of this view.',
    color: { light, dark: darkenHex(light, 0.55) },
    showTitle: false,
    width: 880,
    visual: (
      <div className="w-full">
        <p className="mb-3 text-center text-xs text-white/45">{story.scope}.</p>
        <StoryTrail nodes={story.nodes} citation={story.citation} compact />
      </div>
    ),
  };
}

export function badgeShare(badge: AchievementView): ShareContent {
  const art = badgeArt(badge.id);
  const light = art?.metal ?? '#fcd34d';
  const dark = art ? darkenHex(art.ribbon, 0.45) : '#78350f';
  return {
    eyebrow: 'Badge',
    title: badge.title,
    value: badge.earned ? undefined : `${badge.progress} of ${badge.goal}`,
    description: badge.detail,
    banner: badge.earned && badge.earnedAt
      ? <UnlockBadge label={unlockLabel(badge.earnedAt)} color={light} />
      : undefined,
    color: { light, dark },
    texture: art ? { image: art.pattern, size: art.tile } : undefined,
    visual: <BadgeMark id={badge.id} className="h-40 w-40" />,
  };
}

export function badgesShare(earned: AchievementView[]): ShareContent {
  const lead = earned[0];
  return {
    eyebrow: 'Badges',
    title: earned.length === 1 ? lead.title : `${earned.length} badges`,
    description: earned.length === 1
      ? lead.detail
      : `Earned on this browser: ${earned.slice(0, 4).map(badge => badge.title).join(', ')}.`,
    banner: earned.length === 1 && lead.earnedAt
      ? <UnlockBadge label={unlockLabel(lead.earnedAt)} color="#fcd34d" />
      : undefined,
    color: { light: '#fcd34d', dark: '#78350f' },
    visual: (
      <div className="flex max-w-md flex-wrap justify-center gap-4">
        {earned.slice(0, 8).map(badge => (
          <div key={badge.id} className="flex w-20 flex-col items-center">
            <BadgeMark id={badge.id} className="h-20 w-20" />
            <p className="mt-1.5 text-center text-xs leading-tight text-white">{badge.title}</p>
          </div>
        ))}
      </div>
    ),
  };
}
