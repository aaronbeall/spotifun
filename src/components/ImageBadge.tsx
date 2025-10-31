import { HTMLProps } from 'react';

interface ImageBadgeProps {
  title: string;
  name: string;
  image?: string;
  count: number;
  color: string;
  icon: React.ComponentType<HTMLProps<'svg'>>;
  className?: string;
  percent?: number;
}

export const ImageBadge = ({ title, name, image, count, color, icon: Icon, className = '', percent }: ImageBadgeProps) => {
  return (
    <div className={`flex flex-col items-center group hover:scale-105 transition-all ${className}`}>
      {/* Header with icon and title */}
      <div className="flex items-center gap-2 text-sm text-white/70 mb-3">
        <Icon className="w-4 h-4" style={{ color: color }} />
        <span className="font-medium">{title}</span>
      </div>

      <div className="relative">
        {/* Image container - larger size */}
        <div className="w-32 h-32 rounded-full overflow-hidden border-2 flex items-center justify-center transition-transform group-hover:scale-110"
          style={{
            borderColor: color,
            boxShadow: `0 0 16px ${color}40`
          }}
        >
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/80"
              style={{ backgroundColor: `${color}20` }}
            >
              {name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
            </div>
          )}
          {/* Popularity percent badge */}
          {typeof percent === 'number' && (
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full min-w-[3rem] font-bold text-xs backdrop-blur-md border border-white/10 text-white shadow"
              style={{
                backgroundColor: `${color}80`,
                borderColor: `${color}30`,
                textShadow: `0 1px 2px rgba(0,0,0,0.3)`,
                boxShadow: `0 2px 12px ${color}20, inset 0 1px 1px ${color}30`,
              }}
            >
              {percent}%
            </div>
          )}
        </div>
      </div>

      {/* Name and plays */}
      <div className="mt-4 text-center">
        <h3 className="text-base font-semibold text-white line-clamp-1 group-hover:text-white/90 transition-colors">
          {name}
        </h3>
        <div className="text-xs text-white/60 mt-1 group-hover:text-white/70 transition-colors">
          {count} {count === 1 ? 'play' : 'plays'}
        </div>
      </div>
    </div>
  );
};