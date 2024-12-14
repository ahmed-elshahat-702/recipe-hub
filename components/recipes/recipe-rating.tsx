import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";

interface RecipeRatingProps {
  recipeId: string;
}

export function RecipeRating({ recipeId }: RecipeRatingProps) {
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRating, setIsRating] = useState(false);
  const [pendingRating, setPendingRating] = useState<number | null>(null);
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    fetchRating();
  }, [recipeId]);

  const fetchRating = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/recipes/${recipeId}/rate`);
      const { averageRating, totalRatings, userRating } = response.data;
      setAverageRating(averageRating);
      setTotalRatings(totalRatings);
      if (userRating === null) {
        setUserRating(0);
      } else {
        setUserRating(userRating);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch rating. Please try again.",
      });
    } finally {
      setIsLoading(false);
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

    if (isLoading || isRating) return;

    try {
      setIsRating(true);
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
      setIsRating(false);
      setPendingRating(null);
    }
  };

  const renderStar = (position: number) => {
    const filled =
      hoveredRating !== null
        ? position <= hoveredRating
        : position <= userRating;

    const isPending =
      (isLoading || isRating) && position <= (pendingRating || 0);

    return (
      <Star
        key={position}
        className={`h-4 w-4 md:h-5 md:w-5 transition-colors 
          ${
            isLoading || isRating
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
          }
          ${filled ? "fill-main text-main" : "text-gray-300"} 
          ${isPending ? "opacity-50" : ""}`}
        onMouseEnter={() =>
          !(isLoading || isRating) && setHoveredRating(position)
        }
        onMouseLeave={() => !(isLoading || isRating) && setHoveredRating(null)}
        onClick={() => !(isLoading || isRating) && handleRate(position)}
      />
    );
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((position) => renderStar(position))}
        </div>
        {!isLoading ? (
          <span className="text-sm text-muted-foreground">
            ( {totalRatings} )
          </span>
        ) : (
          <Skeleton className="w-14 h-5 bg-main/60" />
        )}
      </div>
      {averageRating > 0 && (
        <p className="text-sm text-muted-foreground">
          Average rating: {averageRating.toFixed(1)} / 5
        </p>
      )}
    </div>
  );
}
