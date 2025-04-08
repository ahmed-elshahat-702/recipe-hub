import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const RecipeCommentSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-4">
        <Skeleton className="h-10 w-10 rounded-full bg-main" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/4 bg-main" />
          <Skeleton className="h-4 w-3/4 bg-main" />
        </div>
      </div>
      <Skeleton className="h-20 w-full bg-main" />
    </div>
  );
};

export default RecipeCommentSkeleton;