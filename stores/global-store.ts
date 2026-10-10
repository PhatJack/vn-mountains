import { create } from "zustand";

interface GlobalStore {
  isOpen: boolean;
  toggle: () => void;
  setOpen: (isOpen: boolean) => void;
  isDialogOpen: boolean;
  toggleDialogOpen: () => void;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  mountainRequestCoordinates: { latitude: number; longitude: number } | null;
  setMountainRequestCoordinates: (coordinates: { latitude: number; longitude: number }) => void;
  clearMountainRequestCoordinates: () => void;
}

export const useGlobalStore = create<GlobalStore>((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (isOpen) => set({ isOpen }),
  isDialogOpen: false,
  toggleDialogOpen: () => set((state) => ({ isDialogOpen: !state.isDialogOpen })),
  setIsDialogOpen: (isDialogOpen) => set({ isDialogOpen }),
  mountainRequestCoordinates: null,
  setMountainRequestCoordinates: (mountainRequestCoordinates) =>
    set({ mountainRequestCoordinates }),
  clearMountainRequestCoordinates: () => set({ mountainRequestCoordinates: null }),
}));
