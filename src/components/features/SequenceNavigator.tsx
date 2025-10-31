import { Award, BarChart, Activity, Star, User } from 'lucide-react';
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
  return (
    <nav className={`flex items-center gap-4 justify-center py-2 ${className}`} aria-label="Profile Sequence Navigator">
      {items.map((item, idx) => {
        const Icon = item.icon;
        const isActive = idx === current;
        return (
          <button
            key={item.label}
            onClick={() => setCurrent(idx)}
            className={`flex flex-col items-center px-2 focus:outline-none transition-all ${isActive ? 'text-white scale-110' : 'text-gray-400 hover:text-white'}`}
            aria-current={isActive ? 'step' : undefined}
            aria-label={item.label}
          >
            <Icon className={`w-6 h-6 mb-1 ${isActive ? 'drop-shadow-lg' : ''}`} />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
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
