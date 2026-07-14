import type { BackendRole } from "@/types/auth";

export const REGISTER_ROLE_OPTIONS: { value: BackendRole; label: string }[] = [
  { value: "client", label: "Cliente" },
  { value: "teacher", label: "Profesor" },
  { value: "admin", label: "Administrador" },
  { value: "director", label: "Director" },
];

export function roleRequiresApproval(role: BackendRole): boolean {
  return role !== "client";
}
