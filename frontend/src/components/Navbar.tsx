import React from 'react';
import { User } from 'lucide-react';

interface NavbarProps {
  onReset: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onReset }) => {
  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-lab-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Left: Title / Logo */}
        <button 
          onClick={onReset}
          className="flex items-center gap-3 hover:opacity-70 transition-opacity focus:outline-none text-left"
        >
          <div className="h-10 w-1 bg-lab-lavender rounded-full"></div>
          
          <div className="flex flex-col">
            {/* 'ME' in Gray, 'L' in Lavender */}
            <h1 className="text-2xl font-black tracking-tight leading-none">
              <span className="text-gray-800">ME</span>
              <span className="text-purple-600">L</span>
            </h1>
            {/* [FIX] Reverted to Gray */}
            <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 leading-tight">
              Movie Evaluation Lab
            </span>
          </div>
        </button>

        {/* Right: User Action */}
        <button 
          className="text-gray-400 hover:text-purple-600 hover:bg-purple-50 p-2 rounded-full transition-all"
          aria-label="User Menu"
        >
          <User size={24} />
        </button>

      </div>
    </nav>
  );
};

export default Navbar;