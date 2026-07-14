import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api";
import { firstError, required, validateEmail, validatePassword } from "@/lib/formValidation";
import { createUser, updateUser } from "@/services/adminService";
import type { AdminUser, CreateUserPayload, UpdateUserPayload } from "@/types/admin";
import type { BackendRole, UserRole } from "@/types/auth";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

const frontendToBackendRole: Record<UserRole, BackendRole> = {
  admin: "admin",
  director: "director",
  profesor: "teacher",
  cliente: "client",
};

const backendToFrontendRole: Record<BackendRole, UserRole> = {
  admin: "admin",
  director: "director",
  teacher: "profesor",
  client: "cliente",
};

const createRoleOptions: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "director", label: "Director" },
  { value: "profesor", label: "Profesor" },
];

const editRoleOptions: { value: UserRole; label: string }[] = [
  ...createRoleOptions,
  { value: "cliente", label: "Cliente" },
];

interface UserFormModalProps {
  user: AdminUser | null;
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (user: AdminUser) => void;
}

export function UserFormModal({ user, mode, open, onOpenChange, onSuccess }: UserFormModalProps) {
  const isCreate = mode === "create";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("profesor");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (isCreate || !user) {
      setName("");
      setEmail("");
      setRole("profesor");
      setPassword("");
    } else {
      setName([user.first_name, user.last_name].filter(Boolean).join(" ").trim());
      setEmail(user.email);
      setRole(backendToFrontendRole[user.role] ?? "cliente");
      setPassword("");
    }
    setShowPassword(false);
    setError("");
  }, [user, open, isCreate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const [firstName, ...rest] = name.trim().split(/\s+/);
    const lastName = rest.join(" ");

    const validationError = firstError(
      required(firstName, "El nombre"),
      required(lastName, "El apellido"),
      validateEmail(email),
      isCreate ? validatePassword(password) : password ? validatePassword(password) : null
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isCreate) {
        const backendRole = frontendToBackendRole[role];
        if (backendRole === "client") {
          setError("Solo se pueden crear usuarios internos.");
          return;
        }
        const payload: CreateUserPayload = {
          email: email.trim(),
          first_name: firstName,
          last_name: lastName,
          role: backendRole,
          password,
          is_approved: true,
          is_active: true,
        };
        const created = await createUser(payload);
        toast({ title: "Usuario creado", description: "El usuario interno quedó activo." });
        onSuccess(created);
      } else if (user) {
        const payload: UpdateUserPayload = {
          email: email.trim(),
          first_name: firstName,
          last_name: lastName,
        };
        const backendRole = frontendToBackendRole[role];
        if (backendRole !== "client") {
          payload.role = backendRole;
        }
        if (password.trim()) payload.password = password;
        const updatedUser = await updateUser(user.id, payload);
        toast({ title: "Usuario actualizado", description: "Los cambios se guardaron correctamente." });
        onSuccess(updatedUser);
      }
      onOpenChange(false);
    } catch (err) {
      const message = getApiErrorMessage(err, "No se pudo guardar el usuario");
      setError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Crear usuario interno" : "Editar usuario"}</DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Crea un administrador, director o profesor."
              : "Modifica los datos del usuario. El ID no se puede cambiar."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isCreate && (
            <div>
              <label className="label-caps text-xs text-muted-foreground mb-1.5 block">ID</label>
              <input
                type="text"
                value={user?.id ?? ""}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
          )}

          <div>
            <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Nombre completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre y apellido"
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
            />
          </div>

          <div>
            <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@email.com"
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
            />
          </div>

          <div>
            <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={isSubmitting || (!isCreate && user?.role === "client")}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
            >
              {(isCreate ? createRoleOptions : editRoleOptions).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-caps text-xs text-muted-foreground mb-1.5 block">
              {isCreate ? "Contraseña" : "Nueva contraseña (opcional)"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isCreate ? "Mínimo 8 caracteres" : "Dejar vacío para no cambiar"}
                required={isCreate}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-12 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isCreate ? "Crear usuario" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
