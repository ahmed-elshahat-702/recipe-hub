import { useState } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();

  const handleLike = async () => {
    if (!session) {
      toast({
        title: "Please log in",
        description: "You must be logged in to like recipes",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      // Optimistic update
      setHasLiked(!hasLiked);
      setLikes(hasLiked ? likes - 1 : likes + 1);

      const response = await axios.post(`/api/recipes/${recipeId}/like`);
      const { likes: newLikes, hasLiked: newHasLiked } = response.data;

      // Update with actual values from server
      setLikes(newLikes);
      setHasLiked(newHasLiked);
    } catch (error) {
      // Revert optimistic update on error
      setHasLiked(!hasLiked);
      setLikes(hasLiked ? likes + 1 : likes - 1);
      console.error("Error liking recipe:", error);
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
      className={`gap-2 ${hasLiked ? "bg-main hover:bg-mainHover" : ""}`}
    >
      <Heart className={`h-3 w-3 ${hasLiked ? "fill-current" : ""}`} />
      <span>{likes}</span>
    </Button>
  );
}
