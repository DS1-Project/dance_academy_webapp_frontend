/** Roles tal como los devuelve el backend */
export type BackendRole = "admin" | "director" | "teacher" | "client";

/** Roles usados en el frontend */
export type UserRole = "admin" | "director" | "profesor" | "cliente";

export interface BackendUser {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: BackendRole;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  date_joined: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isApproved?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  captcha_token: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: BackendUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role?: "client" | "teacher";
}

export type ApiErrorResponse = {
  detail?: string;
  non_field_errors?: string[];
} & Record<string, string | string[] | undefined>;
