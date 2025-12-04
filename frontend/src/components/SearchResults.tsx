import React from 'react';
import { Film, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

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
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  candidates, 
  onSelect, 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 animate-fade-in-up">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 text-center">
        Search Results
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 items-start">
        {candidates.map((movie) => (
          <button 
            key={movie.id}
            onClick={() => onSelect(movie.id)}
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

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="text-sm font-bold text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;