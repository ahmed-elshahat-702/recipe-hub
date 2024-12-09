import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface RecipeLikeButtonProps {
  recipeId: string;
  initialLikes: number;
  initialHasLiked: boolean;
}

export function RecipeLikeButton({
  recipeId,
  initialLikes,
  initialHasLiked,
}: RecipeLikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecipeLikes = async () => {
      if (!session?.user || !recipeId) return;

      try {
        const response = await axios.get(`/api/recipes/${recipeId}/likes`);
        const { likes: fetchedLikes, hasLiked: userHasLiked } =
          response.data || {};

        if (fetchedLikes !== undefined) {
          setLikes(fetchedLikes);
        }
        if (userHasLiked !== undefined) {
          setHasLiked(userHasLiked);
        }
      } catch (error) {
        // Only log and show toast if it's a network or server error
        if (axios.isAxiosError(error)) {
          console.error("Failed to fetch recipe likes", error.message);
          toast({
            title: "Error",
            description: "Failed to fetch recipe likes",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipeLikes();
  }, [recipeId, session?.user, toast]);

  const handleLike = async () => {
    if (!session) {
      toast({
        title: "Please log in",
        description: "You must be logged in to like recipes",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Optimistic update only if not already liked
      const updatedHasLiked = !hasLiked;
      const updatedLikes = updatedHasLiked ? likes + 1 : likes - 1;

      setHasLiked(updatedHasLiked);
      setLikes(updatedLikes);

      const response = await axios.post(`/api/recipes/${recipeId}/likes`);
      const { likes: newLikes, hasLiked: newHasLiked } = response.data;

      // Update with actual values from server
      setLikes(newLikes);
      setHasLiked(newHasLiked);
    } catch (error) {
      // Revert optimistic update on error
      setHasLiked(hasLiked);
      setLikes(likes);

      toast({
        title: "Error",
        description: "Failed to like recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={hasLiked ? "default" : "outline"}
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className={`gap-2 
        ${isLoading ? "bg-main/30 hover:bg-mainHover/30" : ""}
        ${hasLiked ? "bg-main hover:bg-mainHover text-white" : ""}
        `}
    >
      <Heart
        className={`h-3 w-3 ${hasLiked ? "fill-current" : ""}`}
        strokeWidth={hasLiked ? 0 : 1.5}
      />
      <span>{likes}</span>
    </Button>
  );
}
