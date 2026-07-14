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
import { updateUser } from "@/services/adminService";
import type { AdminUser, UpdateUserPayload } from "@/types/admin";
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

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "director", label: "Director" },
  { value: "profesor", label: "Profesor" },
  { value: "cliente", label: "Cliente" },
];

interface UserFormModalProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedUser: AdminUser) => void;
}

export function UserFormModal({ user, open, onOpenChange, onSuccess }: UserFormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("cliente");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName([user.first_name, user.last_name].filter(Boolean).join(" ").trim());
    setEmail(user.email);
    setRole(backendToFrontendRole[user.role] ?? "cliente");
    setPassword("");
    setShowPassword(false);
    setError("");
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError("");
    setIsSubmitting(true);

    try {
      const [firstName, ...rest] = name.trim().split(/\s+/);
      const lastName = rest.join(" ");

      const payload: UpdateUserPayload = {
        email: email.trim(),
        first_name: firstName,
        last_name: lastName,
      };

      const backendRole = frontendToBackendRole[role];
      if (backendRole !== "client") {
        payload.role = backendRole;
      }

      if (password.trim()) {
        if (password.length < 8) {
          setError("La contraseña debe tener al menos 8 caracteres");
          return;
        }
        payload.password = password;
      }

      const updatedUser = await updateUser(user.id, payload);
      toast({
        title: "Usuario actualizado",
        description: "Los cambios se guardaron correctamente.",
      });
      onSuccess(updatedUser);
      onOpenChange(false);
    } catch (err) {
      const message = getApiErrorMessage(err, "No se pudo actualizar el usuario");
      setError(message);
      toast({
        title: "Error al actualizar",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>
            Modifica los datos del usuario. El ID no se puede cambiar.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-caps text-xs text-muted-foreground mb-1.5 block">ID</label>
            <input
              type="text"
              value={user?.id ?? ""}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 text-sm text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div>
            <label className="label-caps text-xs text-muted-foreground mb-1.5 block">
              Nombre completo
            </label>
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
            <label className="label-caps text-xs text-muted-foreground mb-1.5 block">
              Correo electrónico
            </label>
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
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-caps text-xs text-muted-foreground mb-1.5 block">
              Nueva contraseña (opcional)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Dejar vacío para no cambiar"
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
