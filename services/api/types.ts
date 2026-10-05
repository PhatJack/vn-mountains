export interface Mountain {
  id: string;
  name: string;
  elevationM: number | null;
  latitude: number;
  longitude: number;
}

export interface MountainDetail extends Omit<Mountain, "id"> {
  id: string;
  nameVi?: string | null;
  description?: string | null;
  difficulty?: "beginner" | "basic" | "advanced" | "challenging" | "extremely_hard" | null;
  averageClimbingDuration?: string | null;
  recommendedClimbingPeriod?: string | null;
  trailDistanceKm?: number | null;
  rangeId?: string | null;
  photos?: MountainPhoto[];
  createdAt?: number | null;
  updatedAt?: number | null;
}

export interface MountainPhoto {
  id: string;
  storageKey: string;
  caption: string | null;
  takenAt: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
  updatedAt: number;
}

export interface CreateMountainInput {
  osmId?: number;
  name: string;
  slug: string;
  nameVi?: string;
  latitude: number;
  longitude: number;
  elevationM?: number;
  description?: string;
}

export type UpdateMountainInput = Partial<CreateMountainInput>;

export interface MountainFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    id: string;
    name: string;
    ele: number | null;
  };
}

export interface MountainFeatureCollection {
  type: "FeatureCollection";
  features: MountainFeature[];
}
