import { useEffect, useRef, useState } from "react";
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
  listChoreographyVideos,
  updateChoreography,
} from "@/services/choreographyService";
import { deleteVideo, updateVideo } from "@/services/videoService";
import { uploadMediaFile } from "@/services/mediaService";
import type { AdminUser } from "@/types/admin";
import type { BackendChoreography, BackendVideoClip, DanceStyle, DifficultyLevel } from "@/types/backend";
import {
  Upload,
  Image as ImageIcon,
  Plus,
  X,
  Loader2,
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

export interface ChoreographyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  /** Required when mode is "edit". */
  choreography?: BackendChoreography | null;
  danceStyles: DanceStyle[];
  teacherOptions?: AdminUser[];
  teacherOptionsUnavailable?: boolean;
  /** Excluded from the guest teacher picker (typically the logged-in teacher). */
  currentUserId?: string;
  onSaved: (choreography: BackendChoreography) => void;
}

export function ChoreographyFormDialog({
  open,
  onOpenChange,
  mode,
  choreography = null,
  danceStyles,
  teacherOptions = [],
  teacherOptionsUnavailable = false,
  currentUserId,
  onSaved,
}: ChoreographyFormDialogProps) {
  const [formValues, setFormValues] = useState<ChoreographyFormValues>(emptyFormValues());
  const [videoRows, setVideoRows] = useState<VideoFormRow[]>([]);
  const [originalVideos, setOriginalVideos] = useState<BackendVideoClip[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingVideoRowId, setUploadingVideoRowId] = useState<string | null>(null);

  const rowCounter = useRef(0);
  const nextRowId = () => `row-${(rowCounter.current += 1)}`;

  const visibleTeacherOptions = currentUserId
    ? teacherOptions.filter((t) => t.id !== currentUserId)
    : teacherOptions;

  useEffect(() => {
    if (!open) return;
    setFormError(null);

    if (mode === "create" || !choreography) {
      setFormValues(emptyFormValues());
      setVideoRows([createEmptyVideoRow(nextRowId())]);
      setOriginalVideos([]);
      return;
    }

    const style = choreography.dance_style;
    const danceStyleId = typeof style === "string" ? style : style?.id ?? "";
    const guestIds = (choreography.guest_teachers ?? []).map((g) => (typeof g === "string" ? g : g.id));

    setFormValues({
      title: choreography.title,
      description: choreography.description,
      difficultyLevel: choreography.difficulty_level,
      danceStyleId,
      actualPrice: choreography.stats?.actual_price ?? "",
      thumbnailUrl: choreography.thumbnail_url ?? "",
      guestTeacherIds: guestIds,
    });

    setLoadingVideos(true);
    listChoreographyVideos(choreography.id)
      .then((videos) => {
        const sorted = [...videos].sort((a, b) => a.sequence_order - b.sequence_order);
        setOriginalVideos(sorted);
        setVideoRows(sorted.map(videoClipToFormRow));
      })
      .catch((err) => {
        toast({
          title: "No se pudieron cargar los videos",
          description: getApiErrorMessage(err),
          variant: "destructive",
        });
        setOriginalVideos([]);
        setVideoRows([createEmptyVideoRow(nextRowId())]);
      })
      .finally(() => setLoadingVideos(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, choreography?.id]);

  function updateVideoRow(rowId: string, patch: Partial<VideoFormRow>) {
    setVideoRows((rows) => rows.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r)));
  }

  function addVideoRow() {
    setVideoRows((rows) => [...rows, createEmptyVideoRow(nextRowId())]);
  }

  function removeVideoRow(rowId: string) {
    setVideoRows((rows) => rows.filter((r) => r.rowId !== rowId));
  }

  function applySampleUrl(rowId: string, index: number) {
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
      let saved: BackendChoreography;

      if (mode === "create") {
        saved = await createChoreography(payload);
        const videoPayloads = buildVideoPayloads(videoRows);
        for (const videoPayload of videoPayloads) {
          await addChoreographyVideo(saved.id, videoPayload);
        }
        toast({ title: "Coreografía creada", description: `"${saved.title}" se publicó correctamente.` });
      } else {
        if (!choreography) throw new Error("Falta la coreografía a editar");
        saved = await updateChoreography(choreography.id, payload);
        const plan = planVideoDiff(originalVideos, videoRows);
        for (const videoId of plan.toDelete) {
          await deleteVideo(videoId);
        }
        for (const { videoId, payload: videoPatch } of plan.toUpdate) {
          await updateVideo(videoId, videoPatch);
        }
        const createPayloads = buildVideoPayloads(plan.toCreate);
        for (const videoPayload of createPayloads) {
          await addChoreographyVideo(choreography.id, videoPayload);
        }
        toast({ title: "Coreografía actualizada", description: "Los cambios se guardaron correctamente." });
      }

      onSaved(saved);
    } catch (err) {
      const message = getApiErrorMessage(err, "No se pudo guardar la coreografía");
      setFormError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent className="rounded-3xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nueva coreografía" : "Editar coreografía"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Dificultad *</label>
              <select
                value={formValues.difficultyLevel}
                onChange={(e) => setFormValues((f) => ({ ...f, difficultyLevel: e.target.value as DifficultyLevel }))}
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

          <div>
            <label className="label-caps text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Profesores invitados (opcional)
            </label>
            {teacherOptionsUnavailable ? (
              <p className="text-xs text-muted-foreground italic p-3 rounded-xl bg-muted/50">
                La lista de profesores no está disponible desde tu cuenta. Puedes continuar sin invitados.
              </p>
            ) : visibleTeacherOptions.length === 0 ? (
              <p className="text-xs text-muted-foreground italic p-3 rounded-xl bg-muted/50">
                No hay otros profesores registrados todavía.
              </p>
            ) : (
              <div className="max-h-32 overflow-y-auto rounded-xl border border-border p-2 space-y-1">
                {visibleTeacherOptions.map((t) => (
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
                        onClick={() => applySampleUrl(row.rowId, index)}
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || loadingVideos} className="gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Crear coreografía" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
