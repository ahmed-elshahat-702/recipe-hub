import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { RecipeForm } from "@/components/recipes/recipe-form";

export default async function CreateRecipePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Recipe</h1>
      <Suspense fallback={<RecipeFormSkeleton />}>
        <RecipeForm />
      </Suspense>
    </div>
  );
}

function RecipeFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full max-w-sm" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-10 w-full max-w-sm" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-10 w-full max-w-xs" />
    </div>
  );
}
