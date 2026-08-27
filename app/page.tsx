"use client";

import { useState, useEffect } from "react";
import VietnamMap from "@/components/VietNamMap";
import MountainSidebar from "@/components/MountainSidebar";
import {
  fetchMountains,
  featuresToSortedMountains,
  type Mountain,
  type MountainFeatureCollection,
} from "@/lib/overpass";

export default function Home() {
  const [data, setData] = useState<MountainFeatureCollection | null>(null);
  const [mountains, setMountains] = useState<Mountain[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMountain, setSelectedMountain] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetchMountains()
      .then((fc) => {
        setData(fc);
        setMountains(featuresToSortedMountains(fc));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSidebarSelect = (lat: number, lng: number) => {
    setSelectedMountain({ lat, lng });
    const found = mountains.find((m) => m.lat === lat && m.lng === lng);
    setSelectedId(found?.id ?? null);
  };

  const handleMapSelect = (lat: number, lng: number) => {
    const found = mountains.find((m) => m.lat === lat && m.lng === lng);
    setSelectedId(found?.id ?? null);
  };

  return (
    <div className="flex h-dvh">
      <div className="w-80 shrink-0">
        <MountainSidebar
          mountains={mountains}
          loading={loading}
          onSelect={handleSidebarSelect}
          selectedId={selectedId}
        />
      </div>
      <div className="flex-1">
        <VietnamMap
          data={data}
          selectedMountain={selectedMountain}
          onMountainSelect={handleMapSelect}
        />
      </div>
    </div>
  );
}
