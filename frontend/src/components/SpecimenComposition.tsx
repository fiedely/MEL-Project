import React from 'react';
import { 
  FlaskConical, RefreshCw, Heart, Zap, Smile, Activity, 
  GitBranch, Box, Gauge, Sparkles, 
  Skull, Flame, Mic2, Pill, 
  Aperture, Music, User, CloudFog, 
  Loader2 
} from 'lucide-react';
import type { CompositionData } from '../App';

interface SpecimenCompositionProps {
  loading: boolean;
  data: CompositionData | null;
  onAnalyze: () => void;
}

const MetricRow: React.FC<{ label: string; value: number; colorBar: string; icon: React.ReactNode }> = ({ label, value, colorBar, icon }) => {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-end mb-1.5">
        <div className="flex items-center gap-2 text-gray-600">
          {React.cloneElement(icon as React.ReactElement<{ size: number }>, { size: 12 })}
          <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
        </div>
        <span className="text-xs font-black text-gray-800">{value}</span>
      </div>
      
      {/* [FIX] Reduced thickness to h-2 */}
      <div className="h-2 w-full bg-gray-100 rounded-sm overflow-hidden">
        <div 
          className={`h-full rounded-sm transition-all duration-1000 ease-out ${colorBar}`} 
          style={{ 
            width: `${value}%`
          }}
        />
      </div>
    </div>
  );
};

const SpecimenComposition: React.FC<SpecimenCompositionProps> = ({ loading, data, onAnalyze }) => {
  
  return (
    <div className="w-full max-w-lg mx-auto mt-6 bg-purple-50/50 backdrop-blur-xl rounded-3xl shadow-lab overflow-hidden border border-purple-100 animate-fade-in-up">
      
      {/* HEADER (Matched with LabReport) */}
      <div className="bg-purple-100/50 p-4 flex items-center gap-3 border-b border-purple-200/50">
        <div className="bg-white p-2 rounded-full shadow-sm">
          <FlaskConical size={20} className="text-purple-600" />
        </div>
        <div>
          <h3 className="font-black text-gray-800 tracking-tight text-lg">
            ME<span className="text-purple-600">L</span>'S REPORT
          </h3>
          <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Laboratorium Experiment Result</p>
        </div>
      </div>

      <div className="p-6">
        
        {/* STATE 1: LOADING */}
        {loading && (
           <div className="flex flex-col items-center justify-center py-12 space-y-4">
             <Loader2 size={40} className="text-purple-600 animate-spin" />
             <span className="text-xs font-bold text-purple-600 uppercase tracking-widest animate-pulse">
               Synthesizing Compounds...
             </span>
           </div>
        )}

        {/* STATE 2: INITIAL / FAILSAFE */}
        {!loading && (!data || !data.emotional) && (
           <div className="flex flex-col items-center justify-center py-8">
              <button 
                onClick={onAnalyze}
                className="group flex flex-col items-center gap-3 w-full"
              >
                <div className="bg-white p-4 rounded-full shadow-sm group-hover:scale-110 transition-transform border border-purple-100">
                    <RefreshCw size={24} className="text-purple-500" />
                </div>
                <div className="text-center">
                    <span className="text-sm font-bold text-purple-700 uppercase tracking-wide block">Generate Analysis</span>
                    <span className="text-xs text-purple-400 mt-1 block">Run full 16-point chemical breakdown</span>
                </div>
              </button>
           </div>
        )}

        {/* STATE 3: RESULTS GRID */}
        {!loading && data && data.emotional && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
            
            {/* 1. EMOTIONAL RESONANCE (Violet) */}
            <div className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm">
              <h4 className="text-xs font-black text-violet-500 uppercase mb-4 border-b border-violet-50 pb-2 flex items-center gap-2">
                 Emotional Resonance
              </h4>
              <MetricRow label="Action" value={data.emotional.action} colorBar="bg-violet-400" icon={<Zap/>} />
              <MetricRow label="Fun" value={data.emotional.fun} colorBar="bg-violet-400" icon={<Smile/>} />
              <MetricRow label="Romance" value={data.emotional.romance} colorBar="bg-violet-400" icon={<Heart/>} />
              <MetricRow label="Tension" value={data.emotional.tension} colorBar="bg-violet-400" icon={<Activity/>} />
            </div>

            {/* 2. NARRATIVE STRUCTURE (Sky Blue) */}
            <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-sm">
              <h4 className="text-xs font-black text-sky-500 uppercase mb-4 border-b border-sky-50 pb-2 flex items-center gap-2">
                 Narrative Structure
              </h4>
              <MetricRow label="Twist" value={data.narrative.twist} colorBar="bg-sky-400" icon={<GitBranch/>} />
              <MetricRow label="Complexity" value={data.narrative.complexity} colorBar="bg-sky-400" icon={<Box/>} />
              <MetricRow label="Pacing" value={data.narrative.pacing} colorBar="bg-sky-400" icon={<Gauge/>} />
              <MetricRow label="Novelty" value={data.narrative.novelty} colorBar="bg-sky-400" icon={<Sparkles/>} />
            </div>

            {/* 3. CONTENT INTENSITY (Rose Red) */}
            <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm">
              <h4 className="text-xs font-black text-rose-500 uppercase mb-4 border-b border-rose-50 pb-2 flex items-center gap-2">
                 Content Intensity
              </h4>
              <MetricRow label="Gore" value={data.content.gore} colorBar="bg-rose-400" icon={<Skull/>} />
              <MetricRow label="Nudity" value={data.content.nudity} colorBar="bg-rose-400" icon={<Flame/>} />
              <MetricRow label="Profanity" value={data.content.profanity} colorBar="bg-rose-400" icon={<Mic2/>} />
              <MetricRow label="Substance" value={data.content.substance} colorBar="bg-rose-400" icon={<Pill/>} />
            </div>

            {/* 4. TECHNICAL DIAGNOSTICS (Emerald) */}
            <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm">
              <h4 className="text-xs font-black text-emerald-500 uppercase mb-4 border-b border-emerald-50 pb-2 flex items-center gap-2">
                 Technical Diagnostics
              </h4>
              <MetricRow label="Cinematography" value={data.technical.cinematography} colorBar="bg-emerald-400" icon={<Aperture/>} />
              <MetricRow label="Score" value={data.technical.score} colorBar="bg-emerald-400" icon={<Music/>} />
              <MetricRow label="Performance" value={data.technical.performance} colorBar="bg-emerald-400" icon={<User/>} />
              <MetricRow label="Immersion" value={data.technical.immersion} colorBar="bg-emerald-400" icon={<CloudFog/>} />
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default SpecimenComposition;