import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { ApiErrorResponse } from "@/types/auth";

const ACCESS_TOKEN_KEY = "danceflow_access_token";
const REFRESH_TOKEN_KEY = "danceflow_refresh_token";

const resolvedApiBaseUrl = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export const api = axios.create({
  baseURL: resolvedApiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/login/") &&
      !originalRequest.url?.includes("/api/auth/token/refresh/")
    ) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (refresh) {
        try {
          const { data } = await axios.post<{ access: string }>(
            `${resolvedApiBaseUrl}/api/auth/token/refresh/`,
            { refresh }
          );
          localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem("danceflow_user");
        }
      }
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown, fallback = "Ocurrió un error inesperado"): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  const data = error.response?.data;

  if (!data) {
    return error.message || fallback;
  }

  if (typeof data.detail === "string") return data.detail;

  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
    return data.non_field_errors[0];
  }

  for (const value of Object.values(data)) {
    if (Array.isArray(value) && value.length > 0) return String(value[0]);
    if (typeof value === "string") return value;
  }

  return fallback;
}

export const tokenStorage = {
  setTokens(access: string, refresh: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
