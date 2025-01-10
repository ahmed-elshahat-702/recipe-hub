"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecipeCard } from "@/components/recipes/recipe-card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRecipeStore } from "@/store/use-recipe-store";
import { useRealTimeLikedRecipes } from "@/store/recipe-interactions";
import Image from "next/image";

export default function ProfilePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: session } = useSession();
  const { profile } = useProfile();

  const { profileRecipes, isLoading, fetchProfileRecipes } = useRecipeStore();

  const { likedRecipes } = useRealTimeLikedRecipes(session?.user?.id ?? "");

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfileRecipes(session.user.id);
    }
  }, [session?.user?.id]);

  return (
    <div className="container mx-auto py-8">
      {session && session.user && profile ? (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between relative">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-main">
                <AvatarImage
                  src={profile.image ?? "/images/default-profile.jpg"}
                  alt={profile.name || "Profile"}
                />
                <AvatarFallback>
                  <Image
                    src="/images/default-avatar.jpg"
                    alt={profile.name || "User"}
                    width={80}
                    height={80}
                    className="w-full h-full"
                    priority
                  />
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
          <TabsTrigger value="myRecipes">
            My Recipes ({profileRecipes.length})
          </TabsTrigger>
          <TabsTrigger value="likedRecipes">Liked Recipes</TabsTrigger>
        </TabsList>

        <TabsContent value="myRecipes">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">My Recipes</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <RecipeCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            profileRecipes &&
            (profileRecipes.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {profileRecipes
                    .slice((currentPage - 1) * 8, currentPage * 8)
                    .map((recipe) => (
                      <RecipeCard key={recipe._id} recipe={recipe} />
                    ))}
                </div>

                {/* Pagination */}
                {profileRecipes.length > 8 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1 && session?.user?.id) {
                              setCurrentPage(currentPage - 1);
                              fetchProfileRecipes(session.user.id);
                            }
                          }}
                        />
                      </PaginationItem>
                      {Array.from({
                        length: Math.ceil(profileRecipes.length / 8),
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
                                if (session?.user?.id) {
                                  fetchProfileRecipes(session.user.id);
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
                                Math.ceil(profileRecipes.length / 8) &&
                              session?.user?.id
                            ) {
                              setCurrentPage(currentPage + 1);
                              fetchProfileRecipes(session.user.id);
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
              {Array.from({ length: 8 }).map((_, index) => (
                <RecipeCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            likedRecipes &&
            (likedRecipes.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {likedRecipes.map((recipe: Recipe) => (
                    <RecipeCard key={recipe._id} recipe={recipe} />
                  ))}
                </div>

                {/* Pagination */}
                {likedRecipes.length > 8 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      {Array.from({
                        length: Math.ceil(likedRecipes.length / 8),
                      }).map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(pageNumber);
                                if (session?.user?.id) {
                                  fetchProfileRecipes(session.user.id);
                                }
                              }}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem key="next">
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (
                              currentPage <
                                Math.ceil(likedRecipes.length / 8) &&
                              session?.user?.id
                            ) {
                              setCurrentPage(currentPage + 1);
                              fetchProfileRecipes(session.user.id);
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
                  You haven't liked any recipes yet.
                </p>
                <Link href="/recipes">
                  <Button>Explore Recipes</Button>
                </Link>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
