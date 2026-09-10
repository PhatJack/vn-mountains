"use client";

import { useQuery } from "@tanstack/react-query";
import type { Mountain } from "../types";
import { fetchMountains } from "./mountains.client";

export function useMountains(initialData: Mountain[]) {
  return useQuery({
    queryKey: ["mountains"],
    queryFn: fetchMountains,
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}