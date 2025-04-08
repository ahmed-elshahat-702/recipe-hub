"use client";

import { RecipeCard } from "@/components/recipes/recipe-card";
import RecipeCardSkeleton from "@/components/recipes/recipe-card-skeleton";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { UserCard } from "@/components/user/user-card";
import { useToast } from "@/hooks/use-toast";
import { useRecipeStore } from "@/store/use-recipe-store";
import axios from "axios";
import { ArrowLeftIcon, Loader2, UserIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserProfile {
  _id: string;
  name: string;
  image: string;
  bio?: string;
  createdAt: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [joinedDate, setJoinedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { anyUserRecipes, fetchAnyUserRecipes } = useRecipeStore();
  
  // Filter out anonymous recipes
  const filteredUserRecipes = anyUserRecipes.filter(recipe => !recipe.isAnonymous);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!params.id) return;

      try {
        // Fetch user profile
        const response = await axios.get(`/api/user/${params.id}`);
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
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
    if (typeof params.id === "string") {
      fetchAnyUserRecipes(params.id);
    }
  }, [params.id, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-main" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-center space-y-2">
          <UserIcon className="w-12 h-12 text-main mx-auto" />
          <p className="text-lg text-muted-foreground">User not found</p>
        </div>
        <Button onClick={() => router.back()} className="mt-2">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* User Profile Header */}
      <UserCard
        user={{
          image: user.image,
          name: user.name,
          bio: user.bio,
        }}
        anyUserRecipes={filteredUserRecipes}
        joinedDate={joinedDate}
      />

      {/* Recipes Grid */}

      <div className="space-y-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">
          {user.name.split(" ")[0]}
          <span className="text-main">'</span>s Recipes
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <RecipeCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          filteredUserRecipes &&
          (filteredUserRecipes.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredUserRecipes
                  .slice((currentPage - 1) * 8, currentPage * 8)
                  .map((recipe) => (
                    <RecipeCard key={recipe._id} recipe={recipe} />
                  ))}
              </div>

              {/* Pagination */}
              {filteredUserRecipes.length > 8 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                            if (typeof params.id === "string") {
                              fetchAnyUserRecipes(params.id);
                            }
                          }
                        }}
                      />
                    </PaginationItem>
                    {Array.from({
                      length: Math.ceil(filteredUserRecipes.length / 8),
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
                              if (typeof params.id === "string") {
                                fetchAnyUserRecipes(params.id);
                              }
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
                            currentPage <
                              Math.ceil(anyUserRecipes.length / 8) &&
                            params.id
                          ) {
                            setCurrentPage(currentPage + 1);
                            if (typeof params.id === "string") {
                              fetchAnyUserRecipes(params.id);
                            }
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
                {user.name.split(" ")[0]} has no recipes yet.
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
