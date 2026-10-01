export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7001";

export const ENDPOINTS = {
  mountains: "/mountains",
  mountainById: (id: string) => `/mountains/${id}`,
  mountainByOsmId: "/mountains",
  mountainImages: (mountainId: string) => `/mountains/${mountainId}/images`,
  mountainImage: (mountainId: string, imageId: string) =>
    `/mountains/${mountainId}/images/${imageId}`,
} as const;
