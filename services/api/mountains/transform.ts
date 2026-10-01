import { type Mountain, type MountainFeature, type MountainFeatureCollection } from "../types";

export function sortMountainsByElevation(mountains: Mountain[]): Mountain[] {
  return [...mountains].sort((a, b) => {
    if (a.elevation === null && b.elevation === null) return 0;
    if (a.elevation === null) return 1;
    if (b.elevation === null) return -1;
    return b.elevation - a.elevation;
  });
}

export function mountainsToFeatureCollection(mountains: Mountain[]): MountainFeatureCollection {
  const features: MountainFeature[] = mountains.map((m) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [m.lng, m.lat],
    },
    properties: {
      id: m.id,
      name: m.name,
      ele: m.elevation,
    },
  }));

  return {
    type: "FeatureCollection",
    features,
  };
}
