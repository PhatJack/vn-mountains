"use client";

import { useEffect, useRef, useCallback } from "react";
import { Map, GeoJSONSource, Popup, type MapMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MountainFeatureCollection } from "@/lib/overpass";

interface VietnamMapProps {
  data: MountainFeatureCollection | null;
  selectedMountain: { lat: number; lng: number } | null;
  onMountainSelect: (lat: number, lng: number) => void;
}

export default function VietnamMap({
  data,
  selectedMountain,
  onMountainSelect,
}: VietnamMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const popup = useRef<Popup | null>(null);

  const handleMountainClick = useCallback(
    (lat: number, lng: number) => {
      onMountainSelect(lat, lng);
    },
    [onMountainSelect],
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [108.2772, 14.0583],
      zoom: 5.5,
    });

    return () => {
      popup.current?.remove();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add data source and layers when data is ready, update source on data change
  useEffect(() => {
    const m = map.current;
    if (!m || !data) return;

    const ensureIcon = () => {
      if (m.hasImage("mountain-icon")) return;
      m.loadImage("/mountain.png")
        .then((image) => {
          if (!m.hasImage("mountain-icon")) {
            m.addImage("mountain-icon", image.data);
          }
        })
        .catch((err) => {
          console.error("Failed to load mountain icon:", err);
        });
    };

    const addOrUpdateLayers = () => {
      const existing = m.getSource("mountains") as GeoJSONSource | undefined;

      if (existing) {
        // Source already exists — just push the new data in
        existing.setData(data);
        ensureIcon();
        return;
      }

      m.addSource("mountains", {
        type: "geojson",
        data,
        cluster: true,
        clusterMaxZoom: 18,
        clusterRadius: 50,
      });

      // Cluster circles
      m.addLayer({
        id: "clusters",
        type: "circle",
        source: "mountains",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#4ade80",
            10,
            "#facc15",
            30,
            "#f97316",
          ],
          "circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 30, 25],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      // Cluster count text
      m.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "mountains",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Open Sans Bold", "Noto Sans Bold"],
          "text-size": 12,
        },
      });

      // Unclustered points
      m.addLayer({
        id: "unclustered-point",
        type: "symbol",
        source: "mountains",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": "mountain-icon",
          "icon-size": 0.8,
          "icon-allow-overlap": true,
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Regular", "Noto Sans Regular"],
          "text-anchor": "top",
          "text-offset": [0, 1.2],
          "text-size": 11,
          "text-optional": true,
        },
      });

      ensureIcon();
    };

    if (m.isStyleLoaded()) {
      addOrUpdateLayers();
    } else {
      m.on("load", addOrUpdateLayers);
    }

    return () => {
      m.off("load", addOrUpdateLayers);
    };
  }, [data]);

  // Handle cluster clicks → zoom in
  useEffect(() => {
    const m = map.current;
    if (!m) return;

    const onClick = (e: MapMouseEvent) => {
      const features = e.target.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });
      if (!features?.length) return;

      const clusterId = features[0].properties?.cluster_id;
      const source = e.target.getSource("mountains") as GeoJSONSource;

      source
        ?.getClusterExpansionZoom(clusterId)
        .then((zoom) => {
          e.target.easeTo({
            center: (
              features[0].geometry as {
                type: "Point";
                coordinates: [number, number];
              }
            ).coordinates,
            zoom,
            duration: 500,
          });
        })
        .catch(() => {});
    };

    m.on("click", "clusters", onClick);
    return () => {
      m.off("click", "clusters", onClick);
    };
  }, []);

  // Handle unclustered point clicks → popup + callback
  useEffect(() => {
    const m = map.current;
    if (!m) return;

    const onClick = (e: MapMouseEvent) => {
      const features = e.target.queryRenderedFeatures(e.point, {
        layers: ["unclustered-point"],
      });
      if (!features?.length) return;

      const props = features[0].properties;
      const coords = (
        features[0].geometry as { type: "Point"; coordinates: [number, number] }
      ).coordinates;

      const elevationText =
        props.ele !== null && props.ele !== undefined
          ? `${props.ele} m`
          : "N/A";

      popup.current?.remove();
      popup.current = new Popup({ offset: 20 })
        .setLngLat(coords)
        .setHTML(
          `<div style="font-family:system-ui;padding:4px 0;">
            <strong style="font-size:14px;">${props.name}</strong><br/>
            <span style="color:#666;">Elevation: </span>${elevationText}<br/>
            <span style="color:#666;">Coords: </span>${coords[1].toFixed(
              4,
            )}, ${coords[0].toFixed(4)}
          </div>`,
        )
        .addTo(m);

      handleMountainClick(coords[1], coords[0]);
    };

    m.on("click", "unclustered-point", onClick);
    return () => {
      m.off("click", "unclustered-point", onClick);
    };
  }, [handleMountainClick]);

  // Fly to selected mountain from sidebar
  useEffect(() => {
    const m = map.current;
    if (!m || !selectedMountain) return;

    m.flyTo({
      center: [selectedMountain.lng, selectedMountain.lat],
      zoom: 10,
      duration: 1000,
    });
  }, [selectedMountain]);

  return <div ref={mapContainer} className="h-full w-full" />;
}
