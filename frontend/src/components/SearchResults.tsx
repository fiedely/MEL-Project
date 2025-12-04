import React from 'react';
import { Film, Calendar } from 'lucide-react';

interface Candidate {
  id: number;
  title: string;
  year: string;
  poster: string | null;
  overview: string;
}

interface SearchResultsProps {
  candidates: Candidate[];
  onSelect: (id: number) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ candidates, onSelect }) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 animate-fade-in-up">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 text-center">
        Did you mean...
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 items-start">
        {candidates.map((movie) => (
          <button 
            key={movie.id}
            onClick={() => onSelect(movie.id)}
            // [FIX] Removed 'hover:scale-105'
            className="group relative flex flex-col bg-white rounded-xl md:rounded-2xl shadow-lab overflow-hidden hover:shadow-xl transition-all duration-300 text-left w-full"
          >
            {/* Poster Image */}
            <div className="w-full aspect-[2/3] bg-gray-200 relative">
              {movie.poster ? (
                <img 
                  src={movie.poster} 
                  alt={movie.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Film size={32} />
                </div>
              )}
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>

            {/* Info Container */}
            <div className="p-2 md:p-4 w-full">
              
              <h3 className="font-bold text-sm md:text-lg text-gray-800 leading-tight mb-1 md:mb-2 group-hover:text-lab-blue transition-colors line-clamp-2 md:line-clamp-none">
                {movie.title}
              </h3>
              
              <div className="flex items-center text-gray-500 text-[10px] md:text-sm mb-2 md:mb-3">
                <Calendar size={12} className="mr-1" />
                <span>{movie.year}</span>
              </div>
              
              <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed">
                {movie.overview || "No overview available."}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;