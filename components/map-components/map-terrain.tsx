"use client";

import { useEffect } from "react";
import { useMap } from "@/components/ui/map";

const TERRAIN_SOURCE = "terrainSource";
const HILLSHADE_SOURCE = "hillshadeSource";

interface MapTerrainProps {
  enabled: boolean;
  restorePitch: number;
}

export default function MapTerrain({ enabled, restorePitch }: MapTerrainProps) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;

    if (!enabled) {
      map.setTerrain(null);

      if (map.getLayer("hillshade")) {
        map.removeLayer("hillshade");
      }
      if (map.getSource(HILLSHADE_SOURCE)) {
        map.removeSource(HILLSHADE_SOURCE);
      }
      if (map.getSource(TERRAIN_SOURCE)) {
        map.removeSource(TERRAIN_SOURCE);
      }

      map.setPitch(restorePitch);
      return;
    }

    if (!map.getSource(TERRAIN_SOURCE)) {
      map.addSource(TERRAIN_SOURCE, {
        type: "raster-dem",
        url: "https://tiles.mapterhorn.com/tilejson.json",
        tileSize: 256,
      });
    }

    if (!map.getSource(HILLSHADE_SOURCE)) {
      map.addSource(HILLSHADE_SOURCE, {
        type: "raster-dem",
        url: "https://tiles.mapterhorn.com/tilejson.json",
        tileSize: 256,
      });
    }

    if (!map.getLayer("hillshade")) {
      map.addLayer({
        id: "hillshade",
        type: "hillshade",
        source: HILLSHADE_SOURCE,

        paint: {
          "hillshade-shadow-color": "#473B24",
          "hillshade-highlight-color": "#ffffff",
          "hillshade-accent-color": "#8c7a55",
        },
      });
    }

    map.setTerrain({
      source: TERRAIN_SOURCE,
      exaggeration: 1,
    });

    map.setPitch(60);
  }, [enabled, map, isLoaded, restorePitch]);

  return null;
}
