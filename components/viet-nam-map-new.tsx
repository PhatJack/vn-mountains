"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  Map,
  MapClusterLayer,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
  type MapRef,
} from "@/components/ui/map";
import MountainDetailDialog from "@/components/mountain-detail-dialog";
import type { MountainFeatureCollection } from "@/services/api";
import { useMapStore, MAP_STYLES } from "@/stores/map-store";
import MapTerrain from "./map-components/map-terrain";
import MapTerrainToggle from "./map-components/map-terrain-toggle";
import MapContours from "./map-components/map-contours";
import MapContoursToggle from "./map-components/map-contours-toggle";
import MountainLayer from "./map-components/mountain-layer";
import type { Mountain } from "@/services/api";
import { useTranslations } from "next-intl";
import { coordinateToDMS } from "@/lib/utils";
import { Button } from "./ui/button";
import { PanelLeftClose, PanelLeftOpen, Plus, X } from "lucide-react";
import { useGlobalStore } from "@/stores/global-store";
import { TooltipCustom } from "./tooltip-custom";

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
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [terrainEnabled, setTerrainEnabled] = useState(false);
  const [contoursEnabled, setContoursEnabled] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<{
    id: string;
    lat: number;
    lng: number;
  } | null>(null);
  const t = useTranslations();

  const style = useMapStore((s) => s.style);
  const setMapLoading = useMapStore((s) => s.setMapLoading);
  const isSidebarOpen = useGlobalStore((s) => s.isOpen);
  const toggleSidebar = useGlobalStore((s) => s.toggle);
  const setMountainRequestCoordinates = useGlobalStore((s) => s.setMountainRequestCoordinates);
  const setDialogOpen = useGlobalStore((s) => s.setIsDialogOpen);
  const requestCoordinates = useGlobalStore((s) => s.mountainRequestCoordinates);
  const previousRequestCoordinates = useRef(requestCoordinates);

  useEffect(() => {
    if (previousRequestCoordinates.current && !requestCoordinates) {
      setLocation(null);
    }
    previousRequestCoordinates.current = requestCoordinates;
  }, [requestCoordinates]);

  const handleCoordinateSelect = ({
    latitude,
    longitude,
  }: {
    latitude: number;
    longitude: number;
  }) => {
    setLocation({ lat: latitude, lng: longitude });
  };

  const handleOpenMountainRequest = () => {
    if (!location) return;
    setMountainRequestCoordinates({ latitude: location.lat, longitude: location.lng });
    setLocation(null);
    setDialogOpen(true);
  };

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
      <div className="absolute top-3 w-full">
        <div className="flex w-full items-center justify-between px-3">
          <div className="">
            <TooltipCustom
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={toggleSidebar}
                  aria-label={
                    isSidebarOpen
                      ? t("map.controls.hideMountainList")
                      : t("map.controls.showMountainList")
                  }
                >
                  {isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
                </Button>
              }
            >
              {t("map.controls.toggleSidebar")}
            </TooltipCustom>
          </div>
          <div className="flex items-end gap-4">
            {toolbar}
            <MapTerrainToggle onEnabledChange={setTerrainEnabled} />
            {/* <MapContoursToggle onEnabledChange={setContoursEnabled} /> */}
          </div>
        </div>
      </div>
      <MapTerrain enabled={terrainEnabled} restorePitch={is3D ? 60 : 0} />
      <MapContours enabled={contoursEnabled} />

      {data && (
        <MountainLayer data={data} onMountainSelect={(selection) => setSelectedDetail(selection)} />
      )}
      <MapControls
        position="bottom-right"
        showZoom
        showCompass
        showFullscreen
        showLocate
        showCoordinatePicker
        coordinatePickerLabel={t("map.coordinatePicker")}
        onCoordinateSelect={handleCoordinateSelect}
        onLocate={(coord) => {
          setLocation({ lat: coord.latitude, lng: coord.longitude });
        }}
      />
      <MountainDetailDialog
        mountainId={selectedDetail?.id ?? null}
        summary={
          selectedDetail
            ? (mountains.find((mountain) => mountain.id === selectedDetail.id) ?? {
                id: selectedDetail.id,
                name: t("mountainDetail.unknownPeak"),
                elevationM: null,
                latitude: selectedDetail.lat,
                longitude: selectedDetail.lng,
              })
            : null
        }
        onOpenChange={(open) => {
          if (!open) setSelectedDetail(null);
        }}
      />
      {location && (
        <MapMarker latitude={location.lat} longitude={location.lng}>
          <MarkerContent>
            <Image
              src="/marker.png"
              alt=""
              width={32}
              height={32}
              className="size-8 object-contain"
            />
          </MarkerContent>

          <MarkerTooltip>{t("map.locationTooltip")}</MarkerTooltip>

          <MarkerPopup>
            <div className="space-y-1">
              <p className="font-medium text-foreground">{t("map.locationTitle")}</p>

              <p className="text-xs text-muted-foreground">
                {coordinateToDMS(location.lat, "latitude")},{" "}
                {coordinateToDMS(location.lng, "longitude")}
              </p>
            </div>
          </MarkerPopup>
        </MapMarker>
      )}
      {location && (
        <div className="absolute bottom-4 left-1/2 z-20 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-3 rounded-lg border border-border bg-background/95 px-3 py-2 shadow-lg backdrop-blur-sm">
          <div className="text-xs text-foreground">
            <div>
              {t("map.latitude")}: {location.lat.toFixed(6)}
            </div>
            <div>
              {t("map.longitude")}: {location.lng.toFixed(6)}
            </div>
          </div>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={handleOpenMountainRequest}
            aria-label={t("map.addMountain")}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      )}
    </Map>
  );
}
