import { create } from "zustand";

type Store = {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isSidebarOpen: boolean) => void;
}
type StoreActions = {
    setIsSidebarOpen: (isSidebarOpen: boolean) => void;
}

const useStore = create<Store & StoreActions>((set) => ({
    isSidebarOpen: false,
    setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
}))