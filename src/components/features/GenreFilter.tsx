import { motion } from 'framer-motion';
import { cn } from '@/utils';
import { GenreStats } from '@/types';

interface GenreFilterProps {
  genreStats: GenreStats[];
  selectedGenres: string[];
  onGenreToggle: (genre: string) => void;
  className?: string;
}

export function GenreFilter({ 
  genreStats, 
  selectedGenres, 
  onGenreToggle,
  className = '' 
}: GenreFilterProps) {
  if (!genreStats?.length) return null;

  return (
    <motion.div 
      className={cn("flex flex-wrap gap-2 mb-4", className)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {genreStats.map(({ genre, playCount }) => {
        const isSelected = selectedGenres.includes(genre);
        return (
          <motion.button
            key={genre}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 flex items-center gap-1.5",
              isSelected 
                ? 'bg-white/10 border-white/20 text-white' 
                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10 hover:text-white'
            )}
            onClick={() => onGenreToggle(genre)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{genre}</span>
            <span className="text-xs opacity-60">{playCount}</span>
          </motion.button>
        );
      })}
      {selectedGenres.length < genreStats.length ? (
        <button
          onClick={() => genreStats.forEach(({ genre }) => {
            if (!selectedGenres.includes(genre)) onGenreToggle(genre);
          })}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors self-center ml-2"
        >
          Select All
        </button>
      ) : (
        <button
          onClick={() => genreStats.forEach(({ genre }) => {
            if (selectedGenres.includes(genre)) onGenreToggle(genre);
          })}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors self-center ml-2"
        >
          Clear All
        </button>
      )}
    </motion.div>
  );
}
