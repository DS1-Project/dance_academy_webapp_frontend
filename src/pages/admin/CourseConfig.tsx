import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
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
import { ChoreographyFormDialog } from "@/components/choreography/ChoreographyFormDialog";
import { toast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api";
import { firstError, validatePositiveNumber } from "@/lib/formValidation";
import {
  approveChoreography,
  deleteChoreography,
  listChoreographies,
  listDanceStyles,
  updateChoreographyPrice,
} from "@/services/choreographyService";
import { getTeacherOptions } from "@/services/adminService";
import type { AdminUser } from "@/types/admin";
import type { BackendChoreography, DanceStyle } from "@/types/backend";
import {
  ArrowLeft,
  Music,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Pencil,
  Trash2,
  DollarSign,
  X,
  Check,
} from "lucide-react";

function teacherName(teacher: BackendChoreography["main_teacher"]): string {
  if (!teacher) return "Sin profesor";
  if (typeof teacher === "string") return teacher;
  const full = `${teacher.first_name} ${teacher.last_name}`.trim();
  return full || teacher.email;
}

function danceStyleName(style: BackendChoreography["dance_style"]): string {
  if (!style) return "Sin estilo";
  if (typeof style === "string") return style;
  return style.name;
}

const CourseConfig = () => {
  const [choreographies, setChoreographies] = useState<BackendChoreography[]>([]);
  const [danceStyles, setDanceStyles] = useState<DanceStyle[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<AdminUser[]>([]);
  const [teacherOptionsUnavailable, setTeacherOptionsUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BackendChoreography | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [editingChoreo, setEditingChoreo] = useState<BackendChoreography | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [priceTargetId, setPriceTargetId] = useState<string | null>(null);
  const [priceValue, setPriceValue] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listChoreographies();
      setChoreographies(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudieron cargar las coreografías"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    listDanceStyles()
      .then(setDanceStyles)
      .catch(() => setDanceStyles([]));
    getTeacherOptions()
      .then(setTeacherOptions)
      .catch(() => setTeacherOptionsUnavailable(true));
  }, []);

  async function handleApprove(choreo: BackendChoreography) {
    setApprovingId(choreo.id);
    try {
      const updated = await approveChoreography(choreo.id);
      setChoreographies((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast({ title: "Coreografía aprobada", description: `"${choreo.title}" ya es visible en el catálogo.` });
    } catch (err) {
      toast({ title: "Error al aprobar", description: getApiErrorMessage(err), variant: "destructive" });
    } finally {
      setApprovingId(null);
    }
  }

  function openPriceEditor(choreo: BackendChoreography) {
    setPriceTargetId(choreo.id);
    setPriceValue(choreo.stats?.actual_price ?? "");
  }

  async function savePrice(choreo: BackendChoreography) {
    const validationError = firstError(validatePositiveNumber(Number(priceValue), "El precio"));
    if (validationError) {
      toast({ title: "Precio inválido", description: validationError, variant: "destructive" });
      return;
    }
    setSavingPrice(true);
    try {
      const updated = await updateChoreographyPrice(choreo.id, Number(priceValue));
      setChoreographies((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast({ title: "Precio actualizado" });
      setPriceTargetId(null);
    } catch (err) {
      toast({ title: "Error al actualizar el precio", description: getApiErrorMessage(err), variant: "destructive" });
    } finally {
      setSavingPrice(false);
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

  function handleSaved() {
    setDialogOpen(false);
    load();
  }

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

          <div className="mb-8 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
              <Music className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="label-caps text-secondary mb-1">Administración</p>
              <h1 className="text-2xl md:text-4xl">Configurar Cursos</h1>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-card p-5 md:p-6">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm mb-6">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{error}</span>
                  <Button variant="link" size="sm" className="h-auto p-0 ml-2 text-destructive" onClick={load}>
                    Reintentar
                  </Button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-muted-foreground font-semibold">Coreografía</th>
                    <th className="text-left py-3 text-muted-foreground font-semibold">Profesor</th>
                    <th className="text-left py-3 text-muted-foreground font-semibold">Estilo</th>
                    <th className="text-right py-3 text-muted-foreground font-semibold">Precio</th>
                    <th className="text-right py-3 text-muted-foreground font-semibold">Ventas</th>
                    <th className="text-left py-3 text-muted-foreground font-semibold">Estado</th>
                    <th className="text-right py-3 text-muted-foreground font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Cargando coreografías...
                      </td>
                    </tr>
                  ) : choreographies.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        No hay coreografías registradas.
                      </td>
                    </tr>
                  ) : (
                    choreographies.map((c) => (
                      <tr key={c.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 font-semibold max-w-[220px] truncate">{c.title}</td>
                        <td className="py-3 text-muted-foreground">{teacherName(c.main_teacher)}</td>
                        <td className="py-3 text-muted-foreground">{danceStyleName(c.dance_style)}</td>
                        <td className="py-3 text-right tabular-nums">
                          {priceTargetId === c.id ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={priceValue}
                                onChange={(e) => setPriceValue(e.target.value)}
                                disabled={savingPrice}
                                autoFocus
                                className="w-20 px-2 py-1 rounded-lg border border-border bg-background text-xs text-right focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                              <button
                                onClick={() => savePrice(c)}
                                disabled={savingPrice}
                                className="text-accent hover:opacity-80"
                                aria-label="Guardar precio"
                              >
                                {savingPrice ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => setPriceTargetId(null)}
                                disabled={savingPrice}
                                className="text-muted-foreground hover:text-destructive"
                                aria-label="Cancelar"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => openPriceEditor(c)}
                              className="inline-flex items-center gap-1 font-semibold hover:text-primary"
                            >
                              <DollarSign className="h-3.5 w-3.5" />
                              {c.stats?.actual_price ? Number(c.stats.actual_price).toFixed(2) : "0.00"}
                            </button>
                          )}
                        </td>
                        <td className="py-3 text-right tabular-nums">{c.stats?.total_sales_count ?? 0}</td>
                        <td className="py-3">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                              c.is_approved ? "bg-accent/15 text-accent" : "bg-amber-500/15 text-amber-700"
                            }`}
                          >
                            {c.is_approved ? "Aprobada" : "Pendiente"}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center justify-end gap-2">
                            {!c.is_approved && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                disabled={approvingId === c.id}
                                onClick={() => handleApprove(c)}
                              >
                                {approvingId === c.id ? (
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
                              onClick={() => {
                                setEditingChoreo(c);
                                setDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(c)}
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

      <ChoreographyFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode="edit"
        choreography={editingChoreo}
        danceStyles={danceStyles}
        teacherOptions={teacherOptions}
        teacherOptionsUnavailable={teacherOptionsUnavailable}
        onSaved={handleSaved}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar coreografía?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente{" "}
              <strong>{deleteTarget?.title}</strong> y sus videos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
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
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CourseConfig;
