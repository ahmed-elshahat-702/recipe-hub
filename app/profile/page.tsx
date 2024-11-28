"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecipeCard } from "@/components/recipes/recipe-card";
import axios from "axios";
import { useEffect, useState } from "react";
import RecipeCardSkeleton from "@/components/recipes/recipe-card-skeleton";
import { useSession } from "next-auth/react";
import { Recipe } from "@/lib/types/recipe";

export default function ProfilePage() {
  const [profileRecipes, setProfileRecipes] = useState<Recipe[]>([]);
  const { data: session } = useSession();

  const fetchProfileRecipes = async () => {
    if (!session?.user) return;
    try {
      const response = await axios.get(
        `/api/recipes?author=${session.user.id}`
      );
      setProfileRecipes(response.data.recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchProfileRecipes();
    }
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="container mx-auto py-8">
      {session?.user ? (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={session.user.image || ""}
                alt={session.user.name || ""}
              />
              <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{session.user.name}</CardTitle>
              <p className="text-muted-foreground">{session.user.email}</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{session.user.bio || "No bio available."}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">My Profile</h2>
          <p className="text-lg">You are not logged in.</p>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">My Recipes</h2>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {profileRecipes.length === 0
          ? Array.from({ length: 10 }).map((_, index) => (
              <RecipeCardSkeleton key={index} />
            ))
          : profileRecipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
      </div>
    </div>
  );
}
