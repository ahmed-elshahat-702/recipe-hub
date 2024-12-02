import axios from "axios";
import { create } from "zustand";

interface ProfileData {
  name?: string;
  email?: string;
  image?: string;
  bio?: string;
}

interface ProfileStore {
  profile: ProfileData;
  setProfile: (data: ProfileData) => void;
  updateProfile: (data: Partial<ProfileData>) => void;
  clearProfile: () => void;
}

export const useProfile = create<ProfileStore>((set) => ({
  profile: {},
  setProfile: (data) => set({ profile: data }),
  updateProfile: async (data) => {
    try {
      const response = await axios.put("/api/user/profile", data);
      set((state) => ({
        profile: { ...state.profile, ...response.data },
      }));
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  },
  clearProfile: () => set({ profile: {} }),
}));
