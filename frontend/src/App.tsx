import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { Info } from 'lucide-react'; 

import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import MovieCard from './components/MovieCard';
import LabReport from './components/LabReport';

// --- TYPES ---
interface MovieData {
  title: string;
  poster: string;
  rated: string;
  genres: string[];
  year: string;
  runtime_minutes: number;
  scores: {
    imdb: string;
    rotten_tomatoes_critic: string;
    metacritic: string;
  };
  plot: string;
  cast: string[];
  director: string;
  budget: string;
  revenue: string;
  language?: string;
  writer?: string;
  // NEW FIELDS
  vote_average: number;
  vote_count: number;
}

interface LabData {
  facts: {
    tmdb_score: string;
    tmdb_votes: string;
    popcorn_score: string;
    popcorn_votes: string;
  };
  result: {
    verdict: string;
    suggestion: string;
  };
}

function App() {
  const [query, setQuery] = useState('');
  
  // State 1: Main Movie Data (Fast)
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State 2: Lab Report Data (Slow/AI)
  const [labData, setLabData] = useState<LabData | null>(null);
  const [labLoading, setLabLoading] = useState(false);

  const searchMovie = async (e: FormEvent) => {
    e.preventDefault();
    if(!query) return;

    // Reset everything
    setLoading(true);
    setLabLoading(false); // Don't start lab loading yet
    setError('');
    setMovie(null);
    setLabData(null);

    try {
      // 1. FAST: Call Search Endpoint
      const searchRes = await axios.get(`${import.meta.env.VITE_API_URL}/search`, {
        params: { title: query }
      });
      
      const movieResult = searchRes.data;
      setMovie(movieResult);
      setLoading(false); // Stop main loading immediately

      // 2. SLOW: Trigger Lab Analysis (Background)
      fetchLabReport(movieResult.title);

    } catch (err) {
      console.error(err);
      setError('Subject not found in the database.');
      setLoading(false);
    }
  };

  const fetchLabReport = async (title: string) => {
    setLabLoading(true);
    let attempts = 0;
    const maxAttempts = 3;
    let success = false;

    while (attempts < maxAttempts && !success) {
      try {
        attempts++;
        console.log(`🧪 Lab Analysis Attempt ${attempts}/${maxAttempts}...`);
        
        const analyzeRes = await axios.get(`${import.meta.env.VITE_API_URL}/analyze`, {
            params: { title: title }
        });
        setLabData(analyzeRes.data);
        success = true; // Exit loop on success
      } catch (err) {
        console.error(`Attempt ${attempts} failed:`, err);
        // Wait 1 second before retrying if not the last attempt
        if (attempts < maxAttempts) {
             await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
    setLabLoading(false);
  };

  return (
    <div className="min-h-screen bg-lab-white font-sans selection:bg-lab-lavender selection:text-purple-900 pb-20">
      
      {/* Navigation */}
      <Navbar />

      <main className="flex flex-col items-center">
        
        {/* Intro */}
        {!movie && !loading && (
          <div className="mt-20 text-center space-y-2 opacity-60">
            <p className="text-sm font-bold tracking-widest uppercase text-gray-400">Movie Evaluation Lab</p>
            <p className="text-gray-500">Begin your research by entering a title below.</p>
          </div>
        )}

        {/* Search */}
        <SearchBar 
          query={query} 
          setQuery={setQuery} 
          onSearch={searchMovie} 
          loading={loading}
        />

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-center gap-2 bg-red-50 text-red-500 px-4 py-3 rounded-xl border border-red-100 text-sm font-medium animate-pulse">
              <Info size={18} /> {error}
          </div>
        )}

        {/* Results Container */}
        <div className="w-full px-4 mb-10">
          
          {/* 1. Main Card (Loads First) */}
          {movie && <MovieCard data={movie} />}

          {/* 2. Lab Report (Loads Second) */}
          {movie && (
              <LabReport 
                loading={labLoading} 
                data={labData} 
                movie={movie} 
              />
          )}
          
        </div>

      </main>
    </div>
  );
}

export default App;