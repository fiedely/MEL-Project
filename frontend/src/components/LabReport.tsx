import React, { useState } from 'react';
import { FileWarning, DoorClosed, Fingerprint, Loader2, X, ShieldAlert, IdCard } from 'lucide-react';
import type { SynopsisData, MovieData } from '../App';

interface LabReportProps {
  loading: boolean;
  synopsis: SynopsisData | null;
  onDecrypt: (season?: string) => void;
  movie: MovieData;
}

const LabReport: React.FC<LabReportProps> = ({ loading, synopsis, onDecrypt, movie }) => {
  
  const [showWarning, setShowWarning] = useState(false);
  const [showSeasonSelect, setShowSeasonSelect] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

  const isTV = movie.media_type === 'tv';

  const handleGrantAccess = () => {
    if (isTV) {
        setShowSeasonSelect(true);
    } else {
        setShowWarning(true);
    }
  };

  const handleSeasonClick = (seasonName: string) => {
      setSelectedSeason(seasonName);
      setShowSeasonSelect(false);
      setShowWarning(true);
  };

  const confirmDecrypt = () => {
      setShowWarning(false);
      if (isTV && selectedSeason) {
          onDecrypt(selectedSeason);
      } else {
          onDecrypt();
      }
  };

  const renderRichText = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((paragraph, idx) => (
      <p key={idx} className="mb-4 last:mb-0 leading-relaxed">
        {paragraph.split(/(\*\*.*?\*\*)/).map((part, i) => 
          part.startsWith('**') && part.endsWith('**') ? (
            <span key={i} className="font-bold text-purple-900">{part.slice(2, -2)}</span>
          ) : (
            part
          )
        )}
      </p>
    ));
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-6 bg-purple-50/50 backdrop-blur-xl rounded-3xl shadow-lab overflow-hidden border border-purple-100 animate-fade-in-up">
      
      {/* HEADER */}
      <div className="bg-purple-100/50 p-4 flex items-center gap-3 border-b border-purple-200/50">
        <div className="bg-white p-2 rounded-full shadow-sm">
          <ShieldAlert size={20} className="text-purple-600" />
        </div>
        <div>
          <h3 className="font-black text-gray-800 tracking-tight text-lg">
            RESTRICTED <span className="text-purple-600">LAB ACCESS</span>
          </h3>
          <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Authorized Personnel Only // Spoilers Inside</p>
        </div>
      </div>

      <div className="p-6">
        
        {/* STATE 1: LOCKED (Initial) */}
        {!loading && !synopsis && !showSeasonSelect && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="bg-white p-4 rounded-full shadow-sm mb-2">
              {/* [FIX] Changed Icon to DoorClosed */}
              <DoorClosed size={32} className="text-gray-400" />
            </div>
            <div>
              <h4 className="text-gray-800 font-bold text-lg">Restricted Area</h4>
              <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">
                This archive contains classified specimen data (Full Plot & Ending). Explicit authorization is required to proceed.
              </p>
            </div>
            <button 
              onClick={handleGrantAccess}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-purple-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              {/* [FIX] Changed Icon to Fingerprint */}
              <Fingerprint size={18} />
              GRANT LAB ACCESS
            </button>
          </div>
        )}

        {/* STATE 1.5: SEASON SELECTION (TV Only) */}
        {showSeasonSelect && (
             <div className="flex flex-col items-center justify-center py-4 text-center space-y-4 animate-fade-in">
                <div className="bg-purple-50 p-3 rounded-full mb-1">
                    {/* [FIX] Changed Icon to IdCard */}
                    <IdCard size={24} className="text-purple-500" />
                </div>
                <div>
                    <h4 className="text-gray-800 font-bold text-lg">Select Clearance Level</h4>
                    <p className="text-xs text-gray-500">Choose specific data partition to decrypt.</p>
                </div>
                
                <div className="w-full grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                    {movie.collection?.parts.map((season) => (
                        <button
                            key={season.id}
                            onClick={() => handleSeasonClick(season.title)}
                            className="bg-white border border-purple-100 hover:border-purple-400 hover:bg-purple-50 text-purple-700 font-bold py-2 px-4 rounded-lg text-xs transition-all text-left shadow-sm"
                        >
                            {season.title}
                        </button>
                    ))}
                </div>
                
                <button onClick={() => setShowSeasonSelect(false)} className="text-xs text-gray-400 hover:text-gray-600 underline mt-2">
                    Cancel Access
                </button>
             </div>
        )}

        {/* STATE 2: LOADING */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 size={40} className="text-purple-600 animate-spin" />
            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest animate-pulse">
              Verifying Credentials...
            </span>
          </div>
        )}

        {/* STATE 3: UNLOCKED (Result) */}
        {!loading && synopsis && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Plot */}
            <div>
               <h4 className="text-xs font-bold text-purple-800 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-purple-100 pb-2">
                 Specimen Narrative {selectedSeason && <span className="bg-purple-100 text-purple-600 px-2 rounded-md ml-auto normal-case tracking-normal">{selectedSeason}</span>}
               </h4>
               <div className="text-sm font-medium text-gray-700 text-justify">
                  {renderRichText(synopsis.full_plot)}
               </div>
            </div>

            {/* Ending */}
            <div className="bg-purple-100/30 p-5 rounded-2xl border border-purple-100">
               <h4 className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                 <FileWarning size={14} /> Final Resolution (Ending)
               </h4>
               <div className="text-sm font-medium text-gray-800 text-justify">
                  {renderRichText(synopsis.detailed_ending)}
               </div>
            </div>

          </div>
        )}

      </div>

      {/* WARNING MODAL */}
      {showWarning && (
        <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border-2 border-purple-500 relative">
              <button 
                onClick={() => setShowWarning(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
              
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert size={32} className="text-purple-600" />
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-2">Security Alert</h3>
              <p className="text-gray-600 text-sm mb-6">
                You are accessing <strong>Classified Ending Details</strong> {selectedSeason ? `for ${selectedSeason}` : ""}. This action cannot be reversed and constitutes a full spoiler event.
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowWarning(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Deny
                </button>
                <button 
                  onClick={confirmDecrypt}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200 transition-transform active:scale-95"
                >
                  Authorize
                </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default LabReport;