"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMapStore, type MapStyleKey } from "@/stores/map-store";

const options: { label: string; value: MapStyleKey }[] = [
  { label: "Default (Carto)", value: "default" },
  { label: "OpenStreetMap", value: "openstreetmap" },
  { label: "OpenStreetMap 3D", value: "openstreetmap3d" },
];

export function MapStyles() {
  const style = useMapStore((s) => s.style);
  const setStyle = useMapStore((s) => s.setStyle);

  return (
    <Select value={style} onValueChange={(value) => setStyle(value as MapStyleKey)}>
      <SelectTrigger className="w-44 bg-background">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
