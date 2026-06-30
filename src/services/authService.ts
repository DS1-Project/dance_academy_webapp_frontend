import { api } from "@/lib/api";
import type {
  BackendRole,
  BackendUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  User,
  UserRole,
} from "@/types/auth";

const roleMap: Record<BackendRole, UserRole> = {
  admin: "admin",
  director: "director",
  teacher: "profesor",
  client: "cliente",
};

export function mapBackendUserToUser(backendUser: BackendUser): User {
  return {
    id: backendUser.id,
    email: backendUser.email,
    name:
      [backendUser.first_name, backendUser.last_name].filter(Boolean).join(" ").trim() ||
      backendUser.email,
    role: roleMap[backendUser.role] ?? "cliente",
    isApproved: backendUser.is_approved,
  };
}

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/auth/login/", payload);
  return data;
}

export async function registerRequest(payload: RegisterPayload): Promise<BackendUser> {
  const { data } = await api.post<BackendUser>("/api/auth/users/register/", payload);
  return data;
}

export async function getMeRequest(): Promise<BackendUser> {
  const { data } = await api.get<BackendUser>("/api/auth/users/me/");
  return data;
}
