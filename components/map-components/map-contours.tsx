"use client";

import { useEffect } from "react";
import mlcontour from "maplibre-contour";
import * as maplibregl from "maplibre-gl";
import { useMap } from "@/components/ui/map";

const CONTOUR_SOURCE = "mountains-contours";
const CONTOUR_LINES = "mountains-contour-lines";
const CONTOUR_LABELS = "mountains-contour-labels";

// Mapterhorn serves 512px Terrarium-encoded elevation tiles, the same source used by terrain mode.
const DEM_TILES =
  process.env.NEXT_PUBLIC_DEM_TILES_URL ??
  "https://tiles.mapterhorn.com/{z}/{x}/{y}.webp";

const contourThresholds = {
  5: [100, 500],
  7: [50, 250],
  9: [20, 100],
  11: [10, 50],
  13: [5, 25],
  15: [2, 10],
};

interface MapContoursProps {
  enabled: boolean;
}

export default function MapContours({ enabled }: MapContoursProps) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;

    if (!enabled) {
      if (map.getLayer(CONTOUR_LABELS)) map.removeLayer(CONTOUR_LABELS);
      if (map.getLayer(CONTOUR_LINES)) map.removeLayer(CONTOUR_LINES);
      if (map.getSource(CONTOUR_SOURCE)) map.removeSource(CONTOUR_SOURCE);
      return;
    }

    const demSource = new mlcontour.DemSource({
      url: DEM_TILES,
      encoding: "terrarium",
      maxzoom: 13,
      worker: true,
      cacheSize: 150,
    });
    demSource.setupMaplibre(maplibregl);

    map.addSource(CONTOUR_SOURCE, {
      type: "vector",
      tiles: [
        demSource.contourProtocolUrl({
          thresholds: contourThresholds,
          //default=1 for meters
          multiplier: 1,
					// multiplier: 3.28084,
          contourLayer: "contours",
          elevationKey: "ele",
          levelKey: "level",
        }),
      ],
      maxzoom: 15,
    });

    map.addLayer({
      id: CONTOUR_LINES,
      type: "line",
      source: CONTOUR_SOURCE,
      "source-layer": "contours",
      paint: {
        "line-color": "#7b5e3b",
        "line-opacity": 0.62,
        "line-width": ["match", ["get", "level"], 1, 1.25, 0.65],
      },
    });

    map.addLayer({
      id: CONTOUR_LABELS,
      type: "symbol",
      source: CONTOUR_SOURCE,
      "source-layer": "contours",
      filter: [">", ["get", "level"], 0],
      layout: {
        "symbol-placement": "line",
        "text-size": 10,
        "text-field": ["concat", ["number-format", ["get", "ele"], {}], " m"],
        "text-font": ["Open Sans Regular"],
      },
      paint: {
        "text-color": "#654b2d",
        "text-halo-color": "rgba(255, 252, 239, 0.9)",
        "text-halo-width": 1.25,
      },
    });

    return () => {
      if (map.getLayer(CONTOUR_LABELS)) map.removeLayer(CONTOUR_LABELS);
      if (map.getLayer(CONTOUR_LINES)) map.removeLayer(CONTOUR_LINES);
      if (map.getSource(CONTOUR_SOURCE)) map.removeSource(CONTOUR_SOURCE);
    };
  }, [enabled, isLoaded, map]);

  return null;
}
