'use client';

import type { Stats } from '@/types';
import { cn, getGenreColorClass } from '@/utils';

/** Two drifting rows: top artists (photos) and top tracks (album covers), plus genre chips */
export function OnRepeat({ stats }: { stats: Stats }) {
  const artists = stats.topArtists.slice(0, 16);
  const seenAlbums = new Set<string>();
  const tracks = stats.topTracks.filter(track => {
    if (seenAlbums.has(track.album.id)) return false;
    seenAlbums.add(track.album.id);
    return true;
  }).slice(0, 16);

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee gap-4 hover:[animation-play-state:paused]">
          {[...artists, ...artists].map((artist, i) => (
            <a
              key={`${artist.id}-${i}`}
              href={artist.external_urls?.spotify}
              target="_blank"
              rel="noopener noreferrer"
              aria-hidden={i >= artists.length}
              tabIndex={i >= artists.length ? -1 : undefined}
              className="group relative block h-44 w-36 shrink-0 overflow-hidden rounded-xl bg-gray-800 sm:h-52 sm:w-44"
            >
              {artist.images?.[0]?.url && (
                <img src={artist.images[0].url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              )}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/10 to-transparent p-3">
                <span className="text-xs font-bold text-white/60">#{(i % artists.length) + 1}</span>
                <span className="font-bold leading-tight text-white">{artist.name}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee-reverse gap-3 hover:[animation-play-state:paused]">
          {[...tracks, ...tracks].map((track, i) => (
            <div
              key={`${track.id}-${i}`}
              aria-hidden={i >= tracks.length}
              className="flex w-64 shrink-0 items-center gap-3 rounded-xl border border-white/5 bg-gray-800/70 p-2.5"
            >
              {track.album.images?.[0]?.url && (
                <img src={track.album.images[0].url} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{track.name}</p>
                <p className="truncate text-xs text-gray-400">{track.artists.map(a => a.name).join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 pt-3">
        {stats.topGenres.slice(0, 14).map(({ genre }) => (
          <span key={genre} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gray-800/60 px-3 py-1 text-sm capitalize text-gray-200">
            <span className={cn('h-2 w-2 rounded-full', getGenreColorClass(genre, 'bg'))} />
            {genre}
          </span>
        ))}
      </div>
    </div>
  );
}
