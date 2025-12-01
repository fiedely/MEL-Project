import React from 'react';
import { FlaskConical, Vote, TrendingUp, MessageSquareQuote, Loader2 } from 'lucide-react';

interface LabReportProps {
  loading: boolean;
  data: {
    facts: {
      tmdb_score: string;
      tmdb_votes: string;
      popcorn_score: string;
      popcorn_votes: string;
    };
    result: {
      verdict: string;
      suggestion: string;
    };
  } | null;
}

const LabReport: React.FC<LabReportProps> = ({ loading, data }) => {
  
  // 1. LOADING STATE (The "Processing" Animation)
  if (loading) {
    return (
      <div className="w-full max-w-lg mx-auto mt-6 bg-white/50 border-2 border-dashed border-lab-lavender rounded-3xl p-8 flex flex-col items-center justify-center text-center animate-pulse">
        <Loader2 size={32} className="text-purple-500 animate-spin mb-3" />
        <p className="text-sm font-bold text-purple-800 uppercase tracking-widest">AI Agent Processing</p>
        <p className="text-xs text-gray-400 mt-1">Cross-referencing 500+ data points...</p>
      </div>
    );
  }

  // 2. EMPTY STATE (Before search)
  if (!data) return null;

  return (
    <div className="w-full max-w-lg mx-auto mt-6 bg-white rounded-3xl shadow-lab overflow-hidden border border-lab-border animate-fade-in-up">
      
      {/* HEADER */}
      <div className="bg-lab-lavender/30 p-4 flex items-center gap-3 border-b border-lab-lavender/50">
        <div className="bg-white p-2 rounded-full shadow-sm">
          <FlaskConical size={20} className="text-purple-600" />
        </div>
        <div>
          <h3 className="font-black text-gray-800 tracking-tight text-lg">MEL's Lab Report</h3>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Deep Analysis Results</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* SECTION A: LAB FACTS (Voting Data) */}
        <div>
           <h4 className="text-xs font-bold text-lab-dark-blue uppercase tracking-widest mb-3 flex items-center gap-2">
             <Vote size={14} /> Lab's Facts
           </h4>
           <div className="grid grid-cols-2 gap-4">
              
              {/* TMDB Stats */}
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-center">
                 <div className="text-blue-600 font-black text-2xl">{data.facts.tmdb_score}</div>
                 <div className="text-[10px] uppercase font-bold text-blue-300 mt-1">TMDB Score</div>
                 <div className="inline-block bg-white px-2 py-1 rounded-full text-[10px] font-bold text-gray-500 mt-2 shadow-sm border border-gray-100">
                    {data.facts.tmdb_votes}
                 </div>
              </div>

              {/* Popcorn Stats */}
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 text-center">
                 <div className="text-purple-600 font-black text-2xl">{data.facts.popcorn_score}</div>
                 <div className="text-[10px] uppercase font-bold text-purple-300 mt-1">Popcornmeter</div>
                 <div className="inline-block bg-white px-2 py-1 rounded-full text-[10px] font-bold text-gray-500 mt-2 shadow-sm border border-gray-100">
                    {data.facts.popcorn_votes}
                 </div>
              </div>

           </div>
        </div>

        {/* SECTION B: LAB RESULTS (AI Verdict) */}
        <div>
           <h4 className="text-xs font-bold text-lab-dark-blue uppercase tracking-widest mb-3 flex items-center gap-2">
             <MessageSquareQuote size={14} /> Lab's Result
           </h4>
           
           <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-lab-lavender rounded-full opacity-20 blur-xl"></div>

              {/* The Verdict Badge */}
              <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-3 shadow-md">
                 <TrendingUp size={12} className="text-lab-dark-blue" />
                 {data.result.verdict}
              </div>

              {/* The Suggestion */}
              <p className="text-sm font-medium text-gray-600 leading-relaxed italic">
                "{data.result.suggestion}"
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default LabReport;