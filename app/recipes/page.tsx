"use client";

import { RecipeCard } from "@/components/recipes/recipe-card";
import axios from "axios";
import { useEffect, useState } from "react";
import { type Recipe } from "@/lib/types/recipe";
import RecipeCardSkeleton from "@/components/recipes/recipe-card-skeleton";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  async function fetchRecipes() {
    try {
      const response = await axios.get("/api/recipes");
      const data = response.data;
      setRecipes(data.recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  }

  useEffect(() => {
    fetchRecipes();
  }, []);

  return (
    <div className="container py-16 space-y-12">
      {/* Header Section */}
      <h2 className="text-main text-3xl sm:text-4xl font-extrabold tracking-tight text-center md:text-5xl">
        Latest Recipes
      </h2>
      <p className=" sm:text-lg text-muted-foreground text-center max-w-2xl mx-auto">
        Discover new, delicious recipes created by chefs and cooking enthusiasts
        from around the world.
      </p>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {recipes.length > 0
          ? recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))
          : Array.from({ length: 10 }).map((_, index) => (
              <RecipeCardSkeleton key={index} />
            ))}
      </div>
    </div>
  );
}
