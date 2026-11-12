import { Share2 } from 'lucide-react';

/** Opens the share graphic for a section or a single collection item. */
export function SectionShareButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-gray-600 bg-gray-800/50 px-4 py-2 text-sm text-gray-300 transition-colors hover:border-gray-400 hover:bg-gray-700/50 hover:text-white"
    >
      <Share2 className="h-4 w-4" />
      Share
    </button>
  );
}
