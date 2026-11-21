'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { MUSIC_VIBES } from '@/utils/musicVibes';
import { MUSIC_PERSONAS, personaPortraitSrc } from '@/utils/musicPersonas';
import { RarityBadge } from './RarityBadge';

interface SamplePlaylistSummary {
  id: string;
  name: string;
  owner: string;
  role: 'genre' | 'chart' | 'devoted';
  query: string;
  trackCount: number;
  vibe: string;
  persona: string;
}

export function SamplePlaylistDialog({
  open,
  activeId,
  onLoad,
  onClose,
}: {
  open: boolean;
  activeId: string | null;
  onLoad: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const [playlists, setPlaylists] = useState<SamplePlaylistSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setPickError(null);
      return;
    }
    let cancelled = false;
    fetch('/api/dev/sample-playlists')
      .then(response => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<{ playlists: SamplePlaylistSummary[] }>;
      })
      .then(data => {
        if (!cancelled) setPlaylists(data.playlists);
      })
      .catch(() => {
        if (!cancelled) setLoadError('The sample list could not be loaded.');
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!playlists) return [];
    if (!needle) return playlists;
    return playlists.filter(playlist =>
      [playlist.name, playlist.owner, playlist.query, playlist.role, playlist.vibe, playlist.persona].join(' ').toLowerCase().includes(needle)
    );
  }, [playlists, query]);

  if (!open) return null;

  const choose = async (id: string) => {
    setLoadingId(id);
    setPickError(null);
    try {
      await onLoad(id);
      onClose();
    } catch {
      setPickError('That sample could not be scored.');
    } finally {
      setLoadingId(null);
    }
  };

  const genres = filtered.filter(playlist => playlist.role === 'genre');
  const devoted = filtered.filter(playlist => playlist.role === 'devoted');
  const charts = filtered.filter(playlist => playlist.role === 'chart');

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-3 sm:p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sample-playlists-title"
        className="relative flex max-h-[min(40rem,calc(100vh-3rem))] w-full max-w-lg flex-col rounded-2xl border border-white/10 bg-gray-900 p-5 sm:p-6 shadow-2xl"
        onClick={event => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-3 -right-3 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-gray-800 text-white shadow-lg hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 id="sample-playlists-title" className="text-lg font-semibold text-white">Sample playlists</h2>
        <p className="mt-1 text-sm text-gray-400">
          Every saved sample is listed. The vibe and persona under each name are the latest coverage report, not a live score.
        </p>
        <input
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Filter by name, vibe, or persona"
          aria-label="Filter sample playlists"
          className="mt-4 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          autoFocus
        />
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          {loadError && <p className="text-sm text-red-300">{loadError}</p>}
          {!loadError && !playlists && <p className="text-sm text-gray-400">Loading samples…</p>}
          {playlists && filtered.length === 0 && <p className="text-sm text-gray-400">No sample matches that filter.</p>}
          <PlaylistGroup title="Genre searches" playlists={genres} activeId={activeId} loadingId={loadingId} onChoose={choose} />
          <PlaylistGroup title="Devoted artists" playlists={devoted} activeId={activeId} loadingId={loadingId} onChoose={choose} />
          <PlaylistGroup title="Charts" playlists={charts} activeId={activeId} loadingId={loadingId} onChoose={choose} />
        </div>
        {pickError && <p className="mt-3 text-sm text-red-300">{pickError}</p>}
      </div>
    </div>
  );
}

function ReportRarity({ vibeName, personaName }: { vibeName: string; personaName: string }) {
  const vibe = MUSIC_VIBES.find(item => item.name === vibeName);
  const persona = MUSIC_PERSONAS.find(item => item.name === personaName);
  if (typeof vibe?.rarity !== 'number' && !persona) return null;
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {typeof vibe?.rarity === 'number' && <RarityBadge score={vibe.rarity} caption="Vibe" />}
      {persona && <RarityBadge score={persona.rarity} caption="Persona" />}
    </span>
  );
}

function ReportArt({ vibeName, personaName }: { vibeName: string; personaName: string }) {
  const vibe = MUSIC_VIBES.find(item => item.name === vibeName);
  const persona = MUSIC_PERSONAS.find(item => item.name === personaName);
  if (!vibe?.image && !persona) return null;
  return (
    <span className="flex shrink-0 items-center gap-1">
      {vibe?.image && (
        <img src={vibe.image} alt="" className="h-9 w-9 rounded-full object-cover" />
      )}
      {persona && (
        <img src={personaPortraitSrc(persona.id)} alt="" className="h-9 w-9 rounded-md object-cover" />
      )}
    </span>
  );
}

function PlaylistGroup({
  title,
  playlists,
  activeId,
  loadingId,
  onChoose,
}: {
  title: string;
  playlists: SamplePlaylistSummary[];
  activeId: string | null;
  loadingId: string | null;
  onChoose: (id: string) => void;
}) {
  if (playlists.length === 0) return null;
  return (
    <section className="mb-4">
      <h3 className="mb-1 px-1 text-xs font-medium uppercase tracking-wide text-gray-500">{title}</h3>
      <ul>
        {playlists.map(playlist => {
          const active = playlist.id === activeId;
          const loading = playlist.id === loadingId;
          return (
            <li key={playlist.id}>
              <button
                type="button"
                onClick={() => onChoose(playlist.id)}
                disabled={loadingId !== null}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left hover:bg-gray-800 disabled:opacity-60 ${active ? 'bg-gray-800' : ''}`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <ReportArt vibeName={playlist.vibe} personaName={playlist.persona} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-white">{playlist.name}</span>
                    <span className="block truncate text-xs text-gray-400">
                      {playlist.role === 'chart' ? playlist.owner : playlist.query}
                      {loading ? ' · scoring…' : active ? ' · loaded' : ''}
                    </span>
                    {playlist.vibe && playlist.persona && (
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="truncate text-xs text-amber-200/90">
                          {playlist.vibe} · {playlist.persona}
                        </span>
                        <ReportRarity vibeName={playlist.vibe} personaName={playlist.persona} />
                      </span>
                    )}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-gray-500">{playlist.trackCount}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
