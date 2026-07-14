import type { BackendRole } from "@/types/auth";

export interface AdminUser {
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

export interface CreateUserPayload {
  email: string;
  username?: string;
  first_name: string;
  last_name: string;
  role: BackendRole;
  password: string;
  is_approved?: boolean;
  is_active?: boolean;
}

export interface UpdateUserPayload {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role?: BackendRole;
  password?: string;
  is_approved?: boolean;
  is_active?: boolean;
}
