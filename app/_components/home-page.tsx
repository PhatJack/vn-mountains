"use client";

import { useMemo, useState } from "react";
import MountainSidebar from "@/components/mountain-sidebar";
import VietnamMapNew from "@/components/viet-nam-map-new";
import { ThemeToggle } from "@/components/theme-toggle";
import { MapStyles } from "@/components/map-styles";
import LanguagesSelect from "@/components/languages";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useMountains, mountainsToFeatureCollection } from "@/services/api";
import type { MountainsData } from "@/services/api/mountains/mountains.server";

const HomePage = ({ initialData }: { initialData: MountainsData }) => {
  const { data: mountains } = useMountains(initialData.mountains);
  const [selectedMountain, setSelectedMountain] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isSidebarOpen = useSidebarStore((state) => state.isOpen);

  const featureCollection = useMemo(() => mountainsToFeatureCollection(mountains), [mountains]);

  const handleSidebarSelect = (lat: number, lng: number) => {
    setSelectedMountain({ lat, lng });
    const found = mountains.find((m) => m.latitude === lat && m.longitude === lng);
    setSelectedId(found?.id ?? null);
  };

  return (
    <div className="flex h-dvh">
      <div className={`shrink-0 overflow-hidden ${isSidebarOpen ? "w-80" : "w-0"}`}>
        <MountainSidebar
          mountains={mountains}
          loading={false}
          onSelect={handleSidebarSelect}
          selectedId={selectedId}
        />
      </div>
      <div className="relative flex-1">
        <VietnamMapNew
          data={featureCollection}
          mountains={mountains}
          selectedMountain={selectedMountain}
          toolbar={
            <>
              <ThemeToggle />
              <MapStyles />
              <LanguagesSelect />
            </>
          }
        />
      </div>
    </div>
  );
};

export default HomePage;
