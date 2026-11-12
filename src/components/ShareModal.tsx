'use client';

import { useRef } from 'react';
import { X } from 'lucide-react';
import { ShareCardTemplate, ShareContent } from './ShareCardTemplate';
import { ShareCardButton } from './ShareCardButton';

interface ShareModalProps {
  content: ShareContent | null;
  onClose: () => void;
}

export function ShareModal({ content, onClose }: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!content) return null;

  const filename = `spotifun-${content.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div className="relative my-auto" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-3 -right-3 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-gray-800 text-white shadow-lg hover:bg-gray-700"
        >
          <X className="w-4 h-4" />
        </button>

        <div ref={cardRef} className="rounded-2xl overflow-hidden shadow-2xl">
          <ShareCardTemplate content={content} />
        </div>

        <div className="mt-4 flex justify-center">
          <ShareCardButton
            targetRef={cardRef}
            filename={filename}
            title={`My ${content.eyebrow} — Spotifun`}
            text={`Check out my ${content.title} on Spotifun!`}
            className="!bg-white/10 !border-white/20"
          />
        </div>
      </div>
    </div>
  );
}
