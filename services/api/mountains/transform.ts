import { type Mountain, type MountainFeature, type MountainFeatureCollection } from "../types";

export function sortMountainsByElevation(mountains: Mountain[]): Mountain[] {
  return [...mountains].sort((a, b) => {
    if (a.elevationM === null && b.elevationM === null) return 0;
    if (a.elevationM === null) return 1;
    if (b.elevationM === null) return -1;
    return b.elevationM - a.elevationM;
  });
}

export function mountainsToFeatureCollection(mountains: Mountain[]): MountainFeatureCollection {
  const features: MountainFeature[] = mountains.map((m) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [m.longitude, m.latitude],
    },
    properties: {
      id: m.id,
      name: m.name,
      ele: m.elevationM,
    },
  }));

  return {
    type: "FeatureCollection",
    features,
  };
}
