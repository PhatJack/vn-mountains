const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";

// Vietnam mountain regions: north (Northwest Highlands) + south (Central Highlands)
const VN_BBOXES = [
  // North
  "20,102,23.5,106",

  // North East
  "20,106,23.5,110",

  // North Central
  "17,102,20,106",

  // Central
  "14,102,17,109",

  // South Central
  "11,108,14,109",

  // Central Highlands
  "11,106,14,108",

  // South
  "8.5,102,11,108",

  // South East
  "8.5,108,12,110",
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
  const bboxFilter = VN_BBOXES.map((b) => `node["natural"="peak"](${b})`).join(
    ";\n  ",
  );
  // const query = `[out:json][timeout:60];\n(\n  ${bboxFilter};\n);\nout body;`;
  const query = `
    [out:json][timeout:90];
    area["ISO3166-1"="VN"][admin_level=2]->.vietnam;
    (
      node["natural"="peak"](area.vietnam);
      way["natural"="peak"](area.vietnam);
      relation["natural"="peak"](area.vietnam);
    );
    out center;
  `;

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

export function featuresToSortedMountains(
  collection: MountainFeatureCollection,
): Mountain[] {
  return collection.features
    .filter((f) => !f.properties.name.includes("Unknown"))
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
