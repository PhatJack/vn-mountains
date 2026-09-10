import api from "@/lib/axios";
import { ENDPOINTS } from "../endpoints";
import type { Mountain } from "../types";

export async function fetchMountains(): Promise<Mountain[]> {
  const { data } = await api.get<Mountain[]>(ENDPOINTS.mountains);
  return data;
}