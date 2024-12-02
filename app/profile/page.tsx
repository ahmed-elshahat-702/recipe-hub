"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecipeCard } from "@/components/recipes/recipe-card";
import axios from "axios";
import { useEffect, useState } from "react";
import RecipeCardSkeleton from "@/components/recipes/recipe-card-skeleton";
import { useSession } from "next-auth/react";
import { Recipe } from "@/lib/types/recipe";
import { Skeleton } from "@/components/ui/skeleton";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { CookingPot } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/use-profile";

export default function ProfilePage() {
  const [profileRecipes, setProfileRecipes] = useState<Recipe[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const { profile } = useProfile();

  const fetchProfileRecipes = async () => {
    if (!session?.user?.id) return;
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/user/${session.user.id}`);
      const profileRecipesIDs: string[] = response.data.user.createdRecipes;
      const profileRecipesPromises = profileRecipesIDs.map((id) =>
        axios.get<Recipe>(`/api/recipes/${id}`)
      );
      const profileRecipesResponses = await Promise.all(profileRecipesPromises);
      const profileRecipesData = profileRecipesResponses.map((res) => res.data);
      setProfileRecipes(profileRecipesData);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (session) {
      fetchProfileRecipes();
    }
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="container mx-auto py-8">
      {session && profile ? (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between relative">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-main">
                <AvatarImage
                  src={profile.image ?? undefined}
                  alt={profile.name || "Profile"}
                />
                <AvatarFallback>
                  {profile.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl sm:text-2xl">
                  {profile.name}
                </CardTitle>
                <p className="text-muted-foreground max-sm:text-sm">
                  {profile.email}
                </p>
              </div>
            </div>
            <div className="absolute top-2 right-2">
              <EditProfileDialog />
            </div>
          </CardHeader>
          <CardContent>
            <p className="sm:text-lg">{profile.bio || "No bio available."}</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full bg-main/60" />
              <div>
                <Skeleton className="h-8 w-48 mb-2 bg-main/60" />
                <Skeleton className="h-4 w-36 bg-main/60" />
              </div>
            </div>
            <Skeleton className="h-9 w-28 bg-main/60" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 w-full bg-main/60" />
          </CardContent>
        </Card>
      ) : (
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Profile</h2>
          <p className="text-muted-foreground">
            You are not logged in. Please log in to view your profile.
          </p>
        </div>
      )}

      <h2 className="text-xl sm:text-2xl font-bold mb-4">My Recipes</h2>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <RecipeCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        profileRecipes &&
        (profileRecipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {profileRecipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="w-full text-center">
            <p className="text-muted-foreground mb-4">
              You have not created any recipes yet.
            </p>
            <Link href="/recipes/create">
              <Button>
                <CookingPot className="mr-2 h-5 w-5" />
                Create Recipe
              </Button>
            </Link>
          </div>
        ))
      )}
    </div>
  );
}
