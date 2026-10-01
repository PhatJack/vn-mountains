export interface Mountain {
  id: string;
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
  images?: MountainImage[];
  tags?: unknown;
  createdAt?: number | null;
  updatedAt?: number | null;
}

export interface MountainImage {
  id: string;
  imageUrl: string;
  url?: string;
  sortOrder: number;
}

export interface CreateMountainInput {
  osmId?: number;
  name: string;
  nameAscii?: string;
  altName?: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  province?: string;
  description?: string;
  imageUrl?: string;
}

export type UpdateMountainInput = Partial<CreateMountainInput>;

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
