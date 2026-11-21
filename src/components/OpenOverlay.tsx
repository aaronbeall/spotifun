import { ArrowUpRight } from 'lucide-react';

interface OpenOverlayProps {
  size?: 'xs' | 'sm' | 'md';
}

const SIZES = {
  xs: { button: 'w-4 h-4', icon: 'w-2 h-2' },
  sm: { button: 'w-7 h-7', icon: 'w-3.5 h-3.5' },
  md: { button: 'w-10 h-10', icon: 'w-5 h-5' },
};

/** Hover hint that the card opens its Last.fm page */
export function OpenOverlay({ size = 'md' }: OpenOverlayProps) {
  const { button, icon } = SIZES[size];
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className={`${button} rounded-full bg-violet-500 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform`}>
        <ArrowUpRight className={`${icon} text-white`} />
      </div>
    </div>
  );
}
