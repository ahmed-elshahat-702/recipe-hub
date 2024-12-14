import { create } from "zustand";
import axios from "axios";
import { Recipe } from "@/lib/types/recipe";

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
  fetchLikedRecipes: (userId: string) => Promise<void>;
}

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
      // Perform the async operation first
      set((state) => ({ ...state, isLoading: true }));

      try {
        const response = await axios.post(`/api/recipes/${recipeId}/like`, {
          userId,
        });
        const { likes, totalLikes } = response.data;

        // Find the full recipe object
        const fullRecipe =
          get().likedRecipes.find((r) => r._id === recipeId) ||
          (await axios.get(`/api/recipes/${recipeId}`)).data;

        // Update interactions state
        set((state_2) => {
          // Create a new likedRecipes array
          const updatedLikedRecipes = likes.includes(userId)
            ? // If user liked the recipe, add to the beginning of the array if not already present
              state_2.likedRecipes.some((r) => r._id === recipeId)
              ? state_2.likedRecipes
              : [fullRecipe, ...state_2.likedRecipes]
            : // If user unliked the recipe, remove it from likedRecipes
              state_2.likedRecipes.filter((r) => r._id !== recipeId);

          return {
            isLoading: false,
            interactions: {
              ...state_2.interactions,
              [recipeId]: {
                ...state_2.interactions[recipeId],
                likes,
                totalLikes,
              } as RecipeInteraction,
            },
            likedRecipes: updatedLikedRecipes,
          };
        });

        return response.data;
      } catch (error) {
        console.error("Error toggling like:", error);
        set((state_3) => ({ ...state_3, isLoading: false }));
        throw error;
      } finally {
        set((state_4) => ({ ...state_4, isLoading: false }));
      }
    },

    fetchLikedRecipes: async (userId) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.get(`/api/user/${userId}`);
        const likedRecipes: Recipe[] = response.data?.user?.likedRecipes ?? [];

        // Sort recipes by creation date (newest first)
        likedRecipes.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        set({ likedRecipes, isLoading: false });
      } catch (error) {
        console.error("Failed to fetch liked recipes:", error);
        set({
          likedRecipes: [],
          isLoading: false,
          error: "Failed to fetch liked recipes",
        });
      }
    },
  })
);
