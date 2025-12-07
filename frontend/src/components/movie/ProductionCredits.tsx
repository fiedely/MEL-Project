import React from 'react';
import { FlaskConical } from 'lucide-react';
import type { MovieData } from '../../App';

interface ProductionCreditsProps {
  data: MovieData;
}

const ProductionCredits: React.FC<ProductionCreditsProps> = ({ data }) => {
  const isTV = data.media_type === 'tv';

  return (
    <div>
       <h4 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2">
         <FlaskConical size={14} /> Lead Researchers
       </h4>
       <div className="grid grid-cols-[140px_1fr] gap-y-3 text-sm text-gray-600 px-1">
          {/* TV CREDITS */}
          {isTV && (
            <>
              {data.producers && data.producers.length > 0 && (
                <>
                  <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Exec. Producer</span>
                  <span className="font-medium text-gray-600">{data.producers.join(', ')}</span>
                </>
              )}
              {data.creators && data.creators.length > 0 && (
                <>
                  <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Creators</span>
                  <span className="font-medium text-gray-600">{data.creators.join(', ')}</span>
                </>
              )}
              {data.production && data.production.length > 0 && (
                <>
                  <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Production</span>
                  <span className="font-medium text-gray-600">{data.production.join(', ')}</span>
                </>
              )}
              {data.networks && data.networks.length > 0 && (
                <>
                  <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Network</span>
                  <span className="font-medium text-gray-600">{data.networks.join(', ')}</span>
                </>
              )}
            </>
          )}

          {/* MOVIE CREDITS */}
          {!isTV && (
            <>
              {data.producers && data.producers.length > 0 && (
                <>
                  <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Producer</span>
                  <span className="font-medium text-gray-600">{data.producers.join(', ')}</span>
                </>
              )}
              <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Director</span>
              <span className="font-medium text-gray-600">{data.director}</span>
              
              <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Writer</span>
              <span className="font-medium text-gray-600">{data.writer || "Not Listed"}</span>
              
              {data.cinematographers && data.cinematographers.length > 0 && (
                <>
                  <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Cinematography</span>
                  <span className="font-medium text-gray-600">{data.cinematographers.join(', ')}</span>
                </>
              )}
              {data.composers && data.composers.length > 0 && (
                <>
                  <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Score</span>
                  <span className="font-medium text-gray-600">{data.composers.join(', ')}</span>
                </>
              )}
              {data.production && data.production.length > 0 && (
                <>
                  <span className="font-bold text-gray-400 text-xs uppercase pt-0.5">Production</span>
                  <span className="font-medium text-gray-600">{data.production.join(', ')}</span>
                </>
              )}
            </>
          )}
       </div>
    </div>
  );
};

export default ProductionCredits;