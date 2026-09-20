"use client";

import { useEffect, useState } from "react";
import { Mountain } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

const TERRAIN_WARNING_KEY = "mountains-map:terrain-warning-date";

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hasDismissedWarningToday() {
  try {
    return window.localStorage.getItem(TERRAIN_WARNING_KEY) === getLocalDate();
  } catch {
    return false;
  }
}

interface MapTerrainToggleProps {
  onEnabledChange: (enabled: boolean) => void;
}

export default function MapTerrainToggle({
  onEnabledChange,
}: MapTerrainToggleProps) {
  const [enabled, setEnabled] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [warningDismissedToday, setWarningDismissedToday] = useState(() =>
    typeof window === "undefined" ? false : hasDismissedWarningToday(),
  );

  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const timeout = window.setTimeout(() => {
      setWarningDismissedToday(false);
      try {
        window.localStorage.removeItem(TERRAIN_WARNING_KEY);
      } catch {
        // Storage can be unavailable in private or restricted browser contexts.
      }
    }, nextMidnight.getTime() - now.getTime());

    return () => window.clearTimeout(timeout);
  }, []);

  const updateEnabled = (nextEnabled: boolean) => {
    setEnabled(nextEnabled);
    onEnabledChange(nextEnabled);
  };

  const handleCheckedChange = (checked: boolean) => {
    if (!checked) {
      updateEnabled(false);
      return;
    }

    if (warningDismissedToday) {
      updateEnabled(true);
      return;
    }

    setDontAskAgain(false);
    setDialogOpen(true);
  };

  const confirmEnable = () => {
    if (dontAskAgain) {
      try {
        window.localStorage.setItem(TERRAIN_WARNING_KEY, getLocalDate());
      } catch {
        // The terrain toggle still works when storage is unavailable.
      }
      setWarningDismissedToday(true);
    }

    setDialogOpen(false);
    updateEnabled(true);
  };

  return (
    <>
      <div className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background/90 px-2.5 text-sm font-medium shadow-xs backdrop-blur">
        <Mountain aria-hidden="true" size={20}/>
        <Switch
          checked={enabled}
          onCheckedChange={handleCheckedChange}
          aria-label="Terrain map"
        />
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable terrain map?</AlertDialogTitle>
            <AlertDialogDescription>
              Enabling terrain map may affect performance and cause lag,
              especially on lower-end devices.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={dontAskAgain}
              onCheckedChange={(checked) => setDontAskAgain(checked === true)}
            />
            <span>Don&apos;t ask again today</span>
          </label>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEnable}>Enable terrain</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
