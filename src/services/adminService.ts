import { api } from "@/lib/api";
import type { AdminUser, CreateUserPayload, UpdateUserPayload } from "@/types/admin";

export async function getAllUsers(): Promise<AdminUser[]> {
  const { data } = await api.get<AdminUser[]>("/api/auth/users/");
  return data;
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
