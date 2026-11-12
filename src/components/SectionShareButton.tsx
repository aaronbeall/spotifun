import { Share2 } from 'lucide-react';

/** Icon that opens a share graphic. The preview itself keeps a labeled Share button. */
export function SectionShareButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Share"
      className="shrink-0 rounded-full border border-white/10 bg-black/30 p-2 text-gray-200 transition-colors hover:bg-black/50 hover:text-white"
    >
      <Share2 className="h-4 w-4" />
    </button>
  );
}
