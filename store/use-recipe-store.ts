import { create } from "zustand";
import { Recipe } from "@/lib/types/recipe";
import axios from "axios";

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

interface RecipeStore {
  recipes: Recipe[];
  filteredRecipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string;
  sortBy: "latest" | "oldest" | "name";
  pagination: PaginationState;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSortBy: (sortBy: "latest" | "oldest" | "name") => void;
  fetchRecipes: () => Promise<void>;
  createRecipe: (recipeData: any) => Promise<void>;
  updateRecipe: (recipeId: string, recipeData: any) => Promise<void>;
  deleteRecipe: (recipeId: string) => Promise<void>;
  filterAndSortRecipes: () => void;
  setPage: (page: number) => void;
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  filteredRecipes: [],
  isLoading: false,
  error: null,
  searchQuery: "",
  selectedCategory: "",
  sortBy: "latest",
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    const store = get();
    store.filterAndSortRecipes();
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    const store = get();
    store.filterAndSortRecipes();
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
    const store = get();
    store.filterAndSortRecipes();
  },

  setPage: (page) => {
    set((state) => ({
      pagination: {
        ...state.pagination,
        currentPage: page,
      },
    }));
    const store = get();
    store.fetchRecipes();
  },

  fetchRecipes: async () => {
    set({ isLoading: true, error: null });
    try {
      const { searchQuery, selectedCategory, pagination } = get();
      const params = new URLSearchParams();
      if (searchQuery) params.set("query", searchQuery);
      if (selectedCategory) params.set("category", selectedCategory);
      params.set("page", pagination.currentPage.toString());
      params.set("limit", "12");

      const response = await axios.get(`/api/recipes?${params.toString()}`);
      if (response.data) {
        set({
          recipes: response.data.recipes,
          pagination: {
            currentPage: response.data.pagination.current,
            totalPages: response.data.pagination.pages,
            totalItems: response.data.pagination.total,
          },
        });
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
    const previousFilteredRecipes = get().filteredRecipes;
    
    // Update both recipes and filteredRecipes arrays
    set({
      recipes: previousRecipes.filter((recipe) => recipe._id !== recipeId),
      filteredRecipes: previousFilteredRecipes.filter((recipe) => recipe._id !== recipeId),
    });

    try {
      // Delete recipe
      await axios.delete(`/api/recipes/${recipeId}`);

      // Remove recipe from user's createdRecipes
      await axios.delete(`/api/user/recipes/${recipeId}`);
    } catch (error) {
      // Revert on error
      set({ 
        recipes: previousRecipes,
        filteredRecipes: previousFilteredRecipes,
      });
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
}));
