import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecipeCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-video rounded-lg shadow-sm bg-main/70" />
      <Skeleton className="h-4 rounded-lg w-3/4 shadow-sm bg-main/70" />
      <Skeleton className="h-4 rounded-lg w-1/2 shadow-sm bg-main/70" />
    </div>
  );
}
