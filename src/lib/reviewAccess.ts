import type { UserRole } from "@/types/auth";

/** Solo un cliente que ya compró el curso puede dejar reseña/comentario. */
export function canLeaveReview(
  role?: UserRole | string | null,
  isPurchased = false
): boolean {
  return role === "cliente" && Boolean(isPurchased);
}

/** Admin, director y profesor no usan la sección de reseñas. */
export function canViewReviewsSection(role?: UserRole | string | null): boolean {
  if (role === "admin" || role === "director" || role === "profesor") return false;
  return true;
}
