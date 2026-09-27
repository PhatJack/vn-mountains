import api from "@/lib/axios";
import { ENDPOINTS } from "../endpoints";
import type { Mountain, MountainDetail } from "../types";

export async function fetchMountains(): Promise<Mountain[]> {
  const { data } = await api.get<Mountain[]>(ENDPOINTS.mountains);
  return data;
}

export async function fetchMountainDetail(
  id: number,
): Promise<MountainDetail> {
  const { data } = await api.get<MountainDetail | { data: MountainDetail }>(
    ENDPOINTS.mountainDetail,
    { params: { id } },
  );

  return "data" in data ? data.data : data;
}
