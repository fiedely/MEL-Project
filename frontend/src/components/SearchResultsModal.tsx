import React from 'react';
import { X } from 'lucide-react';
import SearchResults from './SearchResults';
import type { Candidate } from '../App';

interface SearchResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: Candidate[] | null;
  onSelect: (id: number, media_type: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const SearchResultsModal: React.FC<SearchResultsModalProps> = ({ 
  isOpen, onClose, candidates, onSelect, currentPage, totalPages, onPageChange 
}) => {
  if (!isOpen || !candidates) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-lab-white/95 backdrop-blur-sm flex flex-col animate-fade-in">
      {/* Modal Header */}
      <div className="px-4 py-4 flex justify-between items-center border-b border-gray-100 bg-white shadow-sm shrink-0 sticky top-0">
        <h3 className="font-bold text-gray-800 text-lg">Select Specimen</h3>
        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
          <X size={20} />
        </button>
      </div>

      {/* Scrollable Results */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <SearchResults 
          candidates={candidates} 
          onSelect={onSelect} 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={onPageChange} 
        />
      </div>
    </div>
  );
};

export default SearchResultsModal;