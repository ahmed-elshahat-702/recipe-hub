"use client";
import React from "react";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { type Recipe } from "@/lib/types/recipe";
import { useEffect, useState } from "react";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";
import { useSession } from "next-auth/react";

interface RecipeCardProps {
  recipe: Recipe;
}

interface RecipeAuthor {
  _id: string;
  name: string;
  image: string;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [recipeAuthor, setRecipeAuthor] = useState<RecipeAuthor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  const fetchRecipeAuthor = async () => {
    try {
      const response = await axios.get<{ user: RecipeAuthor }>(
        `/api/user/${recipe.author._id}`
      );
      setRecipeAuthor(response.data.user);
    } catch (error) {
      console.error("Error fetching recipe author:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipeAuthor();
  }, [recipe.author._id]);

  return (
    <Link href={`/recipes/${recipe._id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-video relative">
          <Image
            src={recipe.images?.[0] || "/recipe-placeholder.jpg"}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{recipe.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {recipe.description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <Skeleton className="w-6 h-6 rounded-full bg-main/60" />
            ) : (
              <div className="relative h-6 w-6 rounded-full overflow-hidden border-2 border-main">
                <Image
                  src={recipeAuthor?.image || "/recipe-placeholder.jpg"}
                  alt={recipeAuthor?.name || "Author"}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            {isLoading ? (
              <Skeleton className="w-24 h-4 bg-main/60" />
            ) : (
              <span className="text-sm text-muted-foreground">
                {recipeAuthor?.name === session?.user?.name
                  ? "You"
                  : recipeAuthor?.name || "Random User"}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
