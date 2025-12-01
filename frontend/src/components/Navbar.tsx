// REMOVED: import React ... (Not needed in modern React 17+)
// REMOVED: import { UserCircle } ... (We aren't using the icon yet)

const Navbar = () => {
  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-lab-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Left: Title / Logo */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 bg-lab-lavender rounded-full"></div>
          <h1 className="text-2xl font-black tracking-tight text-gray-800">
            MEL
          </h1>
        </div>

        {/* Right: Login / Sign Up Actions */}
        <div className="flex items-center gap-4">
          <button className="text-sm font-semibold text-gray-500 hover:text-purple-600 transition-colors">
            Log In
          </button>
          <button className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-purple-600 transition-all shadow-lg flex items-center gap-2">
            Sign Up
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;