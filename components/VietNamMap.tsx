"use client";

import { useEffect, useRef } from "react";
import { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function VietnamMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Center set to Vietnam: [Longitude, Latitude]
    map.current = new Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [108.2772, 14.0583], // Center of Vietnam
      zoom: 5.5,
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return <div ref={mapContainer} className="h-screen w-full" />;
}
