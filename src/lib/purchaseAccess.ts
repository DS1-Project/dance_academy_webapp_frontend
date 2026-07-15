import type { UserRole } from "@/types/auth";

const NON_PURCHASING_ROLES = new Set<UserRole>(["admin", "director", "profesor"]);

/** Admin, director y profesor pueden ver el catálogo pero no comprar. */
export function canPurchaseCourses(role?: UserRole | string | null): boolean {
  if (!role) return true;
  return !NON_PURCHASING_ROLES.has(role as UserRole);
}
