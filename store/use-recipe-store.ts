import { create } from "zustand";
import { Recipe } from "@/lib/types/recipe";
import axios from "axios";

interface RecipeStore {
  recipes: Recipe[];
  filteredRecipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string;
  sortBy: "latest" | "oldest" | "name";
  fetchRecipes: () => Promise<void>;
  deleteRecipe: (recipeId: string) => Promise<void>;
  createRecipe: (recipeData: any) => Promise<void>;
  updateRecipe: (recipeId: string, recipeData: any) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSortBy: (sort: "latest" | "oldest" | "name") => void;
  filterAndSortRecipes: () => void;
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  filteredRecipes: [],
  isLoading: false,
  error: null,
  searchQuery: "",
  selectedCategory: "",
  sortBy: "latest",

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    const store = get();
    store.filterAndSortRecipes();
  },

  setSelectedCategory: (category: string) => {
    set({ selectedCategory: category });
    const store = get();
    store.filterAndSortRecipes();
  },

  setSortBy: (sort: "latest" | "oldest" | "name") => {
    set({ sortBy: sort });
    const store = get();
    store.filterAndSortRecipes();
  },

  filterAndSortRecipes: () => {
    const { recipes, searchQuery, selectedCategory, sortBy } = get();

    let filtered = [...recipes];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((recipe) =>
        recipe.categories?.includes(selectedCategory)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "name":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    set({ filteredRecipes: filtered });
  },

  fetchRecipes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get("/api/recipes");
      if (response.data && Array.isArray(response.data.recipes)) {
        set({ recipes: response.data.recipes });
        const store = get();
        store.filterAndSortRecipes();
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
      set({ error: "Failed to fetch recipes" });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteRecipe: async (recipeId: string) => {
    // Optimistically update UI
    const previousRecipes = get().recipes;
    set({
      recipes: previousRecipes.filter((recipe) => recipe._id !== recipeId),
    });

    try {
      // Delete recipe
      await axios.delete(`/api/recipes/${recipeId}`);

      // Remove recipe from user's createdRecipes
      await axios.delete(`/api/user/recipes/${recipeId}`);
    } catch (error) {
      // Revert on error
      set({ recipes: previousRecipes });
      console.error("Error deleting recipe:", error);
      set({ error: "Failed to delete recipe" });
    }
  },

  createRecipe: async (recipeData: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post("/api/recipes", recipeData);
      if (response.data) {
        set((state) => ({
          recipes: [...state.recipes, response.data],
        }));
      }
    } catch (error) {
      console.error("Error creating recipe:", error);
      set({ error: "Failed to create recipe" });
    } finally {
      set({ isLoading: false });
    }
  },

  updateRecipe: async (recipeId: string, recipeData: any) => {
    try {
      // First get the current recipe data
      const response = await axios.patch(
        `/api/recipes/${recipeId}`,
        recipeData
      );

      if (response.data) {
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe._id === recipeId
              ? {
                  ...response.data,
                  images: recipeData.images || response.data.images,
                }
              : recipe
          ),
        }));
      }
    } catch (error) {
      console.error("Error updating recipe:", error);
      set({ error: "Failed to update recipe" });
    }
  },
}));
