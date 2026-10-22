import * as Tooltip from '@radix-ui/react-tooltip';
import { Info } from 'lucide-react';

interface MetricInfoProps {
  description: string;
  className?: string;
}

/**
 * Small, subtle info icon that shows a tooltip on hover, tap, or focus.
 * Keyboard accessible and mobile-friendly with proper positioning and Portal rendering.
 * Note: Requires Tooltip.Provider in app layout.
 */
export function MetricInfo({ description, className = '' }: MetricInfoProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          className={`ml-1 inline-flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors focus:outline-none focus-visible:text-gray-300 focus-visible:ring-1 focus-visible:ring-gray-400 rounded ${className}`}
          aria-label="More information"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="z-50 px-3 py-2 text-xs text-gray-200 bg-gray-900/98 border border-gray-700 rounded-lg shadow-xl max-w-xs leading-relaxed"
          sideOffset={5}
          collisionPadding={10}
          side="top"
          align="center"
        >
          {description}
          <Tooltip.Arrow className="fill-gray-900/98" width={12} height={6} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
