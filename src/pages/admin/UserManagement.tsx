import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UserFormModal } from "@/components/admin/UserFormModal";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api";
import { deleteUser, getAllUsers, updateUser } from "@/services/adminService";
import type { AdminUser } from "@/types/admin";
import type { BackendRole } from "@/types/auth";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";

const roleLabels: Record<BackendRole, string> = {
  admin: "Administrador",
  director: "Director",
  teacher: "Profesor",
  client: "Cliente",
};

function getFullName(user: AdminUser): string {
  return [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || user.email;
}

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("edit");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudieron cargar los usuarios"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) => {
      const fullName = getFullName(user).toLowerCase();
      const email = user.email.toLowerCase();
      const identification = user.username.toLowerCase();
      return (
        fullName.includes(query) || email.includes(query) || identification.includes(query)
      );
    });
  }, [users, search]);

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setModalMode("edit");
    setEditModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setModalMode("create");
    setEditModalOpen(true);
  };

  const handleApprove = async (user: AdminUser) => {
    setApprovingId(user.id);
    try {
      const updated = await updateUser(user.id, { is_approved: true });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      toast({
        title: "Cliente aprobado",
        description: `${getFullName(user)} ya puede iniciar sesión.`,
      });
    } catch (err) {
      toast({
        title: "Error al aprobar",
        description: getApiErrorMessage(err, "No se pudo aprobar el usuario"),
        variant: "destructive",
      });
    } finally {
      setApprovingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      toast({
        title: "Usuario eliminado",
        description: `${getFullName(deleteTarget)} fue desactivado correctamente.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      toast({
        title: "Error al eliminar",
        description: getApiErrorMessage(err, "No se pudo eliminar el usuario"),
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateSuccess = (savedUser: AdminUser) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === savedUser.id);
      if (!exists) return [savedUser, ...prev];
      return prev.map((u) => (u.id === savedUser.id ? savedUser : u));
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 md:pt-28 pb-20">
        <div className="container">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al panel admin
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5 text-primary" />
              <p className="label-caps text-primary">Administración</p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl mb-2">Gestión de Usuarios</h1>
                <p className="text-muted-foreground">
                  Crea internos, aprueba clientes y administra la plataforma
                </p>
              </div>
              <Button className="gap-2 shrink-0" onClick={handleCreate}>
                <Plus className="h-4 w-4" />
                Crear usuario
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-card p-5 md:p-6">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, correo o identificación..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm mb-6">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{error}</span>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 ml-2 text-destructive"
                    onClick={fetchUsers}
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-muted-foreground font-semibold">
                      Identificación
                    </th>
                    <th className="text-left py-3 text-muted-foreground font-semibold">
                      Nombre completo
                    </th>
                    <th className="text-left py-3 text-muted-foreground font-semibold">
                      Correo
                    </th>
                    <th className="text-left py-3 text-muted-foreground font-semibold">Rol</th>
                    <th className="text-left py-3 text-muted-foreground font-semibold">Estado</th>
                    <th className="text-right py-3 text-muted-foreground font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Cargando usuarios...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        {search ? "No se encontraron usuarios con ese criterio." : "No hay usuarios registrados."}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 font-mono text-xs">{user.username || "—"}</td>
                        <td className="py-3 font-semibold">{getFullName(user)}</td>
                        <td className="py-3 text-muted-foreground">{user.email}</td>
                        <td className="py-3">
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-muted">
                            {roleLabels[user.role]}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                              user.is_approved
                                ? "bg-accent/15 text-accent"
                                : "bg-amber-500/15 text-amber-700"
                            }`}
                          >
                            {user.is_approved ? "Aprobado" : "Pendiente"}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center justify-end gap-2">
                            {!user.is_approved && user.role === "client" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                disabled={approvingId === user.id}
                                onClick={() => void handleApprove(user)}
                              >
                                {approvingId === user.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                                Aprobar
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => handleEdit(user)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(user)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <UserFormModal
        user={selectedUser}
        mode={modalMode}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={handleUpdateSuccess}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará la cuenta de{" "}
              <strong>{deleteTarget ? getFullName(deleteTarget) : ""}</strong>. El usuario no
              podrá acceder a la plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
