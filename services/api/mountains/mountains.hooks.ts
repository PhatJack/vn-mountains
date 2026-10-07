"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Mountain } from "../types";
import {
  fetchMountainDetail,
  fetchMountains,
  uploadMountainPhoto,
  type UploadMountainPhotoInput,
} from "./mountains.client";

/**
 *
 * @param
 * @returns
 */
export function useMountains(initialData: Mountain[]) {
  return useQuery({
    queryKey: ["mountains"],
    queryFn: fetchMountains,
    initialData,
    staleTime: 24 * 60 * 60 * 1000, // 1 ngày
    gcTime: 24 * 60 * 60 * 1000, // nên >= staleTime
  });
}

export function useMountainDetail(id: string | null) {
  return useQuery({
    queryKey: ["mountain", id],
    queryFn: () => fetchMountainDetail(id as string),
    enabled: id !== null,
  });
}

export function useUploadMountainPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mountainId, input }: { mountainId: string; input: UploadMountainPhotoInput }) =>
      uploadMountainPhoto(mountainId, input),
    onSuccess: (_photo, { mountainId }) => {
      return queryClient.invalidateQueries({ queryKey: ["mountain", mountainId] });
    },
  });
}
