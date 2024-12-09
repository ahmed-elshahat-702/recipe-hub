import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";
import axios from "axios";

interface RecipeRatingProps {
  recipeId: string;
}

export function RecipeRating({ recipeId }: RecipeRatingProps) {
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [totalRatings, setTotalRatings] = useState(0);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRating, setPendingRating] = useState<number | null>(null);
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    fetchRating();
  }, [recipeId]);

  const fetchRating = async () => {
    try {
      const response = await axios.get(`/api/recipes/${recipeId}/rate`);
      const { averageRating, totalRatings, userRating } = response.data;
      setAverageRating(averageRating);
      setTotalRatings(totalRatings);
      setUserRating(userRating);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch rating. Please try again.",
      });
    }
  };

  const handleRate = async (rating: number) => {
    if (!session) {
      toast({
        title: "Please log in",
        description: "You must be logged in to rate recipes",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setPendingRating(rating);
      const response = await axios.post(`/api/recipes/${recipeId}/rate`, {
        score: rating,
      });

      const { averageRating: newAverage, totalRatings: newTotal } =
        response.data;
      setAverageRating(newAverage);
      setTotalRatings(newTotal);
      setUserRating(rating);

      toast({
        title: "Rating submitted",
        description: "Thank you for rating this recipe!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setPendingRating(null);
    }
  };

  const renderStar = (position: number) => {
    const filled =
      hoveredRating !== null
        ? position <= hoveredRating
        : position <= (userRating || averageRating);
    const isPending = isLoading && position <= (pendingRating || 0);

    return (
      <Star
        key={position}
        className={`h-4 w-4 md:h-5 md:w-5 cursor-pointer transition-colors ${
          filled ? "fill-main text-main" : "text-gray-300"
        } ${isPending ? "opacity-50" : ""}`}
        onMouseEnter={() => !isLoading && setHoveredRating(position)}
        onMouseLeave={() => !isLoading && setHoveredRating(null)}
        onClick={() => !isLoading && handleRate(position)}
      />
    );
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((position) => renderStar(position))}
        </div>
        <span className="text-sm text-muted-foreground">
          ({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})
        </span>
      </div>
      {averageRating > 0 && (
        <p className="text-sm text-muted-foreground">
          Average rating: {averageRating.toFixed(1)} / 5
        </p>
      )}
      {/* {userRating && (
        <p className="text-sm text-muted-foreground">
          Your rating: {userRating} / 5
        </p>
      )} */}
    </div>
  );
}
