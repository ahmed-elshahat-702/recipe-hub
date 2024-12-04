"use client";

import { RecipeCard } from "@/components/recipes/recipe-card";
import React, { useEffect } from "react";
import RecipeCardSkeleton from "@/components/recipes/recipe-card-skeleton";
import { useRecipeStore } from "@/store/use-recipe-store";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RecipeFilters } from "@/components/recipes/recipe-filters";

export default function RecipesPage() {
  const {
    filteredRecipes: recipes,
    isLoading,
    error,
    fetchRecipes,
  } = useRecipeStore();
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return (
    <div className="container py-16 space-y-12">
      {/* Header Section */}
      <h2 className="text-main text-3xl sm:text-4xl font-extrabold tracking-tight text-center md:text-5xl">
        Latest Recipes
      </h2>
      <p className="sm:text-lg text-muted-foreground text-center max-w-2xl mx-auto">
        Discover new, delicious recipes created by chefs and cooking enthusiasts
        from around the world.
      </p>

      {session?.user && (
        <Link
          className="w-full flex items-center justify-center gap-4 p-2 rounded hover:bg-main/20 font-semibold border border-dashed border-main"
          href={"/recipes/create"}
        >
          <p>Add Recipe</p>
          <Plus className="w-5 h-5 text-main" />
        </Link>
      )}

      <RecipeFilters />

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {isLoading ? (
          // Show skeletons while loading
          Array.from({ length: 10 }).map((_, index) => (
            <RecipeCardSkeleton key={index} />
          ))
        ) : error ? (
          <p className="text-red-500 col-span-full text-center">{error}</p>
        ) : recipes.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center">
            No recipes found.
          </p>
        ) : (
          recipes.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe} />
          ))
        )}
      </div>
    </div>
  );
}
