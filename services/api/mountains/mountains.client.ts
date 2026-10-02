import api from "@/lib/axios";
import { ENDPOINTS } from "../endpoints";
import type {
  CreateMountainInput,
  Mountain,
  MountainDetail,
  MountainPhoto,
  UpdateMountainInput,
} from "../types";

export interface UploadMountainPhotoInput {
  file: File;
  caption?: string;
  takenAt?: string;
}

export async function fetchMountains(): Promise<Mountain[]> {
  const { data } = await api.get<Mountain[]>(ENDPOINTS.mountains);
  return data;
}

export async function fetchMountainDetail(id: string): Promise<MountainDetail> {
  const { data } = await api.get<MountainDetail>(ENDPOINTS.mountainById(id));

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

export async function fetchMountainPhotos(mountainId: string): Promise<MountainPhoto[]> {
  const { data } = await api.get<MountainPhoto[]>(ENDPOINTS.mountainPhotos(mountainId));
  return data;
}

export async function uploadMountainPhoto(
  mountainId: string,
  input: UploadMountainPhotoInput,
): Promise<MountainPhoto> {
  const formData = new FormData();
  formData.append("file", input.file);
  if (input.caption?.trim()) formData.append("caption", input.caption.trim());
  if (input.takenAt) formData.append("takenAt", new Date(input.takenAt).toISOString());

  const { data } = await api.post<MountainPhoto>(ENDPOINTS.mountainPhotos(mountainId), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function deleteMountainPhoto(
  mountainId: string,
  photoId: string,
): Promise<{ id: string }> {
  const { data } = await api.delete<{ id: string }>(ENDPOINTS.mountainPhoto(mountainId, photoId));
  return data;
}
