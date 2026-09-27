"use client";

import { useMemo, useState } from "react";
import MountainSidebar from "@/components/MountainSidebar";
import VietnamMapNew from "@/components/VietNamMapNew";
import { ThemeToggle } from "@/components/theme-toggle";
import { MapStyles } from "@/components/MapStyles";
import LanguagesSelect from "@/components/Languages";
import { useMountains, mountainsToFeatureCollection } from "@/services/api";
import type { MountainsData } from "@/services/api/mountains/mountains.server";

const HomePage = ({ initialData }: { initialData: MountainsData }) => {
  const { data: mountains } = useMountains(initialData.mountains);
  const [selectedMountain, setSelectedMountain] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const featureCollection = useMemo(
    () => mountainsToFeatureCollection(mountains),
    [mountains],
  );

  const handleSidebarSelect = (lat: number, lng: number) => {
    setSelectedMountain({ lat, lng });
    const found = mountains.find((m) => m.lat === lat && m.lng === lng);
    setSelectedId(found?.id ?? null);
  };

  return (
    <div className="flex h-dvh">
      <div className="w-80 shrink-0">
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
              {/* <LanguagesSelect /> */}
            </>
          }
        />
      </div>
    </div>
  );
};

export default HomePage;
