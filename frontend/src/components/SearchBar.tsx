import React, { type FormEvent } from 'react';
import { Search, Loader2, X } from 'lucide-react';

interface SearchBarProps {
  query: string;
  setQuery: (value: string) => void;
  onSearch: (e: FormEvent) => void;
  loading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, setQuery, onSearch, loading }) => {
  
  const handleClear = () => {
    setQuery('');
  };

  return (
    // [FIX] Removed margins (mt/mb/mx) and padding (px) to fit inside Card
    <div className="w-full relative group">
      <form onSubmit={onSearch} className="relative">
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
              className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl transition-all disabled:opacity-0 disabled:scale-90 flex items-center justify-center shadow-md"
              title="Analyze"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Search size={20} />
              )}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};

export default SearchBar;