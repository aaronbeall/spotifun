import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import React from 'react';

interface SequenceNavigatorProps {
  current: number;
  setCurrent: (idx: number) => void;
  items: Array<{
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  className?: string;
}

export const SequenceNavigator: React.FC<SequenceNavigatorProps> = ({ current, setCurrent, items, className = '' }) => {
  const goTo = (idx: number) => setCurrent((idx + items.length) % items.length);

  return (
    <div className={`flex flex-col items-center gap-2 py-2 ${className}`}>
      <nav className="flex items-center gap-2" aria-label="Profile Sequence Navigator">
        <button
          onClick={() => goTo(current - 1)}
          className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="relative flex items-center gap-1 bg-gray-900/60 border border-gray-700/60 rounded-full p-1">
          {items.map((item, idx) => {
            const Icon = item.icon;
            const isActive = idx === current;
            return (
              <button
                key={item.label}
                onClick={() => setCurrent(idx)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors focus:outline-none ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
                aria-current={isActive ? 'step' : undefined}
                aria-label={item.label}
              >
                {isActive && (
                  <motion.span
                    layoutId="sequence-nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-md"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => goTo(current + 1)}
          className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </nav>

      {/* Carousel dot indicators */}
      <div className="flex items-center gap-1.5">
        {items.map((item, idx) => {
          const isActive = idx === current;
          return (
            <button
              key={item.label}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                isActive ? 'w-6 bg-white' : 'w-1.5 bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Go to ${item.label}`}
            />
          );
        })}
      </div>
    </div>
  );
};

// Usage example:
// <SequenceNavigator
//   current={currentIdx}
//   setCurrent={setCurrentIdx}
//   items={[
//     { label: 'Vibes', icon: Award },
//     { label: 'Spectrum', icon: BarChart },
//     { label: 'Flow', icon: Activity },
//     { label: 'Popularity', icon: Star },
//     { label: 'Persona', icon: User },
//   ]}
// />
