export interface Mountain {
  id: number;
  name: string;
  elevation: number | null;
  lat: number;
  lng: number;
}

export interface MountainDetail extends Omit<Mountain, "id"> {
  id: string | number;
  osmId?: number | null;
  nameAscii?: string | null;
  altName?: string | null;
  province?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  images?: Array<{ imageUrl?: string | null; url?: string | null }>;
  tags?: unknown;
  createdAt?: number | null;
  updatedAt?: number | null;
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
