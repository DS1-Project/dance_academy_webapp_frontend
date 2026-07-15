import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { User } from "@/types/auth";
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
import { ChoreographyFormDialog } from "@/components/choreography/ChoreographyFormDialog";
import {
  deleteChoreography,
  getMyChoreographies,
  listDanceStyles,
} from "@/services/choreographyService";
import { getTeacherOptions } from "@/services/adminService";
import type { AdminUser } from "@/types/admin";
import type { BackendChoreography, DanceStyle } from "@/types/backend";
import {
  Music,
  Star,
  DollarSign,
  MessageSquare,
  Trash2,
  Plus,
  Video as VideoIcon,
  Loader2,
  Pencil,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

function danceStyleName(style: BackendChoreography["dance_style"]): string {
  if (!style) return "Sin estilo";
  if (typeof style === "string") return style;
  return style.name;
}

export function ProfesorDashboard({ user }: { user: User }) {
  const [choreographies, setChoreographies] = useState<BackendChoreography[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [danceStyles, setDanceStyles] = useState<DanceStyle[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<AdminUser[]>([]);
  const [teacherOptionsUnavailable, setTeacherOptionsUnavailable] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingChoreo, setEditingChoreo] = useState<BackendChoreography | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<BackendChoreography | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadChoreographies = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getMyChoreographies();
      setChoreographies(data);
    } catch (err) {
      setLoadError(getApiErrorMessage(err, "No se pudieron cargar tus coreografías"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChoreographies();
  }, [loadChoreographies]);

  useEffect(() => {
    listDanceStyles()
      .then(setDanceStyles)
      .catch(() => setDanceStyles([]));

    getTeacherOptions()
      .then(setTeacherOptions)
      .catch(() => setTeacherOptionsUnavailable(true));
  }, []);

  const totalSales = choreographies.reduce((sum, c) => sum + (c.stats?.total_sales_count ?? 0), 0);
  const totalRevenue = choreographies.reduce((sum, c) => {
    const price = c.stats?.actual_price ? Number(c.stats.actual_price) : 0;
    return sum + (c.stats?.total_sales_count ?? 0) * price;
  }, 0);
  const avgRating = choreographies.length
    ? (
        choreographies.reduce((sum, c) => sum + (c.stats?.average_rating ? Number(c.stats.average_rating) : 0), 0) /
        choreographies.length
      ).toFixed(1)
    : "0";

  function openCreateDialog() {
    setDialogMode("create");
    setEditingChoreo(null);
    setDialogOpen(true);
  }

  function openEditDialog(choreo: BackendChoreography) {
    setDialogMode("edit");
    setEditingChoreo(choreo);
    setDialogOpen(true);
  }

  function handleSaved() {
    setDialogOpen(false);
    loadChoreographies();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteChoreography(deleteTarget.id);
      setChoreographies((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast({ title: "Coreografía eliminada", description: `"${deleteTarget.title}" fue eliminada.` });
      setDeleteTarget(null);
    } catch (err) {
      toast({ title: "Error al eliminar", description: getApiErrorMessage(err), variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="label-caps text-secondary mb-1">Profesor Bailarín</p>
        <h1 className="text-3xl md:text-5xl mb-2">Hola, {user.name.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Tu panel de coreografías</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-card rounded-2xl shadow-card p-5">
          <Music className="h-5 w-5 text-secondary mb-2" />
          <p className="text-2xl font-display font-extrabold">{choreographies.length}</p>
          <p className="text-xs text-muted-foreground">Coreografías</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-5">
          <DollarSign className="h-5 w-5 text-primary mb-2" />
          <p className="text-2xl font-display font-extrabold">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Ingresos Totales</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-5">
          <Star className="h-5 w-5 text-primary mb-2" />
          <p className="text-2xl font-display font-extrabold">{avgRating}</p>
          <p className="text-xs text-muted-foreground">Valoración Promedio</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-5">
          <MessageSquare className="h-5 w-5 text-accent mb-2" />
          <p className="text-2xl font-display font-extrabold">{totalSales}</p>
          <p className="text-xs text-muted-foreground">Ventas Totales</p>
        </div>
      </div>

      {/* Content management header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="label-caps text-primary mb-2">Gestión de Contenido</p>
          <h2 className="text-2xl md:text-4xl">Tus coreografías</h2>
        </div>
        <Button onClick={openCreateDialog} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Nueva coreografía
        </Button>
      </div>

      {loadError && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm mb-6">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Choreographies list */}
      <div className="bg-card rounded-3xl shadow-card p-5 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <VideoIcon className="h-5 w-5 text-secondary" />
            <h3 className="font-bold">Mis Coreografías</h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {choreographies.length} {choreographies.length === 1 ? "coreografía" : "coreografías"}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Cargando tus coreografías...
          </div>
        ) : choreographies.length === 0 ? (
          <div className="text-center py-12">
            <VideoIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold mb-1">Aún no tienes coreografías</p>
            <p className="text-sm text-muted-foreground">Crea tu primera coreografía con el botón de arriba.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {choreographies.map((c) => (
              <article
                key={c.id}
                className="group relative rounded-2xl overflow-hidden bg-muted/30 hover:shadow-card-hover transition-all"
              >
                <Link
                  to={`/curso/${c.id}`}
                  state={{ fromDashboard: true }}
                  className="block"
                  aria-label={`Ver detalle de ${c.title}`}
                >
                  <div className="relative aspect-video bg-gradient-to-br from-primary to-secondary">
                    {c.thumbnail_url ? (
                      <img src={c.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display font-extrabold text-primary-foreground text-lg text-center px-3 drop-shadow-lg leading-tight">
                          {c.title}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          c.is_approved ? "bg-accent text-accent-foreground" : "bg-amber-500 text-white"
                        }`}
                      >
                        {c.is_approved ? "Aprobada" : "Pendiente"}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/15 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 text-xs font-semibold">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Ver detalle
                      </span>
                    </div>
                  </div>
                  <div className="p-3 pb-2">
                    <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{c.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{danceStyleName(c.dance_style)}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        {c.stats?.total_sales_count ?? 0} {(c.stats?.total_sales_count ?? 0) === 1 ? "venta" : "ventas"}
                        {" · "}
                        {c.video_count ?? 0} {(c.video_count ?? 0) === 1 ? "video" : "videos"}
                      </p>
                      <p className="text-sm font-display font-extrabold">
                        ${c.stats?.actual_price ? Number(c.stats.actual_price).toFixed(2) : "0.00"}
                      </p>
                    </div>
                  </div>
                </Link>
                <div className="flex gap-2 px-3 pb-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1.5"
                    onClick={() => openEditDialog(c)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(c)}
                    aria-label="Eliminar coreografía"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <ChoreographyFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        choreography={editingChoreo}
        danceStyles={danceStyles}
        teacherOptions={teacherOptions}
        teacherOptionsUnavailable={teacherOptionsUnavailable}
        currentUserId={user.id}
        onSaved={handleSaved}
      />

      {/* Delete confirmation modal */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta coreografía?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar{" "}
              <span className="font-semibold text-foreground">"{deleteTarget?.title}"</span>? Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
