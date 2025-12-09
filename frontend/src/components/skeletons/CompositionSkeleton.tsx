import React from 'react';
import Skeleton from '../Skeleton';

const CompositionSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          {/* Header Skeleton */}
          <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
             <Skeleton className="h-4 w-4 rounded-full" />
             <Skeleton className="h-3 w-24" />
          </div>
          
          {/* 4 Bars Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j}>
                <div className="flex justify-between mb-1.5">
                   <Skeleton className="h-2 w-16" />
                   <Skeleton className="h-2 w-6" />
                </div>
                <Skeleton className="h-2 w-full rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompositionSkeleton;