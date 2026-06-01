import { create } from "zustand";

interface AppState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  selectedDepartment: string | null;
  setSelectedDepartment: (dept: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  selectedDepartment: null,
  setSelectedDepartment: (dept) => set({ selectedDepartment: dept }),
}));