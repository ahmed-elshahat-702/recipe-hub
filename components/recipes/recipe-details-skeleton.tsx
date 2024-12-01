import { Skeleton } from "../ui/skeleton";

export function RecipeDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-3/4 bg-main/60" />
        <Skeleton className="h-4 w-1/2 bg-main/60" />
      </div>
      <Skeleton className="h-64 w-full bg-main/60" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-40 bg-main/60" />
        <Skeleton className="h-4 w-full bg-main/60" />
        <Skeleton className="h-4 w-full bg-main/60" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-40 bg-main/60" />
        <Skeleton className="h-4 w-full bg-main/60" />
        <Skeleton className="h-4 w-full bg-main/60" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-40 bg-main/60" />
        <Skeleton className="h-4 w-full bg-main/60" />
        <Skeleton className="h-4 w-full bg-main/60" />
      </div>
    </div>
  );
}
