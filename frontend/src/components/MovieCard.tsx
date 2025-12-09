import React, { useState } from 'react';
import { 
  Clock, Calendar, Film, CircleDollarSign, 
  Globe, Tag, X, Maximize2, 
  Award, Dna, FileText, 
  Pipette, Hash, Tv, Play,
  BookOpen,
  type LucideIcon 
} from 'lucide-react';

import type { MovieData, PopcornData } from '../App';
import ExternalConsensus from './movie/ExternalConsensus';
import ProductionCredits from './movie/ProductionCredits';
import CastGrid from './movie/CastGrid';

// [FIX] Moved StatItem outside the main component
// [FIX] Replaced 'any' with 'LucideIcon'
const StatItem = ({ label, value, icon: Icon }: { label: string, value: string | number, icon: LucideIcon }) => (
  <div className="flex-1 flex flex-col justify-center items-center text-center px-1">
      <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="font-bold text-gray-700 flex justify-center items-center gap-1.5 text-xs sm:text-sm leading-tight">
          <Icon size={12} className="text-blue-700 shrink-0" /> 
          <span>{value}</span>
      </div>
  </div>
);

interface MovieCardProps {
  data: MovieData | null;
  searchBar: React.ReactNode;
  emptyState?: React.ReactNode;
  onSelect: (id: number, media_type: string) => void;
  popcornData: PopcornData | null;
  popcornLoading: boolean;
  onFetchPopcorn: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ 
    data, 
    searchBar,
    emptyState,
    onSelect, 
    popcornData, 
    popcornLoading, 
    onFetchPopcorn 
}) => {
  const [showFullImage, setShowFullImage] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  const isTV = data?.media_type === 'tv';

  const getRevenueColor = () => {
    if (!data || !data.budget || !data.revenue || data.budget === "N/A" || data.revenue === "N/A") {
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
      {/* --- MODALS --- */}
      {data && showTrailer && data.trailer_key && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowTrailer(false)}>
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
            <button className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition-colors bg-black/50 p-2 rounded-full" onClick={() => setShowTrailer(false)}><X size={24} /></button>
            <iframe src={`https://www.youtube.com/embed/${data.trailer_key}?autoplay=1`} title="Trailer" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>
        </div>
      )}
      {data && showFullImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer" onClick={() => setShowFullImage(false)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors" onClick={() => setShowFullImage(false)}><X size={32} /></button>
          <img src={data.poster} alt={data.title} className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-fade-in" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* --- MAIN CONTAINER --- */}
      <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-lab overflow-hidden border border-lab-border mt-2 mb-6 transition-all duration-300">
        
        {/* HEADER */}
        <div className="bg-purple-100/50 p-4 flex items-center gap-3 border-b border-purple-200/50">
          <div className="bg-white p-2 rounded-full shadow-sm">
            <BookOpen size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-black text-gray-800 tracking-tight text-lg">
              SPECIMEN DETAILS
            </h3>
            <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">
              Primary Data Archive
            </p>
          </div>
        </div>

        {/* SEARCH BAR AREA */}
        <div className="p-4 bg-gray-50/50 border-b border-gray-100">
            {searchBar}
        </div>

        {/* CONTENT AREA */}
        {!data && emptyState && (
            <div className="p-6">
                {emptyState}
            </div>
        )}

        {data && (
            <>
                {/* HERO IMAGE */}
                <div className="relative aspect-[2/3] w-full bg-gray-100 group overflow-hidden border-b border-gray-100">
                <img 
                    className="w-full h-full object-cover transition-transform duration-700" 
                    src={data.poster} 
                    alt={data.title}
                    onClick={() => setShowFullImage(true)}
                    style={{ cursor: 'pointer' }}
                />
                <div className="absolute top-4 right-4 flex gap-2">
                    {data.trailer_key && (
                    <button onClick={() => setShowTrailer(true)} className="bg-white/20 hover:bg-purple-600 hover:text-white backdrop-blur-md p-2 rounded-full text-white transition-all duration-300 shadow-sm" title="Watch Trailer"><Play size={20} fill="currentColor" /></button>
                    )}
                    <button onClick={() => setShowFullImage(true)} className="bg-black/40 hover:bg-black/60 backdrop-blur-md p-2 rounded-full text-white/80 hover:text-white transition-all duration-300"><Maximize2 size={20} /></button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end pointer-events-none">
                    <div className="p-6 text-white w-full">
                    <h2 className="text-3xl font-black leading-tight tracking-tight mb-2 font-sans">{data.title}</h2>
                    <div className="flex items-center gap-2 text-sm font-medium text-lab-blue/80 mb-1">
                        <Globe size={14} className="shrink-0" /><span>{data.language || "English"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-lab-blue/80">
                        {isTV ? <Tv size={14} className="shrink-0"/> : <Film size={14} className="shrink-0" />}<span>{data.genres.join(', ')}</span>
                    </div>
                    </div>
                </div>
                </div>

                {/* QUICK STATS - EDGE TO EDGE */}
                <div className="w-full bg-white border-b border-gray-100">
                    <div className="flex w-full divide-x divide-gray-100 py-4">
                        <StatItem label="Rated" value={data.rated} icon={Tag} />
                        <StatItem label={isTV ? 'Timeline' : 'Year'} value={data.year} icon={Calendar} />
                        <StatItem label={isTV ? 'Status' : 'Time'} value={isTV ? data.status || 'N/A' : `${data.runtime_minutes}m`} icon={Clock} />
                        <StatItem label="Type" value={isTV ? 'Series' : 'Movie'} icon={isTV ? Tv : Film} />
                    </div>
                </div>

                {/* DETAILS BODY */}
                <div className="p-6 space-y-8">
                
                {/* EXTERNAL CONSENSUS */}
                <ExternalConsensus 
                    data={data} 
                    popcornData={popcornData} 
                    popcornLoading={popcornLoading} 
                    onFetchPopcorn={onFetchPopcorn} 
                />

                {/* DISTINCTIONS */}
                {data.awards && data.awards !== "N/A" && (
                    <div>
                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Award size={14} /> Distinctions
                    </h4>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm font-medium text-blue-900 leading-relaxed text-center shadow-sm">
                        {data.awards}
                    </div>
                    </div>
                )}

                {/* FISCAL ANALYSIS */}
                {!isTV && (
                    <div>
                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <CircleDollarSign size={14} /> Fiscal Analysis
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-xl shadow-sm text-center border border-gray-100">
                        <div className="text-gray-700 font-bold text-lg">{data.budget}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Budget</div>
                        </div>
                        <div className="bg-white p-3 rounded-xl shadow-sm text-center border border-gray-100">
                        <div className={`${revenueColor} font-bold text-lg`}>{data.revenue}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Revenue</div>
                        </div>
                    </div>
                    </div>
                )}

                {/* SPECIMEN ABSTRACT */}
                <div>
                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <FileText size={14} /> Specimen Abstract
                    </h4>
                    <div className="text-sm leading-relaxed text-gray-600 text-justify font-medium">
                    {data.tagline && (
                        <p className="mb-3 italic text-gray-500 border-l-2 border-blue-200 pl-3">"{data.tagline}"</p>
                    )}
                    {data.plot}
                    </div>
                    {data.keywords && data.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        <div className="flex items-center text-gray-400 mr-1"><Hash size={12} /></div>
                        {data.keywords.map((kw, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wide rounded-md">{kw}</span>
                        ))}
                    </div>
                    )}
                </div>

                {/* LEAD RESEARCHERS */}
                <ProductionCredits data={data} />

                {/* PRINCIPAL SUBJECTS */}
                <CastGrid cast={data.cast} />

                {/* LINEAGE / COLLECTIONS */}
                {data.collection && data.collection.parts.length > 0 && (
                    <div className="pt-6 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Dna size={14} /> {isTV ? 'Season Manifest' : 'Lineage & Taxonomy'}
                    </h4>
                    <div className="mb-2">
                        <h4 className="text-lg font-bold text-gray-800">{data.collection.name}</h4>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {data.collection.parts.map(part => (
                            <div key={part.id} onClick={() => part.media_type === 'movie' ? onSelect(part.id, 'movie') : null} className={`min-w-[100px] w-[100px] flex flex-col gap-1 group ${part.media_type === 'movie' ? 'cursor-pointer' : ''}`}>
                                <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden relative shadow-sm group-hover:shadow-md transition-all">
                                {part.poster ? <img src={part.poster} className="w-full h-full object-cover" alt={part.title} /> : <div className="flex items-center justify-center h-full text-gray-400"><Film size={20} /></div>}
                                </div>
                                <span className="text-xs font-bold text-gray-700 leading-tight line-clamp-2 group-hover:text-blue-700 transition-colors" title={part.title}>{part.title}</span>
                                <span className="text-[10px] text-gray-400">{part.year}</span>
                            </div>
                        ))}
                    </div>
                    </div>
                )}

                {/* COMPARATIVE SAMPLES */}
                {data.recommendations && data.recommendations.length > 0 && (
                    <div className="pt-6 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Pipette size={14} /> Comparative Samples
                    </h4>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {data.recommendations.map(rec => (
                            <div key={rec.id} onClick={() => onSelect(rec.id, rec.media_type || 'movie')} className="min-w-[100px] w-[100px] flex flex-col gap-1 cursor-pointer group">
                                <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden relative shadow-sm group-hover:shadow-md transition-all">
                                {rec.poster ? <img src={rec.poster} className="w-full h-full object-cover" alt={rec.title} /> : <div className="flex items-center justify-center h-full text-gray-400"><Film size={20} /></div>}
                                </div>
                                <span className="text-xs font-bold text-gray-700 leading-tight line-clamp-2 group-hover:text-blue-700 transition-colors" title={rec.title}>{rec.title}</span>
                                <span className="text-[10px] text-gray-400">{rec.year}</span>
                            </div>
                        ))}
                    </div>
                    </div>
                )}
                </div>
            </>
        )}
      </div>
    </>
  );
};

export default MovieCard;