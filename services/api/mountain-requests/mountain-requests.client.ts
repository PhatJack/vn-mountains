import api from "@/lib/axios";
import { ENDPOINTS } from "../endpoints";
import type { CreateMountainRequestInput, MountainRequest } from "../types";

export async function createMountainRequest(
  input: CreateMountainRequestInput,
): Promise<MountainRequest> {
  const { data } = await api.post<MountainRequest>(ENDPOINTS.mountainRequests, input);
  return data;
}
