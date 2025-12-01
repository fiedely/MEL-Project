import React, { useState } from 'react';
import { Clock, Calendar, Film, DollarSign, Users, Activity, Globe, Tag, X, Maximize2 } from 'lucide-react';

interface MovieData {
  title: string;
  poster: string;
  rated: string;
  genres: string[];
  year: string;
  runtime_minutes: number;
  scores: {
    imdb: string;
    rotten_tomatoes_critic: string;
    metacritic: string;
  };
  plot: string;
  cast: string[];
  director: string;
  budget: string;
  revenue: string;
  language?: string;
  writer?: string;
  vote_average: number;
  vote_count: number;
}

interface MovieCardProps {
  data: MovieData;
}

const MovieCard: React.FC<MovieCardProps> = ({ data }) => {
  const [showFullImage, setShowFullImage] = useState(false);

  if (!data) return null;

  return (
    <>
      {/* --- FULL SCREEN IMAGE MODAL --- */}
      {showFullImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowFullImage(false)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            onClick={() => setShowFullImage(false)}
          >
            <X size={32} />
          </button>
          <img 
            src={data.poster} 
            alt={data.title} 
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
          />
        </div>
      )}

      {/* --- MAIN CARD --- */}
      <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-lab overflow-hidden border border-lab-border my-6 transition-all duration-300">
        
        {/* 1. HEADER (Image) */}
        <div 
          className="relative aspect-[2/3] w-full bg-gray-100 group cursor-pointer overflow-hidden"
          onClick={() => setShowFullImage(true)}
        >
          <img 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            src={data.poster} 
            alt={data.title} 
          />
          
          {/* Hover Hint */}
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Maximize2 size={20} />
          </div>

          {/* Text Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end">
            <div className="p-6 text-white w-full">
              <h2 className="text-3xl font-black leading-tight tracking-tight mb-2 font-sans">{data.title}</h2>
              
              {/* LANGUAGE (Globe Icon + All Languages) */}
              <div className="flex items-center gap-2 text-sm font-medium text-lab-blue/80 mb-1">
                <Globe size={14} />
                <span>{data.language || "English"}</span>
              </div>

              {/* GENRES (Film Icon + Matched Style) */}
              <div className="flex items-center gap-2 text-sm font-medium text-lab-blue/80">
                <Film size={14} />
                <span>{data.genres.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. BODY */}
        <div className="p-6 space-y-8">
          
          {/* A. QUICK STATS (4 Columns: Rated, Year, Time, Type) */}
          <div className="grid grid-cols-4 gap-2 pb-4 border-b border-gray-100">
            
            <div className="text-center">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Rated</div>
              <div className="font-bold text-gray-700 flex justify-center items-center gap-1 text-xs sm:text-sm">
                  <Tag size={12} className="text-lab-dark-blue"/> {data.rated}
              </div>
            </div>

            <div className="text-center border-l border-gray-100 px-1">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Year</div>
              <div className="font-bold text-gray-700 flex justify-center items-center gap-1 text-xs sm:text-sm">
                  <Calendar size={12} className="text-lab-dark-blue"/> {data.year}
              </div>
            </div>

            <div className="text-center border-l border-gray-100 px-1">
               <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Time</div>
              <div className="font-bold text-gray-700 flex justify-center items-center gap-1 text-xs sm:text-sm">
                  <Clock size={12} className="text-lab-dark-blue"/> {data.runtime_minutes}m
              </div>
            </div>
             
             <div className="text-center border-l border-gray-100 px-1">
               <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Type</div>
              <div className="font-bold text-gray-700 flex justify-center items-center gap-1 text-xs sm:text-sm">
                  <Film size={12} className="text-lab-dark-blue"/> Movie
              </div>
            </div>

          </div>
          
          {/* B. CONSOLIDATED METRICS */}
          <div>
             <h4 className="text-xs font-bold text-lab-dark-blue uppercase tracking-widest mb-3 flex items-center gap-2">
               <Activity size={14} /> Consolidated Metrics
             </h4>
             
             <div className="grid grid-cols-3 gap-3">
               <div className="bg-white p-2 rounded-xl shadow-sm text-center border border-gray-100">
                 <div className="text-yellow-500 font-black text-lg flex justify-center items-center gap-1">
                   {data.scores.imdb}
                 </div>
                 <div className="text-[9px] uppercase font-bold text-gray-400 mt-1">IMDb</div>
               </div>
               <div className="bg-white p-2 rounded-xl shadow-sm text-center border border-gray-100">
                 <div className="text-green-600 font-black text-lg">
                   {data.scores.metacritic}
                 </div>
                 <div className="text-[9px] uppercase font-bold text-gray-400 mt-1">Meta</div>
               </div>
               <div className="bg-white p-2 rounded-xl shadow-sm text-center border border-gray-100">
                 <div className="text-red-500 font-black text-lg">
                   {data.scores.rotten_tomatoes_critic}
                 </div>
                 <div className="text-[9px] uppercase font-bold text-gray-400 mt-1">Tomatometer</div>
               </div>
             </div>
          </div>

          {/* C. FINANCIAL REPORT */}
          <div>
            <h4 className="text-xs font-bold text-lab-dark-blue uppercase tracking-widest mb-3 flex items-center gap-2">
              <DollarSign size={14} /> Financial Report
            </h4>
            
            <div className="grid grid-cols-[80px_1fr] gap-y-2 text-sm text-gray-600 px-1">
               <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Budget</span>
               <span className="font-semibold text-gray-800">{data.budget}</span>

               <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Revenue</span>
               <span className="font-semibold text-gray-800">{data.revenue}</span>
            </div>
          </div>

          {/* D. ABSTRACT */}
          <div>
            <h4 className="text-xs font-bold text-lab-dark-blue uppercase tracking-widest mb-2 flex items-center gap-2">
              <Film size={14} /> Abstract
            </h4>
            <p className="text-sm leading-relaxed text-gray-600 text-justify font-medium">
              {data.plot}
            </p>
          </div>

          {/* E. KEY PERSONNEL */}
          <div>
             <h4 className="text-xs font-bold text-lab-dark-blue uppercase tracking-widest mb-3 flex items-center gap-2">
               <Users size={14} /> Key Personnel
             </h4>
             <div className="grid grid-cols-[80px_1fr] gap-y-3 text-sm text-gray-600 px-1">
                <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Director</span>
                <span className="font-semibold text-gray-800">{data.director}</span>

                <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Writer</span>
                <span className="font-semibold text-gray-800">{data.writer || "Not Listed"}</span>

                <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Actors</span>
                <span className="font-medium leading-relaxed">{data.cast.join(', ')}</span>
             </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default MovieCard;