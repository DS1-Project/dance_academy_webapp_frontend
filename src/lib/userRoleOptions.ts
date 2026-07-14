import type { BackendRole } from "@/types/auth";

/** Roles seleccionables en login/registro público */
export type SelectableLoginRole = BackendRole;

export const LOGIN_ROLE_OPTIONS: { value: SelectableLoginRole; label: string }[] = [
  { value: "client", label: "Cliente" },
  { value: "teacher", label: "Profesor" },
  { value: "admin", label: "Administrador" },
  { value: "director", label: "Director" },
];

export const REGISTER_ROLE_OPTIONS: { value: "client" | "teacher"; label: string }[] = [
  { value: "client", label: "Cliente" },
  { value: "teacher", label: "Profesor" },
];

export function roleRequiresApproval(role: BackendRole): boolean {
  return role !== "client";
}

export function matchesSelectedRole(
  selected: SelectableLoginRole,
  actual: BackendRole | undefined
): boolean {
  return Boolean(actual) && selected === actual;
}
