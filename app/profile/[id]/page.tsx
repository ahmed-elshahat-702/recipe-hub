"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RecipeCard } from "@/components/recipes/recipe-card";
import axios from "axios";
import React, { useEffect, useState } from "react";
import RecipeCardSkeleton from "@/components/recipes/recipe-card-skeleton";
import { Recipe } from "@/lib/types/recipe";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, CookingPot } from "lucide-react";
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
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

export interface User {
  _id: string;
  name: string;
  email: string;
  bio: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  createdRecipes: string[];
}

export default function UserProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [profileRecipes, setProfileRecipes] = useState<Recipe[] | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isRecipeLoading, setIsRecipeLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [joinedDate, setJoinedDate] = useState("");
  const { toast } = useToast();

  const fetchUser = async () => {
    const id = (await params).id;
    try {
      const response = await axios.get(`/api/user/${id}`);
      setUser(response.data.user);
      const createdAt = new Date(response.data.user.createdAt);
      const joinedDateInfo = createdAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      setJoinedDate(joinedDateInfo);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch user profile. Please try again.",
      });
    } finally {
      setIsUserLoading(false);
    }
  };

  const fetchProfileRecipes = async () => {
    const id = (await params).id;

    try {
      const response = await axios.get(`/api/user/${id}`);
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
              title: "Error",
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
        description: "Failed to fetch user profile. Please try again.",
      });
      setProfileRecipes([]);
    } finally {
      setIsRecipeLoading(false);
    }
  };
  useEffect(() => {
    fetchUser();
    fetchProfileRecipes();
  }, []);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {user ? (
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Image
                src={user.image || "/images/default-avatar.jpg"}
                alt={user.name}
                width={128}
                height={128}
                className="rounded-full"
              />
            </div>
            <div className="flex-grow space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-sm text-gray-500">
                  @{user.name.toLowerCase().replace(/\s+/g, "")}
                </p>
                <p className="mt-2">{user.bio || "No bio available"}</p>
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Joined {joinedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CookingPot className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {profileRecipes?.length || 0} recipes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : isUserLoading ? (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full bg-main/60" />
              <div>
                <Skeleton className="h-8 w-48 mb-2 bg-main/60" />
                <Skeleton className="h-4 w-36 bg-main/60" />
              </div>
            </div>
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
      {isRecipeLoading ? (
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
    </div>
  );
}
