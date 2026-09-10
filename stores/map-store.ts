import { create } from "zustand";

export const MAP_STYLES = {
  default: undefined,
  openstreetmap: "https://tiles.openfreemap.org/styles/bright",
  openstreetmap3d: "https://tiles.openfreemap.org/styles/liberty",
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;

interface MapStore {
  isMapLoading: boolean;
  style: MapStyleKey;
  setMapLoading: (loading: boolean) => void;
  setStyle: (style: MapStyleKey) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  isMapLoading: true,
  style: "openstreetmap",
  setMapLoading: (loading) => set({ isMapLoading: loading }),
  setStyle: (style) => set({ style }),
}));
