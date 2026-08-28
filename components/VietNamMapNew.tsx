"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map,
  MapClusterLayer,
  MapControls,
  type MapRef,
} from "@/components/ui/map";
import MountainDetailSheet from "@/components/MountainDetailSheet";
import type { Mountain, MountainFeatureCollection } from "@/lib/overpass";
import type { Feature, Point, FeatureCollection } from "geojson";
import { useMapStore, MAP_STYLES } from "@/stores/map-store";
import MapTerrain from "./map-components/map-terrain";
import MountainLayer from "./map-components/mountain-layer";

interface VietnamMapNewProps {
  data: MountainFeatureCollection | null;
  mountains: Mountain[];
  selectedMountain: { lat: number; lng: number } | null;
  onMountainSelect: (lat: number, lng: number) => void;
}

const emptyCollection: FeatureCollection<Point> = {
  type: "FeatureCollection",
  features: [],
};

export default function VietnamMapNew({
  data,
	mountains,
  selectedMountain,
  onMountainSelect,
}: VietnamMapNewProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [selected, setSelected] = useState<{
    name: string;
    elevation: number | null;
    lat: number;
    lng: number;
  } | null>(null);

  const style = useMapStore((s) => s.style);
  const setMapLoading = useMapStore((s) => s.setMapLoading);

  const selectedStyle = MAP_STYLES[style] as string | undefined;
  const is3D = style === "openstreetmap3d";
  const mapStyles = selectedStyle
    ? { light: selectedStyle, dark: selectedStyle }
    : undefined;

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

  const input = data ?? emptyCollection;

  const handlePointClick = (
    feature: Feature<Point>,
    coordinates: [number, number],
  ) => {
    const props = feature.properties as {
      name?: string;
      ele?: number | null;
    };
    setSelected({
      name: props.name ?? "Unknown Peak",
      elevation: props.ele ?? null,
      lat: coordinates[1],
      lng: coordinates[0],
    });
    onMountainSelect(coordinates[1], coordinates[0]);
  };

  useEffect(() => {
    if (!selectedMountain) return;
    mapRef.current?.flyTo({
      center: [selectedMountain.lng, selectedMountain.lat],
      zoom: 16,
      duration: 1000,
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
      <MapTerrain />

      {/* {mountains && <MountainLayer data={mountains} />} */}

      <MapClusterLayer
        data={input}
        clusterMaxZoom={20}
        clusterColors={["#4ade80", "#facc15", "#f97316"]}
        clusterThresholds={[10, 30]}
        pointColor="#10b981"
        onPointClick={handlePointClick}
      />
      {selected && (
        <MountainDetailSheet
          mountain={selected}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
        />
      )}
      <MapControls
        position="bottom-right"
        showZoom
        showCompass
        showFullscreen
        showLocate
      />
    </Map>
  );
}
