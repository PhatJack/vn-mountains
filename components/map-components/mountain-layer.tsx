"use client";

import { useEffect } from "react";
import { MapPopup, useMap } from "@/components/ui/map";

import type { MountainFeatureCollection } from "@/services/api";
import { GeoJSONSource, Popup } from "maplibre-gl";

interface MountainLayerProps {
  data: MountainFeatureCollection;
}

const SOURCE_ID = "mountains";

export default function MountainLayer({ data }: MountainLayerProps) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;

    if (map.getSource(SOURCE_ID)) {
      return;
    }

    let cancelled = false;

    const setup = async () => {
      // ==========================
      // LOAD ICON TRƯỚC (đợi xong hẳn rồi mới add layer dùng icon này)
      // ==========================
      try {
        if (!map.hasImage("mountain-icon")) {
          const image = await map.loadImage("/mountain.png");
          if (cancelled) return;
          if (!map.hasImage("mountain-icon")) {
            map.addImage("mountain-icon", image.data);
          }
        }
      } catch (error) {
        console.error("Failed to load mountain icon:", error);
      }

      if (cancelled) return;

      // ==========================
      // SOURCE
      // ==========================

      map.addSource(SOURCE_ID, {
        type: "geojson",
        data,
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 50,
      });

      // ==========================
      // CLUSTER CIRCLE
      // ==========================

      map.addLayer({
        id: "mountain-clusters",
        type: "circle",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6",
            10,
            "#f1f075",
            30,
            "#f28cb1",
          ],
          "circle-radius": ["step", ["get", "point_count"], 18, 10, 22, 30, 28],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      // ==========================
      // CLUSTER COUNT
      // ==========================

      map.addLayer({
        id: "mountain-cluster-count",
        type: "symbol",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 12,
          "text-font": ["Open Sans Bold"],
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      // ==========================
      // INDIVIDUAL MOUNTAINS (icon)
      // ==========================

      map.addLayer({
        id: "mountains-point",
        type: "symbol",
        source: SOURCE_ID,
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": "mountain-icon",
          "icon-size": 0.5,
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });

      // ==========================
      // MOUNTAIN NAME
      // ==========================

      map.addLayer({
        id: "mountains-label",
        type: "symbol",
        source: SOURCE_ID,
        filter: ["!", ["has", "point_count"]],
        layout: {
          "text-field": ["get", "name"],
          "text-size": 12,
          "text-offset": [0, 1.5],
          "text-anchor": "top",
          "text-font": ["Open Sans"],
        },
        paint: {
          "text-color": "#111827",
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
        },
      });

      // ==========================
      // CLICK CLUSTER
      // ==========================

      map.on("click", "mountain-clusters", async (event) => {
        const features = map.queryRenderedFeatures(event.point, {
          layers: ["mountain-clusters"],
        });

        if (!features.length) return;

        const clusterId = features[0].properties?.cluster_id;

        const source = map.getSource(SOURCE_ID) as GeoJSONSource;

        const zoom = await source.getClusterExpansionZoom(clusterId);

        map.easeTo({
          center: event.lngLat,
          zoom,
        });
      });

      // ==========================
      // CLICK MOUNTAIN
      // ==========================

      map.on("click", "mountains-point", (event) => {
        const feature = event.features?.[0];
        const { lat, lng } = event.lngLat;

        console.log(event);

        if (!feature) return;

        const properties = feature.properties;

        const name = properties?.name ?? "Unknown Peak";

        const ele = properties?.ele;

        map.flyTo({
          center: [lng, lat],
          zoom: 14,
          duration: 800,
          essential: true,
        });
				// <MapPopup>

				// </MapPopup>

        // new Popup()
        //   .setLngLat(event.lngLat)
        //   .setHTML(
        //     `
        //       <div style="
        //         min-width: 180px;
        //         padding: 4px;
        //       ">
        //         <strong>
        //           ${name}
        //         </strong>

        //         ${
        //           ele
        //             ? `
        //               <div style="
        //                 margin-top: 6px;
        //               ">
        //                 Elevation:
        //                 <strong>
        //                   ${Number(ele).toLocaleString("vi-VN")} m
        //                 </strong>
        //               </div>
        //             `
        //             : ""
        //         }
        //       </div>
        //     `,
        //   )
        //   .addTo(map);
      });

      // ==========================
      // CURSOR
      // ==========================

      map.on("mouseenter", "mountain-clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "mountain-clusters", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("mouseenter", "mountains-point", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "mountains-point", () => {
        map.getCanvas().style.cursor = "";
      });
    };

    setup();

    return () => {
      cancelled = true;

      if (!map.getStyle()) return;

      [
        "mountains-label",
        "mountains-point",
        "mountain-cluster-count",
        "mountain-clusters",
      ].forEach((id) => {
        if (map.getLayer(id)) {
          map.removeLayer(id);
        }
      });

      if (map.getSource(SOURCE_ID)) {
        map.removeSource(SOURCE_ID);
      }
    };
  }, [map, isLoaded, data]);

  return null;
}
