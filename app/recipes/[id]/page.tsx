"use client";
import { use, useEffect, useState } from "react";
import { RecipeDetails } from "@/components/recipes/recipe-details";
import { RecipeDetailsSkeleton } from "@/components/recipes/recipe-details-skeleton";
import axios from "axios";

export default function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [recipe, setRecipe] = useState(null);
  const resolvedParams = use(params);

  const fetchRecipe = async () => {
    const response = await axios.get(`/api/recipes/${resolvedParams.id}`);
    setRecipe(response.data);
  };

  useEffect(() => {
    fetchRecipe();
  }, []);

  return (
    <div className="container py-8">
      {recipe ? <RecipeDetails recipe={recipe} /> : <RecipeDetailsSkeleton />}
    </div>
  );
}
