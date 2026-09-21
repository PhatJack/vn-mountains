"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface MapContoursToggleProps {
  onEnabledChange: (enabled: boolean) => void;
}

export default function MapContoursToggle({
  onEnabledChange,
}: MapContoursToggleProps) {
  const [enabled, setEnabled] = useState(false);

  const handleChange = (nextEnabled: boolean) => {
    setEnabled(nextEnabled);
    onEnabledChange(nextEnabled);
  };

  return (
    <div className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background/90 px-2.5 text-sm font-medium shadow-xs backdrop-blur">
      <Layers aria-hidden="true" size={18} />
      <Switch
        checked={enabled}
        onCheckedChange={handleChange}
        aria-label="Contour lines"
      />
    </div>
  );
}
