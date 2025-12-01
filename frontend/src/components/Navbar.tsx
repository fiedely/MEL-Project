import { User } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-lab-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Left: Title / Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-1 bg-lab-lavender rounded-full"></div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight text-gray-800 leading-none">
              MEL
            </h1>
            <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 leading-tight">
              Movie Evaluation Lab
            </span>
          </div>
        </div>

        {/* Right: User Action (Icon Only) */}
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