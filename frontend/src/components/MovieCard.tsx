import React, { useState } from 'react';
import { Clock, Calendar, Film, DollarSign, Users, Activity, Globe, Tag, X, Maximize2, Trophy } from 'lucide-react';

interface MovieData {
  title: string;
  tagline?: string;
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
  awards?: string;
  plot: string;
  cast: string[];
  director: string;
  budget: string;
  revenue: string;
  language?: string;
  writer?: string;
  production?: string[];
  producers?: string[];
  cinematographers?: string[];
  composers?: string[];
  collection?: {
    name: string;
    parts: Array<{
      id: number;
      title: string;
      year: string;
      poster: string | null;
    }>;
  };
  vote_average: number;
  vote_count: number;
}

interface MovieCardProps {
  data: MovieData;
  onSelect: (id: number) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ data, onSelect }) => {
  const [showFullImage, setShowFullImage] = useState(false);

  if (!data) return null;

  // HELPER: Determine Revenue Color
  const getRevenueColor = () => {
    if (!data.budget || !data.revenue || data.budget === "N/A" || data.revenue === "N/A") {
      return "text-gray-700";
    }
    try {
      const budgetNum = parseInt(data.budget.replace(/[^0-9]/g, ''));
      const revenueNum = parseInt(data.revenue.replace(/[^0-9]/g, ''));
      
      if (isNaN(budgetNum) || isNaN(revenueNum)) return "text-gray-700";
      
      return revenueNum < budgetNum ? "text-red-500" : "text-emerald-600";
    } catch {
      return "text-gray-700";
    }
  };

  const revenueColor = getRevenueColor();

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
            onClick={(e) => e.stopPropagation()} 
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
            className="w-full h-full object-cover transition-transform duration-700" 
            src={data.poster} 
            alt={data.title} 
          />
          
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Maximize2 size={20} />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end">
            <div className="p-6 text-white w-full">
              <h2 className="text-3xl font-black leading-tight tracking-tight mb-2 font-sans">{data.title}</h2>
              
              <div className="flex items-center gap-2 text-sm font-medium text-lab-blue/80 mb-1">
                <Globe size={14} className="shrink-0" />
                <span>{data.language || "English"}</span>
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-lab-blue/80">
                <Film size={14} className="shrink-0" />
                <span>{data.genres.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. BODY */}
        <div className="p-6 space-y-8">
          
          {/* A. QUICK STATS */}
          <div className="grid grid-cols-4 gap-2 pb-4 border-b border-gray-100">
            <div className="text-center">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Rated</div>
              <div className="font-bold text-gray-700 flex justify-center items-center gap-1 text-xs sm:text-sm">
                  <Tag size={12} className="text-lab-dark-blue shrink-0"/> {data.rated}
              </div>
            </div>
            <div className="text-center border-l border-gray-100 px-1">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Year</div>
              <div className="font-bold text-gray-700 flex justify-center items-center gap-1 text-xs sm:text-sm">
                  <Calendar size={12} className="text-lab-dark-blue shrink-0"/> {data.year}
              </div>
            </div>
            <div className="text-center border-l border-gray-100 px-1">
               <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Time</div>
              <div className="font-bold text-gray-700 flex justify-center items-center gap-1 text-xs sm:text-sm">
                  <Clock size={12} className="text-lab-dark-blue shrink-0"/> {data.runtime_minutes}m
              </div>
            </div>
             <div className="text-center border-l border-gray-100 px-1">
               <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Type</div>
              <div className="font-bold text-gray-700 flex justify-center items-center gap-1 text-xs sm:text-sm">
                  <Film size={12} className="text-lab-dark-blue shrink-0"/> Movie
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

          {/* ACHIEVEMENT SECTION */}
          {data.awards && data.awards !== "N/A" && (
            <div>
              <h4 className="text-xs font-bold text-lab-dark-blue uppercase tracking-widest mb-3 flex items-center gap-2">
                <Trophy size={14} /> Achievements
              </h4>
              <div className="bg-lab-lavender/30 p-4 rounded-xl border border-lab-lavender text-sm font-medium text-purple-900 leading-relaxed text-center shadow-sm">
                {data.awards}
              </div>
            </div>
          )}

          {/* FINANCIAL REPORT */}
          <div>
            <h4 className="text-xs font-bold text-lab-dark-blue uppercase tracking-widest mb-3 flex items-center gap-2">
              <DollarSign size={14} /> Financial Report
            </h4>
            <div className="grid grid-cols-2 gap-3">
               {/* Budget */}
               <div className="bg-white p-3 rounded-xl shadow-sm text-center border border-gray-100">
                 <div className="text-gray-700 font-black text-lg">
                   {data.budget}
                 </div>
                 <div className="text-[9px] uppercase font-bold text-gray-400 mt-1">Budget</div>
               </div>
               
               {/* Revenue */}
               <div className="bg-white p-3 rounded-xl shadow-sm text-center border border-gray-100">
                 <div className={`${revenueColor} font-black text-lg`}>
                   {data.revenue}
                 </div>
                 <div className="text-[9px] uppercase font-bold text-gray-400 mt-1">Revenue</div>
               </div>
            </div>
          </div>

          {/* D. ABSTRACT */}
          <div>
            <h4 className="text-xs font-bold text-lab-dark-blue uppercase tracking-widest mb-2 flex items-center gap-2">
              <Film size={14} /> Abstract
            </h4>
            <div className="text-sm leading-relaxed text-gray-600 text-justify font-medium">
              {data.tagline && (
                <p className="mb-2 italic text-gray-500 border-l-2 border-lab-dark-blue pl-3">
                  "{data.tagline}"
                </p>
              )}
              {data.plot}
            </div>
          </div>

          {/* E. KEY PERSONNEL */}
          <div>
             <h4 className="text-xs font-bold text-lab-dark-blue uppercase tracking-widest mb-3 flex items-center gap-2">
               <Users size={14} /> Key Personnel
             </h4>
             <div className="grid grid-cols-[140px_1fr] gap-y-3 text-sm text-gray-600 px-1">
                
                {/* 1. Producer */}
                {data.producers && data.producers.length > 0 && (
                  <>
                    <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Producer</span>
                    <span className="font-medium text-gray-600">{data.producers.join(', ')}</span>
                  </>
                )}

                {/* 2. Director */}
                <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Director</span>
                <span className="font-medium text-gray-600">{data.director}</span>

                {/* 3. Writer */}
                <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Writer</span>
                <span className="font-medium text-gray-600">{data.writer || "Not Listed"}</span>

                {/* 4. Cinematography */}
                {data.cinematographers && data.cinematographers.length > 0 && (
                  <>
                    <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Cinematography</span>
                    <span className="font-medium text-gray-600">{data.cinematographers.join(', ')}</span>
                  </>
                )}

                {/* 5. Score (Music) */}
                {data.composers && data.composers.length > 0 && (
                  <>
                    <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Score</span>
                    <span className="font-medium text-gray-600">{data.composers.join(', ')}</span>
                  </>
                )}

                {/* 6. Production Company */}
                {data.production && data.production.length > 0 && (
                  <>
                    <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Production</span>
                    <span className="font-medium text-gray-600">{data.production.join(', ')}</span>
                  </>
                )}

                {/* 7. Actors */}
                <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Actors</span>
                <span className="font-medium text-gray-600 leading-relaxed">{data.cast.join(', ')}</span>

             </div>
          </div>

          {/* COLLECTIONS SECTION */}
          {data.collection && data.collection.parts.length > 0 && (
            <div className="pt-6 border-t border-gray-100">
               <div className="mb-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Part of the</span>
                  <h4 className="text-lg font-bold text-gray-800">{data.collection.name}</h4>
               </div>
               
               <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {data.collection.parts.map(part => (
                     <div 
                        key={part.id} 
                        onClick={() => onSelect(part.id)}
                        className="min-w-[100px] w-[100px] flex flex-col gap-1 cursor-pointer group"
                     >
                        <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden relative shadow-sm group-hover:shadow-md transition-all">
                           {part.poster ? (
                              <img src={part.poster} className="w-full h-full object-cover" alt={part.title} />
                           ) : (
                              <div className="flex items-center justify-center h-full text-gray-400">
                                 <Film size={20} />
                              </div>
                           )}
                        </div>
                        
                        <span className="text-xs font-bold text-gray-700 leading-tight line-clamp-2 group-hover:text-lab-blue transition-colors" title={part.title}>
                           {part.title}
                        </span>
                        <span className="text-[10px] text-gray-400">{part.year}</span>
                     </div>
                  ))}
               </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default MovieCard;