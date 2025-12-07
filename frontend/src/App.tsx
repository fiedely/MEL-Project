import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { Info } from 'lucide-react'; 

import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import MovieCard from './components/MovieCard';
import LabReport from './components/LabReport';
import SpecimenComposition from './components/SpecimenComposition';
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
  cast: Array<{ name: string; profile_path: string | null; }>;
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
  collection?: { name: string; parts: Array<{ id: number; title: string; year: string; poster: string | null; media_type?: string; }>; };
  trailer_key?: string;
  keywords?: string[];
  recommendations?: Array<{ id: number; title: string; year: string; poster: string | null; media_type?: string; }>;
  vote_average: number;
  vote_count: number;
}

export interface PopcornData {
  popcorn_score: string;
  popcorn_votes: string;
}

export interface SynopsisData {
  full_plot: string;
  detailed_ending: string;
}

// [NEW] Composition Data Structure
export interface CompositionData {
  emotional: { thrill: number; glee: number; love: number; terror: number };
  narrative: { twist: number; complexity: number; pacing: number; novelty: number };
  content: { gore: number; nudity: number; profanity: number; substance: number };
  technical: { cinematography: number; score: number; performance: number; immersion: number };
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
  
  const [popcornData, setPopcornData] = useState<PopcornData | null>(null);
  const [synopsisData, setSynopsisData] = useState<SynopsisData | null>(null);
  const [compositionData, setCompositionData] = useState<CompositionData | null>(null); // [NEW]
  
  const [loading, setLoading] = useState(false);
  const [popcornLoading, setPopcornLoading] = useState(false);
  const [synopsisLoading, setSynopsisLoading] = useState(false);
  const [compositionLoading, setCompositionLoading] = useState(false); // [NEW]
  
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const handleReset = () => {
    setQuery('');
    setMovie(null);
    setCandidates(null);
    setPopcornData(null);
    setSynopsisData(null);
    setCompositionData(null);
    setError('');
    setLoading(false);
    setPopcornLoading(false);
    setSynopsisLoading(false);
    setCompositionLoading(false);
    setCurrentPage(1);
    setTotalPages(0);
  };

  const resetState = () => {
    setError('');
    setMovie(null);
    setCandidates(null);
    setPopcornData(null);
    setSynopsisData(null);
    setCompositionData(null);
  };

  const fetchCandidates = async (searchQuery: string, page: number) => {
    resetState();
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/search`, {
        params: { title: searchQuery, page: page }
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
        // Auto-fetch Popcorn and Composition for direct hits
        fetchPopcorn(data.tmdb_id, data.media_type); 
        fetchComposition(data.tmdb_id, data.media_type);
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
    setPopcornData(null); 
    setSynopsisData(null);
    setCompositionData(null);

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/search`, {
        params: { id: id, type: media_type }
      });
      setMovie(res.data);
      setLoading(false);
      // Auto-fetch Popcorn & Composition
      fetchPopcorn(res.data.tmdb_id, res.data.media_type);
      fetchComposition(res.data.tmdb_id, res.data.media_type);

    } catch (err) {
      console.error(err);
      setError('Failed to load specimen details.');
      setLoading(false);
    }
  };

  const fetchPopcorn = async (id?: number, type?: string) => {
    const targetId = id || movie?.tmdb_id;
    const targetType = type || movie?.media_type;
    if (!targetId) return;
    setPopcornLoading(true);
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/analyze`, {
            params: { id: targetId, type: targetType, mode: 'score' }
        });
        setPopcornData(res.data);
    } catch (err) { console.error(err); }
    setPopcornLoading(false);
  };

  // [NEW] Composition Fetcher
  const fetchComposition = async (id?: number, type?: string) => {
    const targetId = id || movie?.tmdb_id;
    const targetType = type || movie?.media_type;
    if (!targetId) return;
    
    setCompositionLoading(true);
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/analyze`, {
            params: { 
              id: targetId, 
              title: movie?.title, // Title helps context
              type: targetType, 
              mode: 'composition'
            }
        });
        setCompositionData(res.data);
    } catch (err) { console.error(err); }
    setCompositionLoading(false);
  };

  const fetchSynopsis = async (season?: string) => {
    if (!movie) return;
    setSynopsisLoading(true);
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/analyze`, {
            params: { 
              id: movie.tmdb_id, title: movie.title, type: movie.media_type, 
              mode: 'synopsis', season: season 
            }
        });
        setSynopsisData(res.data);
    } catch (err) { console.error(err); }
    setSynopsisLoading(false);
  };

  const closeSynopsis = () => { setSynopsisData(null); };

  return (
    <div className="min-h-screen bg-lab-white font-sans selection:bg-lab-lavender selection:text-purple-900 pb-20">
      <Navbar onReset={handleReset} />
      <main className="flex flex-col items-center">
        <SearchBar query={query} setQuery={setQuery} onSearch={searchMovie} loading={loading} />
        {error && (
          <div className="mt-4 flex items-center gap-2 bg-red-50 text-red-500 px-4 py-3 rounded-xl border border-red-100 text-sm font-medium animate-pulse">
              <Info size={18} /> {error}
          </div>
        )}
        <div className="w-full px-4 mb-10">
          {candidates && (
            <SearchResults candidates={candidates} onSelect={selectMovie} currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
          
          {movie && (
            <>
                <MovieCard 
                  data={movie} 
                  onSelect={selectMovie} 
                  popcornData={popcornData}
                  popcornLoading={popcornLoading}
                  onFetchPopcorn={() => fetchPopcorn(movie.tmdb_id, movie.media_type)}
                />
                
                {/* [NEW] Mel's Report / Composition */}
                <SpecimenComposition 
                   loading={compositionLoading}
                   data={compositionData}
                   onAnalyze={() => fetchComposition(movie.tmdb_id, movie.media_type)}
                />

                <LabReport 
                  loading={synopsisLoading}
                  synopsis={synopsisData}
                  onDecrypt={fetchSynopsis}
                  onClose={closeSynopsis}
                  movie={movie}
                />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;