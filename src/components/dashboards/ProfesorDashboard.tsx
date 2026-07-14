import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  buildChoreographyPayload,
  buildVideoPayloads,
  createEmptyVideoRow,
  planVideoDiff,
  validateChoreographyDetails,
  validateVideoRows,
  videoClipToFormRow,
  type ChoreographyFormValues,
  type VideoFormRow,
} from "@/lib/choreographyForm";
import { pickNextSampleVideoUrl } from "@/lib/sampleVideoUrls";
import {
  addChoreographyVideo,
  createChoreography,
  deleteChoreography,
  getMyChoreographies,
  listChoreographyVideos,
  listDanceStyles,
  updateChoreography,
} from "@/services/choreographyService";
import { deleteVideo, updateVideo } from "@/services/videoService";
import { uploadMediaFile } from "@/services/mediaService";
import { getTeacherOptions } from "@/services/adminService";
import type { AdminUser } from "@/types/admin";
import type { BackendChoreography, BackendVideoClip, DanceStyle, DifficultyLevel } from "@/types/backend";
import {
  Music,
  Star,
  DollarSign,
  MessageSquare,
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus,
  X,
  Video as VideoIcon,
  Loader2,
  Pencil,
  AlertCircle,
  Sparkles,
  Users,
} from "lucide-react";

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: "beginner", label: "Principiante" },
  { value: "intermediate", label: "Intermedio" },
  { value: "advanced", label: "Avanzado" },
];

function teacherFullName(t: AdminUser): string {
  const full = `${t.first_name} ${t.last_name}`.trim();
  return full || t.email;
}

function danceStyleName(style: BackendChoreography["dance_style"]): string {
  if (!style) return "Sin estilo";
  if (typeof style === "string") return style;
  return style.name;
}

function emptyFormValues(): ChoreographyFormValues {
  return {
    title: "",
    description: "",
    difficultyLevel: "beginner",
    danceStyleId: "",
    actualPrice: "",
    thumbnailUrl: "",
    guestTeacherIds: [],
  };
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [originalVideos, setOriginalVideos] = useState<BackendVideoClip[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  const [formValues, setFormValues] = useState<ChoreographyFormValues>(emptyFormValues());
  const [videoRows, setVideoRows] = useState<VideoFormRow[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingVideoRowId, setUploadingVideoRowId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<BackendChoreography | null>(null);
  const [deleting, setDeleting] = useState(false);

  const rowCounter = useRef(0);
  const nextRowId = () => `row-${(rowCounter.current += 1)}`;

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
      .then((teachers) => setTeacherOptions(teachers.filter((t) => t.id !== user.id)))
      .catch(() => setTeacherOptionsUnavailable(true));
  }, [user.id]);

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

  function resetForm() {
    setFormValues(emptyFormValues());
    setVideoRows([createEmptyVideoRow(nextRowId())]);
    setFormError(null);
    setOriginalVideos([]);
  }

  function openCreateDialog() {
    setDialogMode("create");
    setEditingId(null);
    resetForm();
    setDialogOpen(true);
  }

  async function openEditDialog(choreo: BackendChoreography) {
    setDialogMode("edit");
    setEditingId(choreo.id);
    setFormError(null);

    const style = choreo.dance_style;
    const danceStyleId = typeof style === "string" ? style : style?.id ?? "";
    const guestIds = (choreo.guest_teachers ?? []).map((g) => (typeof g === "string" ? g : g.id));

    setFormValues({
      title: choreo.title,
      description: choreo.description,
      difficultyLevel: choreo.difficulty_level,
      danceStyleId,
      actualPrice: choreo.stats?.actual_price ?? "",
      thumbnailUrl: choreo.thumbnail_url ?? "",
      guestTeacherIds: guestIds,
    });

    setDialogOpen(true);
    setLoadingVideos(true);
    try {
      const videos = await listChoreographyVideos(choreo.id);
      const sorted = [...videos].sort((a, b) => a.sequence_order - b.sequence_order);
      setOriginalVideos(sorted);
      setVideoRows(sorted.map(videoClipToFormRow));
    } catch (err) {
      toast({
        title: "No se pudieron cargar los videos",
        description: getApiErrorMessage(err),
        variant: "destructive",
      });
      setOriginalVideos([]);
      setVideoRows([createEmptyVideoRow(nextRowId())]);
    } finally {
      setLoadingVideos(false);
    }
  }

  function updateVideoRow(rowId: string, patch: Partial<VideoFormRow>) {
    setVideoRows((rows) => rows.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r)));
  }

  function addVideoRow() {
    setVideoRows((rows) => [...rows, createEmptyVideoRow(nextRowId())]);
  }

  function removeVideoRow(rowId: string) {
    setVideoRows((rows) => rows.filter((r) => r.rowId !== rowId));
  }

  function useSampleUrl(rowId: string, index: number) {
    const sample = pickNextSampleVideoUrl(index);
    updateVideoRow(rowId, { videoUrl: sample.url });
    toast({ title: "URL de ejemplo aplicada", description: sample.label });
  }

  async function handleThumbnailFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Archivo inválido", description: "Debe ser una imagen.", variant: "destructive" });
      return;
    }
    setUploadingThumbnail(true);
    try {
      const url = await uploadMediaFile(file);
      setFormValues((f) => ({ ...f, thumbnailUrl: url }));
      toast({ title: "Portada subida" });
    } catch (err) {
      toast({ title: "Error al subir la portada", description: getApiErrorMessage(err), variant: "destructive" });
    } finally {
      setUploadingThumbnail(false);
    }
  }

  async function handleVideoFile(rowId: string, file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast({ title: "Archivo inválido", description: "Debe ser un archivo de video.", variant: "destructive" });
      return;
    }
    setUploadingVideoRowId(rowId);
    try {
      const url = await uploadMediaFile(file);
      updateVideoRow(rowId, { videoUrl: url });
      toast({ title: "Video subido" });
    } catch (err) {
      toast({ title: "Error al subir el video", description: getApiErrorMessage(err), variant: "destructive" });
    } finally {
      setUploadingVideoRowId(null);
    }
  }

  function toggleGuestTeacher(teacherId: string) {
    setFormValues((f) => ({
      ...f,
      guestTeacherIds: f.guestTeacherIds.includes(teacherId)
        ? f.guestTeacherIds.filter((id) => id !== teacherId)
        : [...f.guestTeacherIds, teacherId],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const detailsError = validateChoreographyDetails(formValues);
    if (detailsError) {
      setFormError(detailsError);
      return;
    }
    const videosError = validateVideoRows(videoRows);
    if (videosError) {
      setFormError(videosError);
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildChoreographyPayload(formValues);

      if (dialogMode === "create") {
        const created = await createChoreography(payload);
        const videoPayloads = buildVideoPayloads(videoRows);
        for (const videoPayload of videoPayloads) {
          await addChoreographyVideo(created.id, videoPayload);
        }
        toast({ title: "Coreografía creada", description: `"${created.title}" se publicó correctamente.` });
      } else if (editingId) {
        await updateChoreography(editingId, payload);
        const plan = planVideoDiff(originalVideos, videoRows);
        for (const videoId of plan.toDelete) {
          await deleteVideo(videoId);
        }
        for (const { videoId, payload: videoPatch } of plan.toUpdate) {
          await updateVideo(videoId, videoPatch);
        }
        const createPayloads = buildVideoPayloads(plan.toCreate);
        for (const videoPayload of createPayloads) {
          await addChoreographyVideo(editingId, videoPayload);
        }
        toast({ title: "Coreografía actualizada", description: "Los cambios se guardaron correctamente." });
      }

      setDialogOpen(false);
      await loadChoreographies();
    } catch (err) {
      const message = getApiErrorMessage(err, "No se pudo guardar la coreografía");
      setFormError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
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
              <div
                key={c.id}
                className="group relative rounded-2xl overflow-hidden bg-muted/30 hover:shadow-card-hover transition-all"
              >
                <div className="relative aspect-video bg-gradient-to-br from-primary to-secondary">
                  {c.thumbnail_url ? (
                    <img src={c.thumbnail_url} alt={c.title} className="absolute inset-0 w-full h-full object-cover" />
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
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditDialog(c)}
                      className="w-9 h-9 rounded-full bg-foreground/70 backdrop-blur-sm text-background flex items-center justify-center hover:bg-primary transition-colors"
                      aria-label="Editar coreografía"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="w-9 h-9 rounded-full bg-foreground/70 backdrop-blur-sm text-background flex items-center justify-center hover:bg-destructive transition-colors"
                      aria-label="Eliminar coreografía"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm truncate">{c.title}</p>
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !submitting && setDialogOpen(open)}>
        <DialogContent className="rounded-3xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "Nueva coreografía" : "Editar coreografía"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Completa los datos y agrega al menos un video."
                : "Actualiza los datos y gestiona los videos de esta coreografía."}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Título *</label>
              <input
                type="text"
                value={formValues.title}
                onChange={(e) => setFormValues((f) => ({ ...f, title: e.target.value }))}
                maxLength={120}
                placeholder="Ej: Bachata Sensual Avanzada"
                disabled={submitting}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
              />
            </div>

            {/* Description */}
            <div>
              <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Descripción *</label>
              <Textarea
                value={formValues.description}
                onChange={(e) => setFormValues((f) => ({ ...f, description: e.target.value }))}
                maxLength={500}
                rows={3}
                placeholder="Describe la coreografía, lo que aprenderán y para quién es..."
                disabled={submitting}
              />
            </div>

            {/* Difficulty + dance style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Dificultad *</label>
                <select
                  value={formValues.difficultyLevel}
                  onChange={(e) =>
                    setFormValues((f) => ({ ...f, difficultyLevel: e.target.value as DifficultyLevel }))
                  }
                  disabled={submitting}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                >
                  {DIFFICULTY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Estilo de baile *</label>
                <select
                  value={formValues.danceStyleId}
                  onChange={(e) => setFormValues((f) => ({ ...f, danceStyleId: e.target.value }))}
                  disabled={submitting}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                >
                  <option value="">Selecciona un estilo</option>
                  {danceStyles.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Precio (USD) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formValues.actualPrice}
                  onChange={(e) => setFormValues((f) => ({ ...f, actualPrice: e.target.value }))}
                  placeholder="29.99"
                  disabled={submitting}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                />
              </div>
            </div>

            {/* Thumbnail */}
            <div>
              <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Portada (opcional)</label>
              <div className="flex items-center gap-3">
                {formValues.thumbnailUrl ? (
                  <img
                    src={formValues.thumbnailUrl}
                    alt="Portada"
                    className="w-20 h-14 object-cover rounded-lg border border-border shrink-0"
                  />
                ) : (
                  <div className="w-20 h-14 rounded-lg border border-dashed border-border flex items-center justify-center shrink-0">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={formValues.thumbnailUrl}
                    onChange={(e) => setFormValues((f) => ({ ...f, thumbnailUrl: e.target.value }))}
                    placeholder="URL de la imagen o sube un archivo"
                    disabled={submitting || uploadingThumbnail}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  />
                  <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary cursor-pointer hover:underline">
                    {uploadingThumbnail ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    Subir imagen
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={submitting || uploadingThumbnail}
                      onChange={(e) => handleThumbnailFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Guest teachers */}
            <div>
              <label className="label-caps text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Profesores invitados (opcional)
              </label>
              {teacherOptionsUnavailable ? (
                <p className="text-xs text-muted-foreground italic p-3 rounded-xl bg-muted/50">
                  La lista de profesores no está disponible desde tu cuenta. Puedes continuar sin invitados.
                </p>
              ) : teacherOptions.length === 0 ? (
                <p className="text-xs text-muted-foreground italic p-3 rounded-xl bg-muted/50">
                  No hay otros profesores registrados todavía.
                </p>
              ) : (
                <div className="max-h-32 overflow-y-auto rounded-xl border border-border p-2 space-y-1">
                  {teacherOptions.map((t) => (
                    <label
                      key={t.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={formValues.guestTeacherIds.includes(t.id)}
                        onChange={() => toggleGuestTeacher(t.id)}
                        disabled={submitting}
                        className="accent-primary"
                      />
                      {teacherFullName(t)}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Videos manager */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label-caps text-xs text-muted-foreground block">Videos * (mínimo 1)</label>
                <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={addVideoRow} disabled={submitting}>
                  <Plus className="h-3.5 w-3.5" />
                  Agregar video
                </Button>
              </div>

              {loadingVideos ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cargando videos...
                </div>
              ) : (
                <div className="space-y-3">
                  {videoRows.map((row, index) => (
                    <div key={row.rowId} className="rounded-2xl border border-border p-3 space-y-2 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Video #{index + 1}</span>
                        {videoRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVideoRow(row.rowId)}
                            disabled={submitting}
                            className="text-destructive hover:opacity-80"
                            aria-label="Quitar video"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={row.title}
                        onChange={(e) => updateVideoRow(row.rowId, { title: e.target.value })}
                        placeholder="Título del video"
                        disabled={submitting}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-2">
                        <input
                          type="text"
                          value={row.videoUrl}
                          onChange={(e) => updateVideoRow(row.rowId, { videoUrl: e.target.value })}
                          placeholder="URL del video (https://...)"
                          disabled={submitting}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                        />
                        <input
                          type="number"
                          min="0"
                          value={row.durationSeconds}
                          onChange={(e) => updateVideoRow(row.rowId, { durationSeconds: e.target.value })}
                          placeholder="Duración (seg)"
                          disabled={submitting}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                        />
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary cursor-pointer hover:underline">
                          {uploadingVideoRowId === row.rowId ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Upload className="h-3.5 w-3.5" />
                          )}
                          Subir archivo
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            disabled={submitting || uploadingVideoRowId === row.rowId}
                            onChange={(e) => handleVideoFile(row.rowId, e.target.files?.[0] ?? null)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => useSampleUrl(row.rowId, index)}
                          disabled={submitting}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Usar ejemplo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting || loadingVideos} className="gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {dialogMode === "create" ? "Crear coreografía" : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
