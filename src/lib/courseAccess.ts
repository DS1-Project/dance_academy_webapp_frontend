import type { User } from "@/types/auth";
import type { BackendChoreography } from "@/types/backend";

function teacherId(teacher: BackendChoreography["main_teacher"]): string | null {
  if (!teacher) return null;
  if (typeof teacher === "string") return teacher;
  return teacher.id ?? null;
}

/** Admin/director and the main teacher can manage (edit/view full content). */
export function canManageCourse(
  user: Pick<User, "id" | "role"> | null | undefined,
  course: Pick<BackendChoreography, "main_teacher"> | null | undefined
): boolean {
  if (!user || !course) return false;
  if (user.role === "admin" || user.role === "director") return true;
  if (user.role !== "profesor") return false;
  return teacherId(course.main_teacher) === user.id;
}
