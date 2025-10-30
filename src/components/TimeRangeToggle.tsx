import React from 'react';
import { TimeRange } from '@/types';

interface TimeRangeToggleProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

const options: { value: TimeRange; label: string }[] = [
  { value: 'short_term', label: '4 weeks' },
  { value: 'medium_term', label: '6 months' },
  { value: 'long_term', label: 'All time' },
];

export default function TimeRangeToggle({ value, onChange, disabled, isLoading, className = '' }: TimeRangeToggleProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {isLoading && (
        <span className="flex items-center text-xs text-gray-400 mr-3">
          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-1"></span>
          Updating...
        </span>
      )}
      <div className="inline-flex rounded-lg bg-gray-700/60 p-1" role="group">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            disabled={disabled || isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-400
              ${value === opt.value
                ? 'bg-green-600 text-white shadow'
                : 'bg-transparent text-gray-200 hover:bg-gray-600'}
              ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
