import { Star } from 'lucide-react';
import { useState, useMemo, HTMLProps } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: React.ComponentType<HTMLProps<unknown>>;
  className?: string;
  title: string;
  value: string | number;
  description: string;
  gradient: string;
  iconColor: string;
  items?: Array<{
    name: string;
    count: number;
    image?: string;
    bgClass?: string;
    textClass?: string;
  }>;
  badge?: {
    label: string;
    description: string;
    score: number;
  };
  score?: number;
  scoreLabel?: string;
  mostPlayed?: Array<{ name: string; count: number }>;
  children?: React.ReactNode;
}

export const StatCard = ({
                        icon: Icon,
                        title,
                        value,
                        description,
                        gradient,
                        iconColor,
                        items = [],
                        badge,
                        score,
                        scoreLabel = 'Score',
                        mostPlayed = [],
                        children
                      }: StatCardProps) => {
  const [showAllPills, setShowAllPills] = useState(false);
  const displayedPills = useMemo(
    () => (showAllPills ? mostPlayed : mostPlayed.slice(0, 3)),
    [showAllPills, mostPlayed]
  );
  const hasMorePills = mostPlayed.length > 3;

  return (
    <div className="relative h-full overflow-hidden rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-black/10">
      {/* Background gradient with noise texture */}
      <div
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          background: gradient,
          backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48ZmlsdGVyIGlkPSJub2lzZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuMDUiIG51bU9jdGF2ZXM9IjUiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjAyNSIvPjwvc3ZnPg==")'
        }}
      />

      {/* Glow effect */}
      <div
        className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />

      {/* Badge in upper right */}
      {badge && (
        <div className="absolute top-4 right-4 z-20">
          <div className="group relative">
            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-pink-500/90 text-white hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 cursor-help shadow-md backdrop-blur-sm border border-white/10">
              <Star className="w-3.5 h-3.5" fill="currentColor" />
              <span className="drop-shadow-sm">{badge.label}</span>
            </div>
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute top-full right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-sm text-white text-sm rounded-lg shadow-xl border border-white/10 p-3 pointer-events-none z-50">
                {/* Tooltip Arrow */}
                <div className="absolute -top-2 right-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-gray-900/95"></div>
              <div className="flex items-center gap-2 font-semibold text-white mb-1.5">
                <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                {badge.label}
              </div>
              <p className="text-gray-300 text-xs mb-2 leading-snug">{badge.description}</p>
              <div className="flex items-center gap-2 text-xs text-gray-300 pt-2 border-t border-white/5">
                <div className="w-full bg-gray-700/80 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-1.5 rounded-full"
                    style={{ width: `${badge.score}%` }}
                  ></div>
                </div>
                <span className="whitespace-nowrap text-xs font-medium">{badge.score}/100</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 h-full flex flex-col">
        {/* Header with icon and title */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${iconColor}20 0%, ${iconColor}05 100%)`,
                boxShadow: `0 4px 20px -5px ${iconColor}40, 0 1px 2px -1px ${iconColor}20`
              }}
            >
              <Icon className="w-5 h-5" style={{ color: iconColor }} />
            </div>
            <div className="pt-0.5">
              <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider">{title}</h3>
              <p
                className="text-2xl font-bold mt-1.5 leading-none"
                style={{
                  color: iconColor,
                  textShadow: `0 0 8px ${iconColor}40`
                }}
              >
                {value}
              </p>
              {/*<p className="text-sm text-white/60 mt-1.5">{description}</p>*/}
            </div>
          </div>

          {/* Stacked items */}
          {items.length > 0 && (
            <div className="flex -space-x-2">
              {items.slice(0, 3).map((item, i) => {
                const bgClass = item.bgClass ? `${item.bgClass}` : 'bg-gray-800';
                const borderClass = 'border-2 border-white/10';
                const textClass = item.textClass || 'text-white';

                return (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-xl overflow-hidden transition-all duration-300 hover:z-10 hover:scale-110 hover:shadow-lg group relative ${
                      i > 0 ? '-ml-2' : ''
                    }`}
                    style={{
                      zIndex: 3 - i,
                      boxShadow: '0 4px 12px -2px rgba(0,0,0,0.2)'
                    }}
                    title={`${item.name} • ${item.count} plays`}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center text-xs font-semibold ${bgClass} ${textClass} ${borderClass}`}
                      >
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold bg-black/60 px-1.5 py-0.5 rounded-full">
                        {item.count}
                      </span>
                    </div>
                  </div>
                );
              })}
              {items.length > 3 && (
                <div
                  className="w-9 h-9 rounded-xl bg-white/5 border-2 border-white/10 flex items-center justify-center text-xs font-medium text-white/80 transition-all hover:bg-white/10 hover:scale-105"
                  style={{
                    boxShadow: '0 4px 12px -2px rgba(0,0,0,0.2)'
                  }}
                >
                  +{items.length - 3}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Score/Progress */}
        {score !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/70 font-medium">{scoreLabel}</span>
              <span
                className="font-semibold"
                style={{
                  color: iconColor,
                  textShadow: `0 0 8px ${iconColor}40`
                }}
              >
                {Math.round(score * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${score * 100}%`,
                  background: `linear-gradient(90deg, ${iconColor}, ${iconColor}cc)`,
                  boxShadow: `0 0 8px ${iconColor}80`
                }}
              />
            </div>
          </div>
        )}

        {/* Most Played/Popular Pills */}
        {mostPlayed.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-medium text-white/70 mb-2.5">
              {title === 'Popularity' ? 'Most Popular' : 'Most Played'}
            </p>
            <div className="flex flex-wrap gap-2">
              {displayedPills.map((item, i) => (
                <motion.div
                  key={i}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg backdrop-blur-sm flex items-center gap-1.5 max-w-full transition-all duration-200 hover:scale-[1.03]"
                  style={{
                    backgroundColor: `${iconColor}0f`,
                    color: 'white',
                    border: `1px solid ${iconColor}30`,
                    boxShadow: `0 2px 8px -1px ${iconColor}10`
                  }}
                  whileHover={{
                    backgroundColor: `${iconColor}20`,
                    borderColor: `${iconColor}50`,
                    boxShadow: `0 4px 12px -1px ${iconColor}20`
                  }}
                  title={`${item.name} • ${
                    title === 'Popularity' ? `${item.count}%` : `${item.count} plays`
                  }`}
                >
                  <span className="truncate max-w-[100px] font-medium">{item.name}</span>
                  <span
                    className="flex-shrink-0 font-semibold"
                    style={{ color: iconColor }}
                  >
                    {title === 'Popularity' ? `${item.count}%` : item.count}
                  </span>
                </motion.div>
              ))}
              {hasMorePills && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllPills(!showAllPills);
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all"
                  style={{
                    backgroundColor: `${iconColor}0a`,
                    color: iconColor,
                    border: `1px solid ${iconColor}20`,
                  }}
                  whileHover={{
                    backgroundColor: `${iconColor}15`,
                    borderColor: `${iconColor}40`,
                  }}
                  whileTap={{ scale: 0.97 }}
                  title={showAllPills ? 'Show less' : `Show ${mostPlayed.length - 3} more`}
                >
                  {showAllPills ? (
                    <>
                      <span className="opacity-90">Show less</span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-80"
                      >
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                    </>
                  ) : (
                    <>
                      <span className="opacity-90">+{mostPlayed.length - 3} more</span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-80"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        )}

        {children && <div className="mt-5">{children}</div>}
      </div>
    </div>
  );
};