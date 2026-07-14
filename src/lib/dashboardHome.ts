import type { UserRole } from "@/types/auth";

/** Home panel path after login / from Navbar Dashboard. */
export function dashboardHomePath(role?: UserRole | string | null): string {
  if (role === "admin" || role === "director") return "/admin";
  return "/dashboard";
}
