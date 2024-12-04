import { create } from "zustand";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
}

interface UserStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get("/api/user/profile");
      set({ user: response.data, isLoading: false });
    } catch (error) {
      set({ error: "Failed to fetch user", isLoading: false });
    }
  },
  updateUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put("/api/user/profile", data);
      set({ user: response.data, isLoading: false });
    } catch (error) {
      set({ error: "Failed to update user", isLoading: false });
    }
  },
}));
