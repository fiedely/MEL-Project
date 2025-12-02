// frontend/src/components/SearchBar.tsx
import React, { type FormEvent } from 'react';
import { Search, Loader2, Sparkles, X } from 'lucide-react';

interface SearchBarProps {
  query: string;
  setQuery: (value: string) => void;
  onSearch: (e: FormEvent) => void;
  loading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, setQuery, onSearch, loading }) => {
  
  const handleClear = () => {
    setQuery('');
    // Optional: focus the input back?
    // document.getElementById('search-input')?.focus(); 
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 mb-6 px-4">
      <form onSubmit={onSearch} className="relative group">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-lab-lavender blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
        
        <div className="relative flex items-center">
          <Search className="absolute left-5 text-gray-400" size={20} />
          
          <input 
            id="search-input"
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a movie title..." 
            className="w-full pl-12 pr-24 py-4 rounded-2xl border-2 border-transparent bg-white shadow-lab focus:border-lab-lavender focus:ring-0 outline-none text-gray-700 text-lg transition-all placeholder:text-gray-400 font-medium"
          />
          
          {/* Action Buttons Container */}
          <div className="absolute right-3 flex items-center gap-2">
            
            {/* Clear Button (Only shows if query exists) */}
            {query && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                title="Clear search"
              >
                <X size={18} />
              </button>
            )}

            {/* Analyze/Submit Button */}
            <button 
              type="submit"
              disabled={loading || !query}
              className="bg-lab-blue/10 hover:bg-lab-blue text-lab-blue hover:text-white p-3 rounded-xl transition-all disabled:opacity-0 disabled:scale-90 flex items-center justify-center"
              title="Analyze"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Sparkles size={20} />
              )}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};

export default SearchBar;