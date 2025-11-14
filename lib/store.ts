import { create } from "zustand";

type Store = {
    isSidebarOpen: boolean;
    isSidebarHovered: boolean;
    setIsSidebarOpen: (isSidebarOpen: boolean) => void;
    setIsSidebarHovered: (isSidebarHovered: boolean) => void;
}
type StoreActions = {
    setIsSidebarOpen: (isSidebarOpen: boolean) => void;
    setIsSidebarHovered: (isSidebarHovered: boolean) => void;
}

export const useStore = create<Store & StoreActions>((set) => ({
    isSidebarOpen: true, // 기본값을 true로 설정 (열린 상태)
    isSidebarHovered: false, // hover 상태
    setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
    setIsSidebarHovered: (isSidebarHovered) => set({ isSidebarHovered }),
}))