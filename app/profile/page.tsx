"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecipeCard } from "@/components/recipes/recipe-card";
import axios from "axios";
import React, { useEffect, useState } from "react";
import RecipeCardSkeleton from "@/components/recipes/recipe-card-skeleton";
import { useSession } from "next-auth/react";
import { Recipe } from "@/lib/types/recipe";
import { Skeleton } from "@/components/ui/skeleton";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { CookingPot } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useProfile } from "@/hooks/use-profile";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
  const [profileRecipes, setProfileRecipes] = useState<Recipe[] | null>(null);
  const [likedRecipes, setLikedRecipes] = useState<Recipe[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: session } = useSession();
  const { profile } = useProfile();
  const { toast } = useToast();

  const fetchProfileRecipes = async () => {
    if (!session?.user?.id) return;
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/user/${session.user.id}`);
      const profileRecipesIDs: string[] = response.data.user.createdRecipes;

      // Fetch all recipes in parallel and filter out any failed requests
      const profileRecipesData = await Promise.all(
        profileRecipesIDs.map(async (id) => {
          try {
            const response = await axios.get<Recipe>(`/api/recipes/${id}`);
            return response.data;
          } catch (error) {
            toast({
              variant: "destructive",
              description: `Recipe with ID ${id} not found or inaccessible`,
            });
            return null;
          }
        })
      );

      // Filter out null values before setting state
      const validRecipes = profileRecipesData.filter(
        (recipe): recipe is Recipe => recipe !== null
      );

      // Sort recipes by creation date (newest first)
      validRecipes.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setProfileRecipes(validRecipes);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch user profile",
      });
      setProfileRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLikedRecipes = async () => {
    if (!session?.user?.id) return;
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/user/${session.user.id}`);
      const likedRecipesIDs: string[] = response.data.user.likedRecipes;

      // Fetch all recipes in parallel and filter out any failed requests
      const likedRecipesData = await Promise.all(
        likedRecipesIDs.map(async (id) => {
          try {
            const response = await axios.get<Recipe>(`/api/recipes/${id}`);
            return response.data;
          } catch (error) {
            toast({
              variant: "destructive",
              description: `Recipe with ID ${id} not found or inaccessible`,
            });
            return null;
          }
        })
      );

      // Filter out null values before setting state
      const validRecipes = likedRecipesData.filter(
        (recipe): recipe is Recipe => recipe !== null
      );

      // Sort recipes by creation date (newest first)
      validRecipes.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setLikedRecipes(validRecipes);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch user profile",
      });
      setLikedRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchProfileRecipes();
      fetchLikedRecipes();
    }
  }, [session]);

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

      <Tabs defaultValue="myRecipes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="myRecipes">My Recipes</TabsTrigger>
          <TabsTrigger value="likedRecipes">Liked Recipes</TabsTrigger>
        </TabsList>

        <TabsContent value="myRecipes">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">My Recipes</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <RecipeCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            profileRecipes &&
            (profileRecipes.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {profileRecipes
                    .slice((currentPage - 1) * 12, currentPage * 12)
                    .map((recipe) => (
                      <RecipeCard key={recipe._id} recipe={recipe} />
                    ))}
                </div>

                {/* Pagination */}
                {profileRecipes.length > 12 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) {
                              setCurrentPage(currentPage - 1);
                              fetchProfileRecipes();
                            }
                          }}
                        />
                      </PaginationItem>
                      {Array.from({
                        length: Math.ceil(profileRecipes.length / 12),
                      }).map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              href="#"
                              isActive={pageNumber === currentPage}
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(pageNumber);
                                fetchProfileRecipes();
                              }}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (
                              currentPage < Math.ceil(profileRecipes.length / 12)
                            ) {
                              setCurrentPage(currentPage + 1);
                              fetchProfileRecipes();
                            }
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
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
        </TabsContent>

        <TabsContent value="likedRecipes">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Liked Recipes</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <RecipeCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            likedRecipes &&
            (likedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {likedRecipes.map((recipe) => (
                  <RecipeCard key={recipe._id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="w-full text-center">
                <p className="text-muted-foreground mb-4">
                  You haven't liked any recipes yet.
                </p>
                <Link href="/recipes">
                  <Button>
                    Explore Recipes
                  </Button>
                </Link>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
