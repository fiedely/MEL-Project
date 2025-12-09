import React from 'react';
import { FlaskConical, BookOpen, DoorClosed } from 'lucide-react';

type Tab = 'report' | 'detail' | 'lab';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  // Badges to show if processes are running in background
  loadingReport: boolean;
  loadingLab: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, loadingReport, loadingLab }) => {
  
  // Helper to determine active color class
  const getTabColor = (tabName: Tab) => activeTab === tabName ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-6 py-3 pb-safe z-40 shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        
        {/* TAB 1: EXPERIMENT (Report) */}
        <button 
          onClick={() => setActiveTab('report')}
          className={`flex flex-col items-center gap-1 transition-all w-16 ${getTabColor('report')}`}
        >
          <div className="relative">
            <FlaskConical size={activeTab === 'report' ? 24 : 22} strokeWidth={activeTab === 'report' ? 2.5 : 2} />
            {loadingReport && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full animate-ping" />}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wide">Experiment</span>
        </button>

        {/* TAB 2: DETAIL (Movie/Encyclopedia) */}
        <button 
          onClick={() => setActiveTab('detail')}
          className={`flex flex-col items-center gap-1 transition-all w-16 ${getTabColor('detail')}`}
        >
          <div className="relative">
             {/* [UPDATED] Icon */}
             <BookOpen size={activeTab === 'detail' ? 24 : 22} strokeWidth={activeTab === 'detail' ? 2.5 : 2} />
          </div>
          {/* [UPDATED] Label */}
          <span className="text-[9px] font-bold uppercase tracking-wide">Detail</span>
        </button>

        {/* TAB 3: RESTRICTED (Lab) */}
        <button 
          onClick={() => setActiveTab('lab')}
          className={`flex flex-col items-center gap-1 transition-all w-16 ${getTabColor('lab')}`}
        >
          <div className="relative">
            {/* [UPDATED] Icon */}
            <DoorClosed size={activeTab === 'lab' ? 24 : 22} strokeWidth={activeTab === 'lab' ? 2.5 : 2} />
            {loadingLab && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full animate-ping" />}
          </div>
          {/* [UPDATED] Label */}
          <span className="text-[9px] font-bold uppercase tracking-wide">Restricted</span>
        </button>

      </div>
    </div>
  );
};

export default BottomNav;