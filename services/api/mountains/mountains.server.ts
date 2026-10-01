import { readFileSync } from "node:fs";
import { join } from "node:path";
import { API_BASE_URL } from "../endpoints";
import type { Mountain, MountainFeatureCollection } from "../types";
import { mountainsToFeatureCollection, sortMountainsByElevation } from "./transform";

export interface MountainsData {
  mountains: Mountain[];
  featureCollection: MountainFeatureCollection;
}

interface OverpassElement {
  type: string;
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

function parseElevation(ele?: string): number | null {
  if (!ele) return null;
  const num = Number.parseFloat(ele);
  return Number.isNaN(num) ? null : num;
}

function loadFromFallback(): Mountain[] {
  const raw: OverpassElement[] = JSON.parse(
    readFileSync(join(process.cwd(), "constant", "data.json"), "utf-8"),
  );

  return raw
    .filter((el) => el.lat !== undefined && el.lon !== undefined && el.tags?.name)
    .map((el) => ({
      id: el.id,
      name: el.tags!.name,
      elevation: parseElevation(el.tags?.ele),
      lat: el.lat,
      lng: el.lon,
    }));
}

async function fetchMountainsFromApi(): Promise<Mountain[]> {
  const res = await fetch(`${API_BASE_URL}/mountains`, {
    cache: "force-cache",
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Mountains API error: ${res.status}`);
  }

  return (await res.json()) as Mountain[];
}

export async function getMountainsData(): Promise<MountainsData> {
  let mountains: Mountain[];
  try {
    mountains = await fetchMountainsFromApi();
  } catch (err) {
    console.error("[mountains] API unavailable, falling back to data.json", err);
    mountains = loadFromFallback();
  }

  const sorted = sortMountainsByElevation(mountains);

  return {
    mountains: sorted,
    featureCollection: mountainsToFeatureCollection(sorted),
  };
}
