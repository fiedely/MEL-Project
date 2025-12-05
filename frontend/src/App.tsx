import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { Info } from 'lucide-react'; 

import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import MovieCard from './components/MovieCard';
import LabReport from './components/LabReport';
import SearchResults from './components/SearchResults';

// --- TYPES ---
export interface MovieData {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  tagline?: string;
  poster: string;
  rated: string;
  genres: string[];
  year: string;
  status?: string;
  runtime_minutes?: number;
  scores: {
    imdb: string;
    rotten_tomatoes_critic: string;
    metacritic: string;
  };
  awards?: string;
  plot: string;
  cast: Array<{
    name: string;
    profile_path: string | null;
  }>;
  director?: string | null;
  creators?: string[];
  writer?: string;
  production?: string[];
  networks?: string[];
  producers?: string[];
  cinematographers?: string[];
  composers?: string[];
  budget: string;
  revenue: string;
  language?: string;
  collection?: {
    name: string;
    parts: Array<{
      id: number;
      title: string;
      year: string;
      poster: string | null;
      media_type?: string;
    }>;
  };
  trailer_key?: string;
  keywords?: string[];
  recommendations?: Array<{
    id: number;
    title: string;
    year: string;
    poster: string | null;
    media_type?: string;
  }>;
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

export interface Candidate {
  id: number;
  title: string;
  year: string;
  media_type: 'movie' | 'tv';
  poster: string | null;
  overview: string;
}

function App() {
  const [query, setQuery] = useState('');
  
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [labData, setLabData] = useState<LabData | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [labLoading, setLabLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const handleReset = () => {
    setQuery('');
    setMovie(null);
    setCandidates(null);
    setLabData(null);
    setError('');
    setLoading(false);
    setLabLoading(false);
    setCurrentPage(1);
    setTotalPages(0);
  };

  const resetState = () => {
    setError('');
    setMovie(null);
    setCandidates(null);
    setLabData(null);
    setLabLoading(false);
  };

  const fetchCandidates = async (searchQuery: string, page: number) => {
    resetState();
    setLoading(true);
    
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/search`, {
        params: { 
          title: searchQuery,
          page: page
        }
      });
      
      const data = res.data;

      if (data.candidates) {
        setCandidates(data.candidates);
        setTotalPages(data.total_pages);
        setCurrentPage(data.page);
        setLoading(false);
      } else {
        setMovie(data);
        setLoading(false);
      }

    } catch (err) {
      console.error(err);
      setError('Subject not found in the database.');
      setLoading(false);
    }
  };

  const searchMovie = async (e: FormEvent) => {
    e.preventDefault();
    if(!query) return;
    fetchCandidates(query, 1);
  };

  const handlePageChange = (newPage: number) => {
    fetchCandidates(query, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectMovie = async (id: number, media_type: string) => {
    setCandidates(null);
    setLoading(true);
    setLabData(null); 

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/search`, {
        params: { id: id, type: media_type }
      });

      const data = res.data;
      setMovie(data);
      setLoading(false);

    } catch (err) {
      console.error(err);
      setError('Failed to load specimen details.');
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    if (!movie) return;
    
    setLabLoading(true);
    let attempts = 0;
    const maxAttempts = 3;
    let success = false;

    while (attempts < maxAttempts && !success) {
      try {
        attempts++;
        const analyzeRes = await axios.get(`${import.meta.env.VITE_API_URL}/analyze`, {
            params: { 
              id: movie.tmdb_id,
              title: movie.title,
              type: movie.media_type
            }
        });
        setLabData(analyzeRes.data);
        success = true; 
      } catch (err) {
        console.error(`Analysis attempt ${attempts} failed:`, err);
        if (attempts < maxAttempts) {
             await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
    setLabLoading(false);
  };

  return (
    <div className="min-h-screen bg-lab-white font-sans selection:bg-lab-lavender selection:text-purple-900 pb-20">
      
      <Navbar onReset={handleReset} />

      <main className="flex flex-col items-center">
        
        <SearchBar 
          query={query} 
          setQuery={setQuery} 
          onSearch={searchMovie} 
          loading={loading}
        />

        {error && (
          <div className="mt-4 flex items-center gap-2 bg-red-50 text-red-500 px-4 py-3 rounded-xl border border-red-100 text-sm font-medium animate-pulse">
              <Info size={18} /> {error}
          </div>
        )}

        <div className="w-full px-4 mb-10">
          
          {candidates && (
            <SearchResults 
              candidates={candidates} 
              onSelect={selectMovie}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}

          {movie && (
            <MovieCard 
              data={movie} 
              onSelect={selectMovie} 
            />
          )}

          {movie && (
              <LabReport 
                loading={labLoading} 
                data={labData} 
                onAnalyze={runAnalysis}
                movie={movie} // [FIX] Added missing prop
              />
          )}
          
        </div>

      </main>
    </div>
  );
}

export default App;