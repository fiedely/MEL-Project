import { useState, useRef, useLayoutEffect, type FormEvent } from 'react';
import axios from 'axios';
import { Info, Film, FlaskConical, ShieldAlert } from 'lucide-react'; 

import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import MovieCard from './components/MovieCard';
import LabReport from './components/LabReport';
import SpecimenComposition from './components/SpecimenComposition';
import BottomNav from './components/BottomNav';
import SearchResultsModal from './components/SearchResultsModal';
import EmptyState from './components/EmptyState';

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

type Tab = 'report' | 'detail' | 'lab';

function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<Tab>('detail');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Scroll Position Persistence
  const scrollPositions = useRef<Record<Tab, number>>({
    detail: 0,
    report: 0,
    lab: 0
  });

  // Data State
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [movie, setMovie] = useState<MovieData | null>(null);
  
  const [popcornData, setPopcornData] = useState<PopcornData | null>(null);
  const [synopsisData, setSynopsisData] = useState<SynopsisData | null>(null);
  const [compositionData, setCompositionData] = useState<CompositionData | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [popcornLoading, setPopcornLoading] = useState(false);
  const [synopsisLoading, setSynopsisLoading] = useState(false);
  const [compositionLoading, setCompositionLoading] = useState(false);
  
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Custom Tab Switcher to save/restore scroll
  const switchTab = (newTab: Tab) => {
    // 1. Save current scroll position
    scrollPositions.current[activeTab] = window.scrollY;
    // 2. Change state
    setActiveTab(newTab);
  };

  // Restore scroll position immediately after render
  useLayoutEffect(() => {
    const savedPosition = scrollPositions.current[activeTab];
    window.scrollTo({ top: savedPosition, behavior: 'instant' });
  }, [activeTab]);

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
    setIsSearchOpen(false);
    
    // Reset scroll history
    scrollPositions.current = { detail: 0, report: 0, lab: 0 };
    setActiveTab('detail'); 
    window.scrollTo(0, 0);
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
        setIsSearchOpen(true); 
      } else {
        setMovie(data);
        handleDirectSelection(data);
      }
    } catch (err) {
      console.error(err);
      setError('Subject not found in the database.');
    }
    setLoading(false);
  };

  const searchMovie = async (e: FormEvent) => {
    e.preventDefault();
    if(!query) return;
    fetchCandidates(query, 1);
  };

  const handlePageChange = (newPage: number) => {
    fetchCandidates(query, newPage);
  };

  const handleDirectSelection = (movieData: MovieData) => {
      // Reset scroll history for new movie
      scrollPositions.current = { detail: 0, report: 0, lab: 0 };
      window.scrollTo(0, 0);

      fetchPopcorn(movieData.tmdb_id, movieData.media_type); 
      fetchComposition(movieData.tmdb_id, movieData.media_type, movieData.title);
  };

  const selectMovie = async (id: number, media_type: string) => {
    setIsSearchOpen(false); 
    setCandidates(null);
    setLoading(true);
    
    setPopcornData(null); 
    setSynopsisData(null);
    setCompositionData(null);
    
    // Reset scroll history for new movie
    scrollPositions.current = { detail: 0, report: 0, lab: 0 };
    setActiveTab('detail'); 
    window.scrollTo(0, 0);

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/search`, {
        params: { id: id, type: media_type }
      });
      setMovie(res.data);
      handleDirectSelection(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load specimen details.');
    }
    setLoading(false);
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

  const fetchComposition = async (id?: number, type?: string, title?: string) => {
    const targetId = id || movie?.tmdb_id;
    const targetType = type || movie?.media_type;
    const targetTitle = title || movie?.title;
    if (!targetId) return;
    
    setCompositionLoading(true);
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/analyze`, {
            params: { 
              id: targetId, 
              title: targetTitle, 
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
    <div className="min-h-screen bg-lab-white font-sans selection:bg-lab-lavender selection:text-purple-900">
      <Navbar onReset={handleReset} />

      <main className="pb-24 w-full max-w-5xl mx-auto">
        
        {/* VIEW 1: MOVIE DETAIL */}
        <div className={activeTab === 'detail' ? 'block' : 'hidden'}>
           
           {error && (
            <div className="mt-4 mx-4 flex items-center gap-2 bg-red-50 text-red-500 px-4 py-3 rounded-xl border border-red-100 text-sm font-medium animate-pulse">
                <Info size={18} /> {error}
            </div>
           )}

           <div className="px-4">
             <MovieCard 
                data={movie} 
                searchBar={
                    <SearchBar query={query} setQuery={setQuery} onSearch={searchMovie} loading={loading} />
                }
                emptyState={
                    <EmptyState 
                        icon={Film} 
                        title="Ready for Analysis" 
                        message="Search for a specimen to begin details examination." 
                    />
                }
                onSelect={selectMovie} 
                popcornData={popcornData}
                popcornLoading={popcornLoading}
                onFetchPopcorn={() => movie && fetchPopcorn(movie.tmdb_id, movie.media_type)}
                loading={loading}
             />
           </div>
        </div>

        {/* VIEW 2: MEL'S REPORT */}
        <div className={`px-4 ${activeTab === 'report' ? 'block' : 'hidden'}`}>
             <SpecimenComposition 
                loading={compositionLoading}
                data={compositionData}
                onAnalyze={() => movie && fetchComposition(movie.tmdb_id, movie.media_type)}
                emptyState={!movie ? (
                  <EmptyState 
                     icon={FlaskConical} 
                     title="No Specimen Selected" 
                     message="Search for a specimen in the Detail tab to begin the analysis." 
                  />
                ) : null}
             />
        </div>

        {/* VIEW 3: LAB ACCESS */}
        <div className={`px-4 ${activeTab === 'lab' ? 'block' : 'hidden'}`}>
             <LabReport 
                loading={synopsisLoading}
                synopsis={synopsisData}
                onDecrypt={fetchSynopsis}
                onClose={closeSynopsis}
                movie={movie}
                emptyState={!movie ? (
                  <EmptyState 
                     icon={ShieldAlert} 
                     title="Restricted Area" 
                     message="Search for a specimen in the Detail tab to request clearance for classified files." 
                  />
                ) : null}
             />
        </div>

      </main>

      <SearchResultsModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        candidates={candidates}
        onSelect={selectMovie}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={switchTab}
        loadingReport={compositionLoading}
        loadingLab={synopsisLoading}
      />
    </div>
  );
}

export default App;