import type { Stats } from '@/types';
import type { ShareContent } from './ShareCardTemplate';

const RANGE_LABEL: Record<Stats['timeRange'], string> = {
  short_term: 'the last 4 weeks',
  medium_term: 'the last 6 months',
  long_term: 'all time',
};

function viewPhrase(stats: Stats): string {
  if (stats.mode === 'playlist') return stats.playlist?.name ?? 'this playlist';
  if (stats.mode === 'recent') return 'recent plays';
  return RANGE_LABEL[stats.timeRange];
}

function RankedShareGrid({ items }: { items: Array<{ name: string; image?: string }> }) {
  return (
    <div className="grid grid-cols-4 gap-x-4 gap-y-5">
      {items.map((item, index) => (
        <div key={`${item.name}-${index}`} className="flex w-[5.5rem] flex-col items-center">
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/15 bg-white/10">
            {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
            <span className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/75 text-[10px] font-bold text-white">
              {index + 1}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-center text-xs leading-tight text-white">{item.name}</p>
        </div>
      ))}
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
      <RankedShareGrid items={artists.slice(0, 8).map(artist => ({ name: artist.name, image: artist.images?.[0]?.url }))} />
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
      <RankedShareGrid items={tracks.slice(0, 8).map(track => ({ name: track.name, image: track.album?.images?.[0]?.url }))} />
    ) : undefined,
  };
}
