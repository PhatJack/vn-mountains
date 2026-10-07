"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateMountainSuggestionEditInput,
  UpdateMountainSuggestionEditInput,
} from "../types";
import {
  createMountainSuggestionEdit,
  deleteMountainSuggestionEdit,
  fetchMountainSuggestionEdit,
  fetchMountainSuggestionsEdit,
  updateMountainSuggestionEdit,
} from "./mountain-suggestions-edit.client";

export const mountainSuggestionsEditQueryKey = ["mountain-suggestions-edit"] as const;

export function useMountainSuggestionsEdit() {
  return useQuery({
    queryKey: mountainSuggestionsEditQueryKey,
    queryFn: fetchMountainSuggestionsEdit,
  });
}

export function useMountainSuggestionEdit(id: string | null) {
  return useQuery({
    queryKey: [...mountainSuggestionsEditQueryKey, id],
    queryFn: () => fetchMountainSuggestionEdit(id as string),
    enabled: id !== null,
  });
}

export function useCreateMountainSuggestionEdit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMountainSuggestionEditInput) => createMountainSuggestionEdit(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mountainSuggestionsEditQueryKey }),
  });
}

export function useUpdateMountainSuggestionEdit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMountainSuggestionEditInput }) =>
      updateMountainSuggestionEdit(id, input),
    onSuccess: (_data, { id }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: mountainSuggestionsEditQueryKey }),
        queryClient.invalidateQueries({
          queryKey: [...mountainSuggestionsEditQueryKey, id],
        }),
      ]),
  });
}

export function useDeleteMountainSuggestionEdit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMountainSuggestionEdit(id),
    onSuccess: (_data, id) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: mountainSuggestionsEditQueryKey }),
        queryClient.removeQueries({
          queryKey: [...mountainSuggestionsEditQueryKey, id],
        }),
      ]),
  });
}
