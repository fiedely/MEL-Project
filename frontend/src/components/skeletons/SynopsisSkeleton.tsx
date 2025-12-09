import React from 'react';
import Skeleton from '../Skeleton';

const SynopsisSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Plot Section */}
      <div>
        <div className="mb-3 border-b border-purple-50 pb-2">
           <Skeleton className="h-3 w-32" />
        </div>
        <div className="space-y-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
        </div>
        <div className="space-y-3 mt-4">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-10/12" />
            <Skeleton className="h-3 w-full" />
        </div>
      </div>

      {/* Ending Section (Darker/Distinct) */}
      <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
        <div className="mb-3 flex items-center gap-2">
           <Skeleton className="h-4 w-4" />
           <Skeleton className="h-3 w-40" />
        </div>
        <div className="space-y-3">
            <Skeleton className="h-3 w-full bg-purple-200/50" />
            <Skeleton className="h-3 w-full bg-purple-200/50" />
            <Skeleton className="h-3 w-3/4 bg-purple-200/50" />
        </div>
      </div>

    </div>
  );
};

export default SynopsisSkeleton;