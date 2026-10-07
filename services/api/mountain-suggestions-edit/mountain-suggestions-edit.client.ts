import api from "@/lib/axios";
import { ENDPOINTS } from "../endpoints";
import type {
  CreateMountainSuggestionEditInput,
  MountainSuggestionEdit,
  UpdateMountainSuggestionEditInput,
} from "../types";

export async function fetchMountainSuggestionsEdit(): Promise<MountainSuggestionEdit[]> {
  const { data } = await api.get<MountainSuggestionEdit[]>(ENDPOINTS.mountainSuggestionsEdit);
  return data;
}

export async function fetchMountainSuggestionEdit(id: string): Promise<MountainSuggestionEdit> {
  const { data } = await api.get<MountainSuggestionEdit>(ENDPOINTS.mountainSuggestionEdit(id));
  return data;
}

export async function createMountainSuggestionEdit(
  input: CreateMountainSuggestionEditInput,
): Promise<MountainSuggestionEdit> {
  const { data } = await api.post<MountainSuggestionEdit>(ENDPOINTS.mountainSuggestionsEdit, input);
  return data;
}

export async function updateMountainSuggestionEdit(
  id: string,
  input: UpdateMountainSuggestionEditInput,
): Promise<MountainSuggestionEdit> {
  const { data } = await api.patch<MountainSuggestionEdit>(
    ENDPOINTS.mountainSuggestionEdit(id),
    input,
  );
  return data;
}

export async function deleteMountainSuggestionEdit(id: string): Promise<MountainSuggestionEdit> {
  const { data } = await api.delete<MountainSuggestionEdit>(ENDPOINTS.mountainSuggestionEdit(id));
  return data;
}
