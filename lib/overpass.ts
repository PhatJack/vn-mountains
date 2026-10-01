const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";

// Vietnam mountain regions: north (Northwest Highlands) + south (Central Highlands)
const VN_BBOXES = [
  "21.5,103,23.5,105.5", // North — Fansipan, Hoang Lien Son, Ha Giang
  "11.5,107.5,14,108.5", // South — Central Highlands, Langbian, Da Lat
];

interface OverpassElement {
  type: string;
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

export interface Mountain {
  id: number;
  name: string;
  elevation: number | null;
  lat: number;
  lng: number;
}

export interface MountainFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    id: number;
    name: string;
    ele: number | null;
  };
}

export interface MountainFeatureCollection {
  type: "FeatureCollection";
  features: MountainFeature[];
}

function parseElevation(ele?: string): number | null {
  if (!ele) return null;
  const num = parseFloat(ele);
  return isNaN(num) ? null : num;
}

export async function fetchMountains(): Promise<MountainFeatureCollection> {
  const bboxFilter = VN_BBOXES.map((b) => `node["natural"="peak"](${b})`).join(";\n  ");
  const query = `[out:json][timeout:60];\n(\n  ${bboxFilter};\n);\nout body;`;

  const response = await fetch(OVERPASS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  const data: OverpassResponse = await response.json();

  const features: MountainFeature[] = data.elements
    .filter((el) => el.lat !== undefined && el.lon !== undefined)
    .map((el) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [el.lon, el.lat] as [number, number],
      },
      properties: {
        id: el.id,
        name: el.tags?.name ?? "Unknown Peak",
        ele: parseElevation(el.tags?.ele),
      },
    }));

  return {
    type: "FeatureCollection",
    features,
  };
}

export function featuresToSortedMountains(collection: MountainFeatureCollection): Mountain[] {
  return collection.features
    .map((f) => ({
      id: f.properties.id,
      name: f.properties.name,
      elevation: f.properties.ele,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
    }))
    .sort((a, b) => {
      if (a.elevation === null && b.elevation === null) return 0;
      if (a.elevation === null) return 1;
      if (b.elevation === null) return -1;
      return b.elevation - a.elevation;
    });
}
