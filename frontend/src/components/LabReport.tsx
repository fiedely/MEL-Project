import React, { useState, useEffect } from 'react';
import { FlaskConical, Vote, MessageSquareQuote, Loader2 } from 'lucide-react';

interface LabReportProps {
  loading: boolean;
  movie: {
    vote_average: number;
    vote_count: number;
  };
  data: {
    facts: {
      popcorn_score: string;
      popcorn_votes: string;
    };
    result: {
      verdict: string;
      suggestion: string;
    };
  } | null;
}

const LabReport: React.FC<LabReportProps> = ({ loading, data, movie }) => {
  
  const [showTmdb, setShowTmdb] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTmdb(true);
    }, 7000); 

    return () => clearTimeout(timer);
  }, []);
  
  // HELPER: Render text with bolding
  const renderRichText = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((paragraph, idx) => (
      <p key={idx} className="mb-3 last:mb-0">
        {paragraph.split(/(\*\*.*?\*\*)/).map((part, i) => 
          part.startsWith('**') && part.endsWith('**') ? (
            <span key={i} className="font-bold text-gray-800">{part.slice(2, -2)}</span>
          ) : (
            part
          )
        )}
      </p>
    ));
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-6 bg-white/60 backdrop-blur-xl rounded-3xl shadow-lab overflow-hidden border border-white/50 animate-fade-in-up">
      
      {/* HEADER */}
      <div className="bg-lab-lavender/30 p-4 flex items-center gap-3 border-b border-lab-lavender/50">
        <div className="bg-white p-2 rounded-full shadow-sm">
          <FlaskConical size={20} className="text-purple-600" />
        </div>
        <div>
          <h3 className="font-black text-gray-800 tracking-tight text-lg">MEL's Report</h3>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Laboratorium Analysis Results</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* SECTION A: LAB FACTS */}
        <div>
           <h4 className="text-xs font-bold text-lab-dark-blue uppercase tracking-widest mb-3 flex items-center gap-2">
             <Vote size={14} /> Lab's Facts
           </h4>
           <div className="grid grid-cols-2 gap-4">
              
              {/* 1. TMDB Stats */}
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-center relative overflow-hidden min-h-[120px] flex flex-col items-center justify-center">
                 {!showTmdb ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <Loader2 size={20} className="text-blue-300 animate-spin mb-2"/>
                        <span className="text-[10px] font-bold text-blue-300">CALCULATING...</span>
                    </div>
                 ) : (
                    <div className="animate-fade-in">
                        <div className="text-blue-600 font-black text-2xl">
                            {movie.vote_average.toFixed(1)}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-blue-300 mt-1">TMDB Score</div>
                        <div className="inline-block bg-white px-2 py-1 rounded-full text-[10px] font-bold text-gray-500 mt-2 shadow-sm border border-gray-100">
                            {movie.vote_count.toLocaleString()} Votes
                        </div>
                    </div>
                 )}
              </div>

              {/* 2. Popcorn Stats */}
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 text-center relative overflow-hidden min-h-[120px] flex flex-col items-center justify-center">
                 {loading || !data ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <Loader2 size={20} className="text-purple-300 animate-spin mb-2"/>
                        <span className="text-[10px] font-bold text-purple-300">SCANNING...</span>
                    </div>
                 ) : (
                    <div className="animate-fade-in">
                        <div className="text-purple-600 font-black text-2xl">
                            {data.facts.popcorn_score}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-purple-300 mt-1">Popcornmeter</div>
                        <div className="inline-block bg-white px-2 py-1 rounded-full text-[10px] font-bold text-gray-500 mt-2 shadow-sm border border-gray-100">
                            {data.facts.popcorn_votes}
                        </div>
                    </div>
                 )}
              </div>

           </div>
        </div>

        {/* SECTION B: LAB RESULTS */}
        <div>
           <h4 className="text-xs font-bold text-lab-dark-blue uppercase tracking-widest mb-3 flex items-center gap-2">
             <MessageSquareQuote size={14} /> Lab's Result
           </h4>
           
           <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100 relative overflow-hidden min-h-[160px]">
              {loading || !data ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-3 opacity-60 animate-pulse py-8">
                      <Loader2 size={24} className="text-gray-400 animate-spin" />
                      <p className="text-xs text-gray-400 font-medium">Synthesizing final verdict...</p>
                  </div>
              ) : (
                  <div className="animate-fade-in">
                      {/* [FIX] Removed Icon/Color logic. Just clean text in primary color. */}
                      <div className="text-center mb-4">
                        <span className="text-lg font-black uppercase tracking-tight text-purple-700 bg-purple-50 px-4 py-2 rounded-lg border border-purple-100 shadow-sm">
                          {data.result.verdict}
                        </span>
                      </div>

                      <div className="text-sm font-medium text-gray-600 leading-relaxed text-justify">
                        {renderRichText(data.result.suggestion)}
                      </div>
                  </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default LabReport;