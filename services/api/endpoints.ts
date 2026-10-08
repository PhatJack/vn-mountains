export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7001";
export const R2_PUBLIC_URL = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "").replace(/\/$/, "");

export const ENDPOINTS = {
  mountains: "/mountains",
  mountainById: (id: string) => `/mountains/${id}`,
  mountainByOsmId: "/mountains",
  mountainPhotos: (mountainId: string) => `/mountains/${mountainId}/photos`,
  mountainPhoto: (mountainId: string, photoId: string) =>
    `/mountains/${mountainId}/photos/${photoId}`,
  mountainSuggestionsEdit: "/mountain-suggestions-edit",
  mountainSuggestionEdit: (id: string) => `/mountain-suggestions-edit/${id}`,
  mountainRequests: "/mountain-requests",
} as const;

export function mountainPhotoUrl(storageKey: string): string {
  return R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${storageKey}` : storageKey;
}
