import React, { type FormEvent } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  query: string;
  setQuery: (value: string) => void;
  onSearch: (e: FormEvent) => void;
  loading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, setQuery, onSearch, loading }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8 mb-6 px-4">
      <form onSubmit={onSearch} className="relative group">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-lab-lavender blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
        
        <div className="relative flex items-center">
          <Search className="absolute left-5 text-gray-400" size={20} />
          
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a movie (e.g. Interstellar)..." 
            className="w-full pl-12 pr-14 py-4 rounded-2xl border-2 border-transparent bg-white shadow-lab focus:border-lab-lavender focus:ring-0 outline-none text-gray-700 text-lg transition-all placeholder:text-gray-400 font-medium"
          />
          
          <button 
            type="submit"
            disabled={loading || !query}
            className="absolute right-3 bg-lab-blue/50 hover:bg-lab-blue text-lab-dark-blue p-2 rounded-xl transition-all disabled:opacity-0 disabled:scale-90"
          >
            {loading ? <Loader2 size={20} className="animate-spin text-purple-500"/> : <span className="text-xs font-bold px-2 text-purple-600">ANALYZE</span>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;