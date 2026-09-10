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