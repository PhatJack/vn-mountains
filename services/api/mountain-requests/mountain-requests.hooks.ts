"use client";

import { useMutation } from "@tanstack/react-query";
import type { CreateMountainRequestInput } from "../types";
import { createMountainRequest } from "./mountain-requests.client";

export function useCreateMountainRequest() {
  return useMutation({
    mutationFn: (input: CreateMountainRequestInput) => createMountainRequest(input),
  });
}
