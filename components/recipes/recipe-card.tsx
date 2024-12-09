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
import { Edit, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useRecipeStore } from "@/store/use-recipe-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { data: session } = useSession();
  const { deleteRecipe } = useRecipeStore();
  const { toast } = useToast();
  const router = useRouter();

  // Only show edit/delete if:
  // 1. User is logged in
  // 2. Recipe has an author (not anonymous)
  // 3. Current user is the author
  const isAuthor =
    session?.user?.id &&
    recipe.author?._id &&
    session.user.id === recipe.author._id;

  // Initialize liked status based on recipe data
  useEffect(() => {
    // Check if the current user has liked the recipe based on the recipe's likes array
    if (session?.user?.id && recipe.likes) {
      setIsLiked(recipe.likes.includes(session.user.id));
    }
  }, [session?.user?.id, recipe.likes]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation

    if (!session?.user?.id) {
      toast({
        title: "Login Required",
        description: "Please log in to like a recipe.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.post(`/api/recipes/${recipe._id}/likes`);

      // Update like status based on the new response
      setIsLiked(response.data.hasLiked);

      // Show toast with like/unlike status
      toast({
        title: response.data.hasLiked ? "Recipe Liked" : "Recipe Unliked",
        description: response.data.hasLiked
          ? "You've added this recipe to your favorites."
          : "You've removed this recipe from your favorites.",
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteRecipe(recipe._id);
    setShowDeleteDialog(false);
    toast({
      title: "Recipe deleted",
      description: "Your recipe has been deleted successfully.",
    });
    router.refresh();
    setIsDeleting(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    router.push(`/recipes/${recipe._id}/edit`);
  };

  return (
    <>
      <Link
        href={`/recipes/${recipe._id}`}
        className={cn(
          "block",
          isLiked && "bg-primary/10 rounded-lg" // Subtle background for liked recipes
        )}
      >
        <Card className="overflow-hidden hover:shadow-lg transition-shadow relative">
          {/* Like Button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 left-2 z-10 h-8 w-8"
            onClick={handleLike}
          >
            <Heart
              className={cn(
                "h-5 w-5",
                isLiked
                  ? "fill-main text-main"
                  : "text-muted-foreground hover:text-mainHover"
              )}
            />
          </Button>

          {isAuthor && (
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={handleEdit}
                disabled={isDeleting}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8"
                onClick={(e) => {
                  e.preventDefault();
                  setShowDeleteDialog(true);
                }}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="aspect-video relative">
            <Image
              src={recipe.images?.[0] || "/recipe-placeholder.jpg"}
              alt={recipe.title}
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="p-4 ">
            <h3 className="font-semibold text-lg line-clamp-1">
              {recipe.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {recipe.description}
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <div className="flex items-center space-x-2">
              <div className="relative h-6 w-6 rounded-full overflow-hidden border-2 border-main">
                <Image
                  src={
                    recipe.isAnonymous
                      ? "/anonymous-user.jpg"
                      : recipe?.author?.image || "/anonymous-user.jpg"
                  }
                  alt={
                    recipe.isAnonymous
                      ? "/anonymous-user.jpg"
                      : recipe?.author?.name || "Anonymous"
                  }
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {recipe.isAnonymous
                  ? "Anonymous"
                  : recipe?.author?.name || "Anonymous"}
              </span>
            </div>
          </CardFooter>
        </Card>
      </Link>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recipe? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleDelete();
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
