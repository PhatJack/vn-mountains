"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Map,
  MapClusterLayer,
  MapControls,
  type MapRef,
} from "@/components/ui/map";
import MountainDetailSheet from "@/components/MountainDetailSheet";
import type { MountainFeatureCollection } from "@/services/api";
import type { Feature, Point, FeatureCollection } from "geojson";
import { useMapStore, MAP_STYLES } from "@/stores/map-store";
import MapTerrain from "./map-components/map-terrain";
import MountainLayer from "./map-components/mountain-layer";

interface VietnamMapNewProps {
  data: MountainFeatureCollection | null;
  selectedMountain: { lat: number; lng: number } | null;
  // onMountainSelect: (lat: number, lng: number) => void;
  toolbar?: ReactNode;
}

export default function VietnamMapNew({
  data,
  selectedMountain,
  toolbar,
}: VietnamMapNewProps) {
  const mapRef = useRef<MapRef | null>(null);

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
      {toolbar}
      {/* <MapTerrain /> */}

      {data && <MountainLayer data={data} />}
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
