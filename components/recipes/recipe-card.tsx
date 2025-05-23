"use client";
import React from "react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { type Recipe } from "@/lib/types/recipe";
import { cn } from "@/lib/utils";
import { useRecipeStore } from "@/store/use-recipe-store";
import { useUserStore } from "@/store/use-user-store";
import { Edit, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { RecipeLikeButton } from "./recipe-like-button";

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
    try {
      await deleteRecipe(recipe._id);
      setShowDeleteDialog(false);
      toast({
        title: "Recipe deleted",
        description: "Your recipe has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
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
            {recipe.isAnonymous ? (
              <div className="flex items-center gap-2 ">
                <div className="relative h-6 w-6 rounded-full overflow-hidden border-2 border-main">
                  <Image
                    src="/images/anonymous-avatar.png"
                    alt="Anonymous User"
                    fill
                    className="p-[1px] object-cover bg-secondary"
                  />
                </div>
                <span className="text-sm text-main">Anonymous</span>
              </div>
            ) : (
              <Link
                href={isAuthor ? "/profile" : `/user/${recipe?.author?._id}`}
                className="flex items-center gap-2 text-main hover:text-mainHover"
              >
                <div className="relative h-6 w-6 rounded-full overflow-hidden border-2 border-main">
                  <Image
                    src={recipe?.author?.image || "/images/default-avatar.png"}
                    alt={recipe?.author?.name || "Anonymous"}
                    fill
                    className="object-cover bg-secondary"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm">
                    {recipe?.author?.name || "Anonymous"}
                  </span>
                </div>
              </Link>
            )}
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
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
