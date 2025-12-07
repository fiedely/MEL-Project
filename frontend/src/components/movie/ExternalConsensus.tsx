import React from 'react';
import { Activity, Loader2, RotateCcw } from 'lucide-react';
import type { MovieData, PopcornData } from '../../App';

interface ExternalConsensusProps {
  data: MovieData;
  popcornData: PopcornData | null;
  popcornLoading: boolean;
  onFetchPopcorn: () => void;
}

const ExternalConsensus: React.FC<ExternalConsensusProps> = ({ 
  data, 
  popcornData, 
  popcornLoading, 
  onFetchPopcorn 
}) => {
  return (
    <div>
      <h4 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2">
        <Activity size={14} /> External Consensus
      </h4>
      <div className="flex flex-col gap-3">
        
        {/* ROW 1: CRITICS (2 cols) */}
        <div className="grid grid-cols-2 gap-3">
           <div className="bg-white p-2 rounded-xl shadow-sm text-center border border-gray-100">
             <div className="text-blue-600 font-black text-xl">{data.scores.metacritic}</div>
             <div className="text-[9px] uppercase font-bold text-blue-300 mt-1">META</div>
           </div>
           <div className="bg-white p-2 rounded-xl shadow-sm text-center border border-gray-100">
             <div className="text-blue-600 font-black text-xl">{data.scores.rotten_tomatoes_critic}</div>
             <div className="text-[9px] uppercase font-bold text-blue-300 mt-1">TOMATOMETER</div>
           </div>
        </div>

        {/* ROW 2: AUDIENCES (3 cols) */}
        <div className="grid grid-cols-3 gap-3">
           <div className="bg-white p-2 rounded-xl shadow-sm text-center border border-gray-100">
             <div className="text-blue-600 font-black text-xl">{data.scores.imdb}</div>
             <div className="text-[9px] uppercase font-bold text-blue-300 mt-1">IMDB</div>
           </div>
           
           <div className="bg-white p-2 rounded-xl shadow-sm text-center border border-gray-100">
             <div className="text-blue-600 font-black text-xl">{data.vote_average.toFixed(1)}</div>
             <div className="text-[9px] uppercase font-bold text-blue-300 mt-1">TMDB</div>
           </div>

           {/* POPCORNMETER (Lavender) */}
           <div className="bg-purple-50 p-2 rounded-xl shadow-sm text-center border border-purple-100 relative overflow-hidden flex flex-col items-center justify-center">
               {popcornLoading ? (
                 <Loader2 size={18} className="text-purple-600 animate-spin" />
               ) : !popcornData ? (
                 <Loader2 size={18} className="text-purple-600 animate-spin" />
               ) : popcornData.popcorn_score === "N/A" ? (
                 <button onClick={onFetchPopcorn} className="flex flex-col items-center justify-center group w-full h-full">
                      <div className="text-purple-400 font-bold text-lg">N/A</div>
                      <div className="text-[8px] font-bold text-purple-400 flex items-center gap-1 uppercase mt-1">
                          <RotateCcw size={8} /> Retry
                      </div>
                 </button>
               ) : (
                 <>
                     <div className="text-purple-600 font-black text-xl">{popcornData.popcorn_score}</div>
                     <div className="text-[9px] uppercase font-bold text-purple-300 mt-1 text-center leading-tight">POPCORNMETER</div>
                 </>
               )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default ExternalConsensus;