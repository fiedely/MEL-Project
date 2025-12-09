import React from 'react';
import Skeleton from '../Skeleton';

const MovieDetailSkeleton: React.FC = () => {
  return (
    <div className="animate-fade-in w-full">
      
      {/* Hero Image Skeleton (Aspect 2/3) */}
      <div className="relative aspect-[2/3] w-full bg-gray-100 border-b border-gray-100 overflow-hidden">
         <Skeleton className="w-full h-full rounded-none" />
         {/* Title Overlay Mock */}
         <div className="absolute bottom-0 left-0 p-6 w-full space-y-3">
            <Skeleton className="h-8 w-3/4 bg-white/20 backdrop-blur-sm" />
            <div className="flex gap-2">
                <Skeleton className="h-4 w-16 bg-white/20 backdrop-blur-sm" />
                <Skeleton className="h-4 w-32 bg-white/20 backdrop-blur-sm" />
            </div>
         </div>
      </div>

      {/* Quick Stats Skeleton */}
      <div className="w-full bg-white border-b border-gray-100">
          <div className="flex w-full divide-x divide-gray-100 py-4">
              {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex-1 flex flex-col justify-center items-center px-1 gap-1.5">
                      <Skeleton className="h-2 w-8" />
                      <Skeleton className="h-3 w-12" />
                  </div>
              ))}
          </div>
      </div>

      {/* Body Content */}
      <div className="p-6 space-y-8">
          
          {/* External Consensus Mock */}
          <div>
              <Skeleton className="h-3 w-32 mb-3" />
              <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                      <Skeleton className="h-16 w-full rounded-xl" />
                      <Skeleton className="h-16 w-full rounded-xl" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                      <Skeleton className="h-16 w-full rounded-xl" />
                      <Skeleton className="h-16 w-full rounded-xl" />
                      <Skeleton className="h-16 w-full rounded-xl" />
                  </div>
              </div>
          </div>

          {/* Abstract Mock */}
          <div>
              <Skeleton className="h-3 w-40 mb-3" />
              <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
              </div>
          </div>

      </div>
    </div>
  );
};

export default MovieDetailSkeleton;