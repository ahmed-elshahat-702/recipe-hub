import { create } from "zustand";
import { Recipe } from "@/lib/types/recipe";
import axios from "axios";

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

interface RecipeAuthor {
  _id: string;
  name: string;
  image: string;
}
interface RecipeStore {
  recipes: Recipe[];
  filteredRecipes: Recipe[];
  isLoading: boolean;
  recipeAuthor: RecipeAuthor | null;
  error: string | null;
  searchQuery: string;
  selectedCategory: string;
  sortBy: "latest" | "oldest" | "name-asc" | "name-desc";
    pagination: PaginationState;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSortBy: (sortBy: "latest" | "oldest" | "name-asc" | "name-desc") => void;
  fetchRecipes: () => Promise<void>;
  fetchRecipeAuthor: (recipe: Recipe) => Promise<void>;
  createRecipe: (recipeData: any) => Promise<void>;
  updateRecipe: (recipeId: string, recipeData: any) => Promise<void>;
  deleteRecipe: (recipeId: string) => Promise<void>;
  filterAndSortRecipes: () => void;
  setPage: (page: number) => void;
  profileRecipes: Recipe[];
  anyUserRecipes: Recipe[];
  fetchProfileRecipes: (userId: string) => Promise<void>;
  fetchAnyUserRecipes: (userId: string) => Promise<void>;
  addProfileRecipe: (recipe: Recipe) => void;
  removeProfileRecipe: (recipeId: string) => void;
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  filteredRecipes: [],
  isLoading: false,
  recipeAuthor: null,
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

  profileRecipes: [],
  anyUserRecipes: [],

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

  fetchRecipeAuthor: async (recipe: Recipe) => {
    set({ error: null });

    try {
      if (!recipe.author?._id) {
        set({ recipeAuthor: null });
        return;
      }
      const response = await axios.get(`/api/user/${recipe.author._id}`);
      set({ recipeAuthor: response.data.user });
    } catch (error) {
      console.error("Error fetching recipe author:", error);
      set({ recipeAuthor: null });
    }
  },

  deleteRecipe: async (recipeId: string) => {
    // Optimistically update UI for all recipe lists
    const previousRecipes = get().recipes;
    const previousFilteredRecipes = get().filteredRecipes;
    const previousProfileRecipes = get().profileRecipes;

    set({
      recipes: previousRecipes.filter((recipe) => recipe._id !== recipeId),
      filteredRecipes: previousFilteredRecipes.filter(
        (recipe) => recipe._id !== recipeId
      ),
      profileRecipes: previousProfileRecipes.filter(
        (recipe) => recipe._id !== recipeId
      ),
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
        profileRecipes: previousProfileRecipes,
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
          case "name-asc":
            return a.title.localeCompare(b.title);
          case "name-desc":
            return b.title.localeCompare(a.title);
          default:
          return 0;
      }
    });

    set({ filteredRecipes: filtered });
  },

  fetchProfileRecipes: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/user/${userId}/recipes`);
      const profileRecipes: Recipe[] = response.data?.createdRecipes ?? [];

      // Sort recipes by creation date (newest first)
      profileRecipes.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      set({ profileRecipes, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch profile recipes:", error);
      set({
        profileRecipes: [],
        isLoading: false,
        error: "Failed to fetch profile recipes",
      });
    }
  },

  fetchAnyUserRecipes: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/user/${userId}/recipes`);
      const anyUserRecipes: Recipe[] = response.data?.createdRecipes ?? [];

      // Sort recipes by creation date (newest first)
      anyUserRecipes.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      set({ anyUserRecipes, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch profile recipes:", error);
      set({
        anyUserRecipes: [],
        isLoading: false,
        error: "Failed to fetch profile recipes",
      });
    }
  },

  addProfileRecipe: (recipe) => {
    set((state) => ({
      profileRecipes: [recipe, ...state.profileRecipes],
    }));
  },

  removeProfileRecipe: (recipeId) => {
    set((state) => ({
      profileRecipes: state.profileRecipes.filter(
        (recipe) => recipe._id !== recipeId
      ),
    }));
  },
}));
