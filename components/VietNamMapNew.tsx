"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Map, MapClusterLayer, MapControls, type MapRef } from "@/components/ui/map";
import MountainDetailDialog from "@/components/MountainDetailDialog";
import type { MountainFeatureCollection } from "@/services/api";
import { useMapStore, MAP_STYLES } from "@/stores/map-store";
import MapTerrain from "./map-components/map-terrain";
import MapTerrainToggle from "./map-components/map-terrain-toggle";
import MapContours from "./map-components/map-contours";
import MapContoursToggle from "./map-components/map-contours-toggle";
import MountainLayer from "./map-components/mountain-layer";
import type { Mountain } from "@/services/api";

interface VietnamMapNewProps {
  data: MountainFeatureCollection | null;
  selectedMountain: { lat: number; lng: number } | null;
  mountains?: Mountain[];
  // onMountainSelect: (lat: number, lng: number) => void;
  toolbar?: ReactNode;
}

export default function VietnamMapNew({
  data,
  selectedMountain,
  mountains = [],
  toolbar,
}: VietnamMapNewProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [terrainEnabled, setTerrainEnabled] = useState(false);
  const [contoursEnabled, setContoursEnabled] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<{
    id: number;
    lat: number;
    lng: number;
  } | null>(null);

  const style = useMapStore((s) => s.style);
  const setMapLoading = useMapStore((s) => s.setMapLoading);

  const selectedStyle = MAP_STYLES[style] as string | undefined;
  const is3D = style === "openstreetmap3d";
  const mapStyles = selectedStyle ? { light: selectedStyle, dark: selectedStyle } : undefined;

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.easeTo({ pitch: is3D ? 60 : 0, duration: 500 });
    }
  }, [is3D]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const onLoad = () => setMapLoading(false);
    if (map.isStyleLoaded()) {
      setMapLoading(false);
    } else {
      map.on("load", onLoad);
    }
    return () => {
      map.off("load", onLoad);
    };
  }, [setMapLoading]);

  useEffect(() => {
    if (!selectedMountain) return;
    const map = mapRef.current;
    if (!map) return;

    // Cancel any in-flight animation to handle rapid clicks
    if (map.isMoving()) {
      map.stop();
    }

    // Use jumpTo for instant navigation - starts tile loading immediately
    // without animation delay. This ensures tiles begin loading right away.
    map.flyTo({
      center: [selectedMountain.lng, selectedMountain.lat],
      zoom: 14,
      duration: 1500,
      // padding: {
      //   top: 50,
      //   bottom: 0,
      //   left: 0,
      //   right: 0,
      // },
    });
  }, [selectedMountain]);

  return (
    <Map
      ref={mapRef}
      className="h-full w-full"
      center={[108.2772, 14.0583]}
      zoom={5.5}
      styles={mapStyles}
    >
      <div className="absolute top-3 right-3 z-10 flex gap-4">
        {toolbar}
        <MapTerrainToggle onEnabledChange={setTerrainEnabled} />
        <MapContoursToggle onEnabledChange={setContoursEnabled} />
      </div>
      <MapTerrain enabled={terrainEnabled} restorePitch={is3D ? 60 : 0} />
      <MapContours enabled={contoursEnabled} />

      {data && (
        <MountainLayer data={data} onMountainSelect={(selection) => setSelectedDetail(selection)} />
      )}
      <MapControls position="bottom-right" showZoom showCompass showFullscreen showLocate />
      <MountainDetailDialog
        mountainId={selectedDetail?.id ?? null}
        summary={
          selectedDetail
            ? (mountains.find((mountain) => mountain.id === selectedDetail.id) ?? {
                id: selectedDetail.id,
                name: "Unknown Peak",
                elevation: null,
                lat: selectedDetail.lat,
                lng: selectedDetail.lng,
              })
            : null
        }
        onOpenChange={(open) => {
          if (!open) setSelectedDetail(null);
        }}
      />
    </Map>
  );
}
