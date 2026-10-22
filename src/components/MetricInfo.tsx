import { Info } from 'lucide-react';
import { useState, useRef, useEffect, useId } from 'react';
import { cn } from '@/utils';

interface MetricInfoProps {
  description: string;
  className?: string;
}

/**
 * Small, subtle info icon that shows a tooltip on hover, tap, or focus.
 * Keyboard accessible and mobile-friendly.
 */
export function MetricInfo({ description, className = '' }: MetricInfoProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const tooltipId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate tooltip position to avoid going off-screen
  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    
    // If tooltip would go off top of screen, show below instead
    if (trigger.top - tooltip.height < 10) {
      setPosition('bottom');
    } else {
      setPosition('top');
    }
  }, [isVisible]);

  return (
    <span className={cn('inline-flex items-center', className)}>
      <button
        ref={triggerRef}
        type="button"
        className="ml-1 inline-flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors focus:outline-none focus-visible:text-gray-300"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        onClick={(e) => {
          e.preventDefault();
          setIsVisible(!isVisible);
        }}
        aria-describedby={tooltipId}
        aria-label="More information"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={cn(
            'absolute z-50 px-3 py-2 text-xs text-gray-200 bg-gray-900 border border-gray-700 rounded-lg shadow-xl',
            'max-w-xs pointer-events-none',
            position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
            'left-1/2 -translate-x-1/2'
          )}
          style={{
            // Ensure readable in dark theme
            backgroundColor: 'rgba(17, 24, 39, 0.98)',
          }}
        >
          <div className="text-left leading-relaxed">
            {description}
          </div>
          {/* Arrow */}
          <div
            className={cn(
              'absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-gray-700 rotate-45',
              position === 'top' ? 'bottom-[-5px] border-r border-b' : 'top-[-5px] border-l border-t'
            )}
          />
        </div>
      )}
    </span>
  );
}
