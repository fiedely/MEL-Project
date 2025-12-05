import React from 'react';
import { FlaskConical, ClipboardList, Stethoscope, Loader2, Sparkles } from 'lucide-react';

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
  onAnalyze: () => void;
}

const LabReport: React.FC<LabReportProps> = ({ loading, data, movie, onAnalyze }) => {
  
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
          <h3 className="font-black text-gray-800 tracking-tight text-lg">
            ME<span className="text-purple-600">L</span>'s Report
          </h3>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Laboratorium Analysis Results</p>
        </div>
      </div>

      <div className="p-6">
        
        {/* CASE 1: IDLE / STANDBY */}
        {!loading && !data && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 animate-fade-in">
            <div className="bg-purple-50 p-4 rounded-full mb-2 shadow-inner">
              <Sparkles size={32} className="text-purple-400" />
            </div>
            <div>
              <h4 className="text-gray-800 font-bold text-lg">Lab Standby</h4>
              <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">
                Specimen loaded. Initiate AI analysis to retrieve Popcornmeter scores and generate final diagnosis.
              </p>
            </div>
            <button 
              onClick={onAnalyze}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-purple-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group"
            >
              <FlaskConical size={18} className="group-hover:rotate-12 transition-transform"/>
              INITIALIZE ANALYSIS
            </button>
          </div>
        )}

        {/* CASE 2: LOADING */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 size={40} className="text-purple-600 animate-spin" />
            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest animate-pulse">
              Running Experiments...
            </span>
          </div>
        )}

        {/* CASE 3: RESULTS DISPLAY */}
        {!loading && data && (
          <div className="space-y-6 animate-fade-in">
            {/* SECTION A: OBSERVED METRICS */}
            <div>
              <h4 className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                <ClipboardList size={14} className="text-purple-600" /> Observed Metrics
              </h4>
              <div className="grid grid-cols-2 gap-4">
                  {/* TMDB Stats - [FIX] Removed Fake Loading */}
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-center relative overflow-hidden flex flex-col items-center justify-center">
                        <div className="animate-fade-in">
                            <div className="text-blue-600 font-black text-2xl">
                                {movie.vote_average.toFixed(1)}
                            </div>
                            <div className="text-[10px] uppercase font-bold text-blue-300 mt-1">TMDB Score</div>
                            <div className="inline-block bg-white px-2 py-1 rounded-full text-[10px] font-bold text-gray-500 mt-2 shadow-sm border border-gray-100">
                                {movie.vote_count.toLocaleString()} Votes
                            </div>
                        </div>
                  </div>

                  {/* Popcorn Stats */}
                  <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 text-center relative overflow-hidden flex flex-col items-center justify-center">
                      <div className="text-purple-600 font-black text-2xl">
                          {data.facts.popcorn_score}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-purple-300 mt-1">Popcornmeter</div>
                      <div className="inline-block bg-white px-2 py-1 rounded-full text-[10px] font-bold text-gray-500 mt-2 shadow-sm border border-gray-100">
                          {data.facts.popcorn_votes}
                      </div>
                  </div>
              </div>
            </div>

            {/* SECTION B: FINAL DIAGNOSIS */}
            <div>
              <h4 className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Stethoscope size={14} className="text-purple-600" /> Final Diagnosis
              </h4>
              
              <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100 relative overflow-hidden">
                  <div className="text-center mb-4">
                    <span className="text-lg font-black uppercase tracking-tight text-purple-700 bg-purple-50 px-4 py-2 rounded-lg border border-purple-100 shadow-sm">
                      {data.result.verdict}
                    </span>
                  </div>

                  <div className="text-sm font-medium text-gray-600 leading-relaxed text-justify">
                    {renderRichText(data.result.suggestion)}
                  </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LabReport;