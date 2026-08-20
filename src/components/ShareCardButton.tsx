'use client';

import { useState, type RefObject } from 'react';
import { Share2, Download, Check, AlertCircle } from 'lucide-react';
import { toPng } from 'html-to-image';

interface ShareCardButtonProps {
  targetRef: RefObject<HTMLElement | null>;
  filename: string;
  title?: string;
  text?: string;
  className?: string;
}

type Status = 'idle' | 'working' | 'done' | 'error';

export function ShareCardButton({ targetRef, filename, title, text, className = '' }: ShareCardButtonProps) {
  const [status, setStatus] = useState<Status>('idle');

  const handleShare = async () => {
    if (!targetRef.current || status === 'working') return;
    setStatus('working');
    try {
      const dataUrl = await toPng(targetRef.current, { pixelRatio: 2, cacheBust: true });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${filename}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title, text });
      } else {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${filename}.png`;
        link.click();
      }
      setStatus('done');
      setTimeout(() => setStatus('idle'), 1800);
    } catch (error) {
      // The user cancelling the native share sheet isn't a real failure
      if ((error as Error)?.name === 'AbortError') {
        setStatus('idle');
        return;
      }
      console.error('Failed to export card:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 1800);
    }
  };

  const label = status === 'done' ? 'Saved' : status === 'working' ? 'Preparing…' : status === 'error' ? 'Failed' : 'Share';
  const Icon = status === 'done' ? Check : status === 'working' ? Download : status === 'error' ? AlertCircle : Share2;

  return (
    <button
      onClick={handleShare}
      disabled={status === 'working'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10 transition-colors disabled:opacity-50 ${className}`}
    >
      <Icon className={`w-3.5 h-3.5 ${status === 'working' ? 'animate-pulse' : ''}`} />
      {label}
    </button>
  );
}
