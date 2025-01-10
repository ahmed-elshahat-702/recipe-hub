"use client";
import React from "react";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { type Recipe } from "@/lib/types/recipe";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Edit, SquareArrowOutUpRight, Trash2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { RecipeLikeButton } from "./recipe-like-button";
import { useUserStore } from "@/store/use-user-store";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const { fetchUser, user } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, []);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event from bubbling to link
    setShowDeleteDialog(true);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event from bubbling to link
    router.push(`/recipes/${recipe._id}/edit`);
  };

  const handleDeleteConfirm = async () => {
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

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow relative">
        {/* Like Button */}
        <RecipeLikeButton
          recipeId={recipe._id}
          initialLikes={recipe.likes.length}
          initialHasLiked={recipe.likes.includes(user?._id)}
          variant="card"
        />
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
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        <Link href={`/recipes/${recipe._id}`} className={cn("block")}>
          <div className="aspect-video relative">
            <Image
              src={recipe.images?.[0] || "/images/recipe-placeholder.jpg"}
              alt={recipe.title}
              fill
              className="object-cover"
            />
          </div>
        </Link>
        <Link href={`/recipes/${recipe._id}`} className={cn("block")}>
          <CardContent className="p-4 ">
            <h3 className="font-semibold text-lg line-clamp-1">
              {recipe.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {recipe.description}
            </p>
          </CardContent>
        </Link>
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center space-x-2">
            <Link
              href={isAuthor ? "/profile" : `/profile/${recipe?.author?._id}`}
              className="flex items-center gap-2 text-main hover:text-mainHover"
            >
              <div className="relative h-6 w-6 rounded-full overflow-hidden border-2 border-main">
                <Image
                  src={
                    recipe.isAnonymous
                      ? "/images/anonymous-avatar.png"
                      : recipe?.author?.image || "/images/default-avatar.jpg"
                  }
                  alt={
                    recipe.isAnonymous
                      ? "Anonymous User"
                      : recipe?.author?.name || "Anonymous"
                  }
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm">
                  {recipe.isAnonymous
                    ? "Anonymous"
                    : recipe?.author?.name || "Anonymous"}
                </span>
                <SquareArrowOutUpRight className="h-3 w-3 ml-1" />
              </div>
            </Link>
          </div>
        </CardFooter>
      </Card>
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
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
