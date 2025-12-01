import React, { useState, useEffect } from 'react';
import { FlaskConical, Vote, TrendingUp, TrendingDown, Minus, MessageSquareQuote, Loader2, AlertCircle } from 'lucide-react';

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
  
  // 1. LOCAL STATE FOR FAKE DELAY
  const [showTmdb, setShowTmdb] = useState(false);

  useEffect(() => {
    // Start the timer when the component mounts
    const timer = setTimeout(() => {
      setShowTmdb(true);
    }, 7000); // 7 Second Delay

    return () => clearTimeout(timer);
  }, []);
  
  // HELPER: Get Dynamic Styles for Creative Verdicts
  const getVerdictStyle = (verdict: string) => {
    const v = verdict.toLowerCase();
    
    // POSITIVE (Green)
    if (v.includes('fresh') || v.includes('prime') || v.includes('certified') || v.includes('stable') || v.includes('masterpiece') || v.includes('specimen') || v.includes('catalyst')) {
      return { 
        bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', 
        icon: <TrendingUp size={14} />, 
        label: verdict 
      };
    }
    // NEGATIVE (Red)
    if (v.includes('rotten') || v.includes('biohazard') || v.includes('toxic') || v.includes('volatile') || v.includes('decay') || v.includes('failed')) {
      return { 
        bg: 'bg-red-50 text-red-600 border-red-100', 
        icon: <TrendingDown size={14} />, 
        label: verdict 
      };
    }
    // MIXED (Yellow)
    if (v.includes('mixed') || v.includes('average') || v.includes('inconclusive') || v.includes('reactant') || v.includes('inert')) {
      return { 
        bg: 'bg-yellow-50 text-yellow-600 border-yellow-100', 
        icon: <Minus size={14} />, 
        label: verdict 
      };
    }
    
    // Default (Gray)
    return { 
      bg: 'bg-gray-100 text-gray-600 border-gray-200', 
      icon: <AlertCircle size={14} />, 
      label: verdict 
    };
  };

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

  const style = data ? getVerdictStyle(data.result.verdict) : { bg: '', icon: null, label: '' };

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
              
              {/* 1. TMDB Stats (WITH FAKE LOADING) */}
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-center relative overflow-hidden min-h-[120px] flex flex-col items-center justify-center">
                 {!showTmdb ? (
                    // FAKE LOADING STATE
                    <div className="flex flex-col items-center animate-pulse">
                        <Loader2 size={20} className="text-blue-300 animate-spin mb-2"/>
                        <span className="text-[10px] font-bold text-blue-300">CALCULATING...</span>
                    </div>
                 ) : (
                    // REVEALED STATE
                    <div className="animate-fade-in">
                        <div className="text-blue-600 font-black text-2xl">
                            {movie.vote_average.toFixed(1)} {/* REMOVED /10 */}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-blue-300 mt-1">TMDB Score</div>
                        <div className="inline-block bg-white px-2 py-1 rounded-full text-[10px] font-bold text-gray-500 mt-2 shadow-sm border border-gray-100">
                            {movie.vote_count.toLocaleString()} Votes
                        </div>
                    </div>
                 )}
              </div>

              {/* 2. Popcorn Stats (REAL LOADING) */}
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 text-center relative overflow-hidden min-h-[120px] flex flex-col items-center justify-center">
                 {loading || !data ? (
                    // REAL LOADING STATE
                    <div className="flex flex-col items-center animate-pulse">
                        <Loader2 size={20} className="text-purple-300 animate-spin mb-2"/>
                        <span className="text-[10px] font-bold text-purple-300">SCANNING...</span>
                    </div>
                 ) : (
                    // DATA STATE
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

        {/* SECTION B: LAB RESULTS (REAL LOADING) */}
        <div>
           <h4 className="text-xs font-bold text-lab-dark-blue uppercase tracking-widest mb-3 flex items-center gap-2">
             <MessageSquareQuote size={14} /> Lab's Result
           </h4>
           
           <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100 relative overflow-hidden min-h-[160px]">
              {loading || !data ? (
                  // REAL LOADING STATE
                  <div className="flex flex-col items-center justify-center h-full space-y-3 opacity-60 animate-pulse py-8">
                      <Loader2 size={24} className="text-gray-400 animate-spin" />
                      <p className="text-xs text-gray-400 font-medium">Synthesizing final verdict...</p>
                  </div>
              ) : (
                  // DATA STATE
                  <div className="animate-fade-in">
                      {/* Decorative background element */}
                      <div className={`absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 rounded-full opacity-20 blur-xl ${style.bg.split(' ')[0]}`}></div>

                      {/* DYNAMIC VERDICT BADGE */}
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider mb-4 shadow-sm ${style.bg}`}>
                        {style.icon ? style.icon : <AlertCircle size={14}/>}
                        <span>{style.label}</span>
                      </div>

                      {/* THE SUGGESTION */}
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