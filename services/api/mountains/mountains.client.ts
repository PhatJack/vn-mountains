import api from "@/lib/axios";
import { ENDPOINTS } from "../endpoints";
import type {
  CreateMountainInput,
  Mountain,
  MountainDetail,
  MountainImage,
  UpdateMountainInput,
} from "../types";

export async function fetchMountains(): Promise<Mountain[]> {
  const { data } = await api.get<Mountain[]>(ENDPOINTS.mountains);
  return data;
}

export async function fetchMountainDetail(id: string): Promise<MountainDetail> {
  const { data } = await api.get<MountainDetail>(
    ENDPOINTS.mountainByOsmId,
    { params: { id } },
  );

  return data;
}

export async function createMountain(input: CreateMountainInput): Promise<MountainDetail> {
  const { data } = await api.post<MountainDetail>(ENDPOINTS.mountains, input);
  return data;
}

export async function updateMountain(
  id: string,
  input: UpdateMountainInput,
): Promise<MountainDetail> {
  const { data } = await api.patch<MountainDetail>(ENDPOINTS.mountainById(id), input);
  return data;
}

export async function deleteMountain(id: string): Promise<MountainDetail> {
  const { data } = await api.delete<MountainDetail>(ENDPOINTS.mountainById(id));
  return data;
}

export async function fetchMountainImages(mountainId: string): Promise<MountainImage[]> {
  const { data } = await api.get<MountainImage[]>(ENDPOINTS.mountainImages(mountainId));
  return data;
}

export async function uploadMountainImage(
  mountainId: string,
  file: File,
): Promise<MountainImage> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<MountainImage>(
    ENDPOINTS.mountainImages(mountainId),
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return data;
}

export async function deleteMountainImage(mountainId: string, imageId: string): Promise<{ id: string }> {
  const { data } = await api.delete<{ id: string }>(
    ENDPOINTS.mountainImage(mountainId, imageId),
  );
  return data;
}
