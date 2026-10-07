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
import { useTranslations } from "next-intl";

export function MapStyles() {
  const t = useTranslations("map");
  const options: { label: string; value: MapStyleKey }[] = [
    { label: t("default"), value: "default" },
    { label: t("openstreetmap"), value: "openstreetmap" },
    { label: t("openstreetmap3d"), value: "openstreetmap3d" },
  ];
  const style = useMapStore((s) => s.style);
  const setStyle = useMapStore((s) => s.setStyle);

  return (
    <Select value={style} onValueChange={(value) => setStyle(value as MapStyleKey)}>
      <SelectTrigger className="w-44 bg-background">
        <SelectValue render={<span>{t(style)}</span>} />
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
