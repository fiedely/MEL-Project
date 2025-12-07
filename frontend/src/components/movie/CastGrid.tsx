import React from 'react';
import { Microscope } from 'lucide-react';
import type { MovieData } from '../../App';

interface CastGridProps {
  cast: MovieData['cast'];
}

const CastGrid: React.FC<CastGridProps> = ({ cast }) => {
  if (!cast || cast.length === 0) return null;

  return (
    <div className="pt-6 border-t border-gray-100">
       <h4 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2">
         <Microscope size={14} /> Principal Subjects
       </h4>
       <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {cast.map((actor, i) => (
             <div key={i} className="min-w-[100px] w-[100px] flex flex-col gap-1">
                <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden relative shadow-sm">
                   {actor.profile_path ? (
                      <img src={actor.profile_path} className="w-full h-full object-cover" alt={actor.name} />
                   ) : (
                      <div className="flex items-center justify-center h-full text-gray-400"><Microscope size={20} /></div>
                   )}
                </div>
                <span className="text-xs font-bold text-gray-700 leading-tight line-clamp-2">{actor.name}</span>
             </div>
          ))}
       </div>
    </div>
  );
};

export default CastGrid;