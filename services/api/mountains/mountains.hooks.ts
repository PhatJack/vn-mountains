"use client";

import { useQuery } from "@tanstack/react-query";
import type { Mountain } from "../types";
import { fetchMountainDetail, fetchMountains } from "./mountains.client";

export function useMountains(initialData: Mountain[]) {
  return useQuery({
    queryKey: ["mountains"],
    queryFn: fetchMountains,
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMountainDetail(id: string | null) {
  return useQuery({
    queryKey: ["mountain", id],
    queryFn: () => fetchMountainDetail(id as string),
    enabled: id !== null,
  });
}
