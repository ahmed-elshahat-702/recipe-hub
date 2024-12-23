import { create } from "zustand";
import axios from "axios";
import { Recipe } from "@/lib/types/recipe";
import useSWR, { mutate } from "swr";

interface Comment {
  _id: string;
  user: {
    _id: string;
    name: string;
    image: string;
  };
  content: string;
  createdAt: string;
  updatedAt?: string;
  parentId?: string;
  replies?: Comment[];
}

interface Rating {
  userId: string;
  value: number;
}

interface RecipeInteraction {
  recipeId: string;
  comments: Comment[];
  ratings: Rating[];
  likes: string[];
  averageRating: number;
  totalRatings: number;
  totalLikes: number;
}

interface RecipeInteractionsStore {
  isLoading: boolean;
  error: string | null;

  interactions: { [key: string]: RecipeInteraction };
  setComments: (recipeId: string, comments: Comment[]) => void;
  addComment: (recipeId: string, comment: Comment) => void;
  updateComment: (recipeId: string, commentId: string, content: string) => void;
  updateReply: (
    recipeId: string,
    commentId: string,
    replyId: string,
    content: string
  ) => void;
  deleteComment: (recipeId: string, commentId: string) => void;
  deleteReply: (recipeId: string, replyId: string) => void;
  setRatings: (
    recipeId: string,
    ratings: Rating[],
    average: number,
    total: number
  ) => void;
  updateRating: (recipeId: string, userId: string, value: number) => void;
  toggleLike: (recipeId: string, userId: string) => void;
  setLikes: (recipeId: string, likes: string[]) => void;

  likedRecipes: Recipe[];
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useRecipeInteractions = create<RecipeInteractionsStore>(
  (set, get) => ({
    interactions: {},
    likedRecipes: [],
    isLoading: false,
    error: null,

    setComments: (recipeId, comments) =>
      set((state) => {
        return {
          interactions: {
            ...state.interactions,
            [recipeId]: {
              ...state.interactions[recipeId],
              comments,
            } as RecipeInteraction,
          },
        };
      }),

    addComment: (recipeId, comment) =>
      set((state) => {
        return {
          interactions: {
            ...state.interactions,
            [recipeId]: {
              ...state.interactions[recipeId],
              comments: [
                ...(state.interactions[recipeId]?.comments || []),
                comment,
              ],
            } as RecipeInteraction,
          },
        };
      }),

    updateComment: (recipeId, commentId, content) =>
      set((state) => {
        const currentComments = state.interactions[recipeId]?.comments || [];
        const updatedComments = currentComments.map((comment) => {
          // Check if this is the comment to update
          if (comment._id === commentId) {
            return { ...comment, content, updatedAt: new Date().toISOString() };
          }
          // Check if the comment to update is in replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply._id === commentId
                  ? { ...reply, content, updatedAt: new Date().toISOString() }
                  : reply
              ),
            };
          }
          return comment;
        });

        return {
          interactions: {
            ...state.interactions,
            [recipeId]: {
              ...state.interactions[recipeId],
              comments: updatedComments,
            } as RecipeInteraction,
          },
        };
      }),

    updateReply: (recipeId, commentId, replyId, content) =>
      set((state) => {
        const currentComments = state.interactions[recipeId]?.comments || [];
        const updatedComments = currentComments.map((comment) => {
          if (comment._id === commentId && comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply._id === replyId
                  ? { ...reply, content, updatedAt: new Date().toISOString() }
                  : reply
              ),
            };
          }
          return comment;
        });

        return {
          interactions: {
            ...state.interactions,
            [recipeId]: {
              ...state.interactions[recipeId],
              comments: updatedComments,
            } as RecipeInteraction,
          },
        };
      }),

    deleteComment: (recipeId, commentId) =>
      set((state) => {
        const currentComments = state.interactions[recipeId]?.comments || [];
        const updatedComments = currentComments.reduce<Comment[]>(
          (acc, comment) => {
            // If this is the comment to delete and it's a top-level comment
            if (comment._id === commentId) {
              return acc;
            }

            // If this comment has replies, filter out the reply if it matches commentId
            if (comment.replies) {
              const filteredReplies = comment.replies.filter(
                (reply) => reply._id !== commentId
              );
              return [
                ...acc,
                {
                  ...comment,
                  replies:
                    filteredReplies.length > 0 ? filteredReplies : undefined,
                },
              ];
            }

            return [...acc, comment];
          },
          []
        ); // Explicitly provide an empty array as initial value

        return {
          ...state,
          interactions: {
            ...state.interactions,
            [recipeId]: {
              ...state.interactions[recipeId],
              comments: updatedComments,
            } as RecipeInteraction,
          },
        };
      }),

    deleteReply: (recipeId, replyId) =>
      set((state) => {
        const currentComments = state.interactions[recipeId]?.comments || [];
        const updatedComments = currentComments.reduce<Comment[]>(
          (acc, comment) => {
            // If this comment has replies, filter out the reply if it matches replyId
            if (comment.replies) {
              const filteredReplies = comment.replies.filter(
                (reply) => reply._id !== replyId
              );
              return [
                ...acc,
                {
                  ...comment,
                  replies:
                    filteredReplies.length > 0 ? filteredReplies : undefined,
                },
              ];
            }

            return [...acc, comment];
          },
          []
        ); // Explicitly provide an empty array as initial value

        return {
          ...state,
          interactions: {
            ...state.interactions,
            [recipeId]: {
              ...state.interactions[recipeId],
              comments: updatedComments,
            } as RecipeInteraction,
          },
        };
      }),

    setRatings: (recipeId, ratings, average, total) =>
      set((state) => {
        return {
          interactions: {
            ...state.interactions,
            [recipeId]: {
              ...state.interactions[recipeId],
              ratings,
              averageRating: average,
              totalRatings: total,
            } as RecipeInteraction,
          },
        };
      }),

    updateRating: (recipeId, userId, value) =>
      set((state) => {
        const ratings = state.interactions[recipeId]?.ratings || [];
        const existingRatingIndex = ratings.findIndex(
          (r) => r.userId === userId
        );

        let newRatings: Rating[];
        if (existingRatingIndex >= 0) {
          newRatings = ratings.map((r, i) =>
            i === existingRatingIndex ? { ...r, value } : r
          );
        } else {
          newRatings = [...ratings, { userId, value }];
        }

        const total = newRatings.length;
        const average = newRatings.reduce((acc, r) => acc + r.value, 0) / total;
        return {
          interactions: {
            ...state.interactions,
            [recipeId]: {
              ...state.interactions[recipeId],
              ratings: newRatings,
              averageRating: average,
              totalRatings: total,
            } as RecipeInteraction,
          },
        };
      }),

    setLikes: (recipeId, likes) =>
      set((state) => {
        const totalLikes = likes.length;

        return {
          interactions: {
            ...state.interactions,
            [recipeId]: {
              ...state.interactions[recipeId],
              likes,
              totalLikes,
            } as RecipeInteraction,
          },
        };
      }),

    toggleLike: async (recipeId, userId) => {
      set((state) => ({ ...state, isLoading: true }));

      try {
        const response = await axios.post(`/api/recipes/${recipeId}/likes`, {
          userId,
        });
        const { likes, hasLiked } = response.data;

        set((state) => {
          const updatedLikedRecipes = hasLiked
            ? [{ _id: recipeId } as Recipe, ...state.likedRecipes]
            : state.likedRecipes.filter((recipe) => recipe._id !== recipeId);

          return {
            ...state,
            interactions: {
              ...state.interactions,
              [recipeId]: {
                ...state.interactions[recipeId],
                likes,
                hasLiked,
              } as RecipeInteraction,
            },
            likedRecipes: updatedLikedRecipes,
            isLoading: false,
          };
        });

        // Revalidate the liked recipes data
        mutate(`/api/user/${userId}/liked-recipes`);

        return response.data;
      } catch (error) {
        console.error("Error toggling like:", error);
        set((state) => ({ ...state, isLoading: false }));
        throw error;
      }
    },
  })
);

// SWR hook for real-time fetching of likes
export const useRealTimeLikedRecipes = (userId: string) => {
  const { data, error, mutate } = useSWR(
    userId ? `/api/user/${userId}/liked-recipes` : null,
    fetcher
  );

  // Function to manually trigger revalidation
  const revalidate = () => {
    mutate();
  };

  return {
    likedRecipes: data?.likedRecipes || [],
    isLoading: !error && !data,
    isError: error,
    revalidate,
  };
};
