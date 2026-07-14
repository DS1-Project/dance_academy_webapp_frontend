import { api } from "@/lib/api";
import type { AdminUser, CreateUserPayload, UpdateUserPayload } from "@/types/admin";
import type { BackendRole } from "@/types/auth";

export async function getAllUsers(params?: { role?: BackendRole }): Promise<AdminUser[]> {
  const { data } = await api.get<AdminUser[]>("/api/auth/users/", { params });
  return data;
}

/**
 * Lista de profesores para el selector de "guest teachers". Solo admin/director
 * pueden listar usuarios; si un profesor la invoca, el backend responde 403 y
 * se propaga el error para que la UI lo trate como "sin selección disponible".
 */
export async function getTeacherOptions(): Promise<AdminUser[]> {
  return getAllUsers({ role: "teacher" });
}

export async function createUser(userData: CreateUserPayload): Promise<AdminUser> {
  const { data } = await api.post<AdminUser>("/api/auth/users/", userData);
  return data;
}

export async function updateUser(userId: string, userData: UpdateUserPayload): Promise<AdminUser> {
  const { data } = await api.patch<AdminUser>(`/api/auth/users/${userId}/`, userData);
  return data;
}

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/api/auth/users/${userId}/`);
}
