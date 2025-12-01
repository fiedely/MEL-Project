import React from 'react';
import { FlaskConical, Vote, TrendingUp, TrendingDown, Minus, MessageSquareQuote, Loader2, AlertCircle } from 'lucide-react';

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

  // 1. LOADING STATE
  if (loading) {
    return (
      <div className="w-full max-w-lg mx-auto mt-6 bg-white/50 border-2 border-dashed border-lab-lavender rounded-3xl p-8 flex flex-col items-center justify-center text-center animate-pulse">
        <Loader2 size={32} className="text-purple-500 animate-spin mb-3" />
        <p className="text-sm font-bold text-purple-800 uppercase tracking-widest">Lab Agent Experimenting</p>
        <p className="text-xs text-gray-400 mt-1">Cross-referencing 7,777+ data points...</p>
      </div>
    );
  }

  // 2. EMPTY STATE
  if (!data) return null;

  const style = getVerdictStyle(data.result.verdict);

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

        {/* SECTION B: LAB RESULTS */}
        <div>
           <h4 className="text-xs font-bold text-lab-dark-blue uppercase tracking-widest mb-3 flex items-center gap-2">
             <MessageSquareQuote size={14} /> Lab's Result
           </h4>
           
           <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100 relative overflow-hidden">
              {/* Decorative background element */}
              <div className={`absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 rounded-full opacity-20 blur-xl ${style.bg.split(' ')[0]}`}></div>

              {/* DYNAMIC VERDICT BADGE */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider mb-4 shadow-sm ${style.bg}`}>
                 {style.icon}
                 <span>{style.label}</span>
              </div>

              {/* THE SUGGESTION (Rich Text) */}
              <div className="text-sm font-medium text-gray-600 leading-relaxed text-justify">
                {renderRichText(data.result.suggestion)}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default LabReport;