import axios, { type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/services/api/endpoints";

type RetriableRequestConfig = InternalAxiosRequestConfig & { _authRetry?: boolean };

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  return config;
});

let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(undefined, async (error) => {
  const config = error.config as RetriableRequestConfig | undefined;
  const isUnauthorized = error.response?.status === 401;
  const isAuthRequest = config?.url?.startsWith("/auth/");

  if (!config || !isUnauthorized || config._authRetry || isAuthRequest) {
    return Promise.reject(error);
  }

  config._authRetry = true;
  refreshPromise ??= api
    .post("/auth/refresh")
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null;
    });

  try {
    await refreshPromise;
    return api(config);
  } catch {
    return Promise.reject(error);
  }
});

export default api;
