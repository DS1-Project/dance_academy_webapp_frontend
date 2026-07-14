import type { BackendRole } from "@/types/auth";

/** Roles disponibles en el registro público. */
export type RegisterRole = Extract<BackendRole, "client" | "teacher">;

export const REGISTER_ROLE_OPTIONS: { value: RegisterRole; label: string }[] = [
  { value: "client", label: "Cliente" },
  { value: "teacher", label: "Profesor" },
];

export function roleRequiresApproval(role: BackendRole): boolean {
  return role !== "client";
}
