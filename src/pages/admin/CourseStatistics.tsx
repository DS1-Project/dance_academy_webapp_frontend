import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api";
import { getChoreographyDetail, listChoreographies } from "@/services/choreographyService";
import {
  buildChoreographyStatRows,
  rankByLeastSold,
  rankByMostSold,
  type ChoreographyStatRow,
} from "@/lib/choreographyMapper";
import type { BackendChoreography } from "@/types/backend";
import {
  ArrowLeft,
  BarChart3,
  Loader2,
  AlertCircle,
  Eye,
  ShoppingBag,
  Star,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const CourseStatistics = () => {
  const [rows, setRows] = useState<ChoreographyStatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await listChoreographies();
      const detailed = await Promise.allSettled(list.map((c) => getChoreographyDetail(c.id)));
      const merged: BackendChoreography[] = list.map((c, index) => {
        const result = detailed[index];
        return result.status === "fulfilled" ? result.value : c;
      });
      setRows(buildChoreographyStatRows(merged));
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudieron cargar las estadísticas"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalViews = rows.reduce((sum, r) => sum + r.totalViews, 0);
  const totalSales = rows.reduce((sum, r) => sum + r.totalSales, 0);
  const avgRating = rows.length
    ? (rows.reduce((sum, r) => sum + r.averageRating, 0) / rows.length).toFixed(1)
    : "0";
  const totalPlaybackMinutes = rows.reduce((sum, r) => sum + r.estimatedPlaybackMinutes, 0);

  const mostSold = rankByMostSold(rows, 5);
  const leastSold = rankByLeastSold(rows, 5);

  const kpis = [
    { label: "Coreografías", value: rows.length.toLocaleString("es-CO"), icon: BarChart3, tone: "text-primary bg-primary/10" },
    { label: "Vistas totales", value: totalViews.toLocaleString("es-CO"), icon: Eye, tone: "text-secondary bg-secondary/10" },
    { label: "Ventas totales", value: totalSales.toLocaleString("es-CO"), icon: ShoppingBag, tone: "text-accent bg-accent/10" },
    { label: "Calificación promedio", value: avgRating, icon: Star, tone: "text-primary bg-primary/10" },
  ];

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
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <BarChart3 className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="label-caps text-accent mb-1">Administración</p>
              <h1 className="text-2xl md:text-4xl">Estadísticas de Cursos</h1>
            </div>
          </div>

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

          {loading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Cargando estadísticas...
            </div>
          ) : (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {kpis.map((k) => (
                  <div key={k.label} className="bg-card rounded-2xl shadow-card p-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${k.tone}`}>
                      <k.icon className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-display font-extrabold tabular-nums">{k.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{k.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-card rounded-2xl shadow-card p-5 md:p-6 mb-6 flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Reproducción estimada acumulada:{" "}
                  <span className="font-semibold text-foreground">
                    {totalPlaybackMinutes.toLocaleString("es-CO")} minutos
                  </span>{" "}
                  (basado en vistas registradas y duración promedio de los videos).
                </p>
              </div>

              {/* Ranking tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-card rounded-2xl shadow-card p-5 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    <h3 className="font-bold">Más vendidas</h3>
                  </div>
                  <RankTable rows={mostSold} emptyText="Aún no hay ventas registradas." />
                </div>

                <div className="bg-card rounded-2xl shadow-card p-5 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingDown className="h-5 w-5 text-destructive" />
                    <h3 className="font-bold">Menos vendidas</h3>
                  </div>
                  <RankTable rows={leastSold} emptyText="Aún no hay coreografías registradas." />
                </div>
              </div>

              {/* Full detail table */}
              <div className="bg-card rounded-2xl shadow-card p-5 md:p-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3 className="font-bold">Detalle por coreografía</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-muted-foreground font-semibold">Coreografía</th>
                        <th className="text-left py-2 text-muted-foreground font-semibold">Profesor</th>
                        <th className="text-right py-2 text-muted-foreground font-semibold">Vistas</th>
                        <th className="text-right py-2 text-muted-foreground font-semibold">Ventas</th>
                        <th className="text-right py-2 text-muted-foreground font-semibold">Rating</th>
                        <th className="text-right py-2 text-muted-foreground font-semibold">Min. estimados</th>
                        <th className="text-right py-2 text-muted-foreground font-semibold">% Finalización</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-muted-foreground">
                            No hay coreografías registradas.
                          </td>
                        </tr>
                      ) : (
                        rows.map((r) => (
                          <tr key={r.id} className="border-b border-border/50 last:border-0">
                            <td className="py-3 font-semibold max-w-[200px] truncate">{r.title}</td>
                            <td className="py-3 text-muted-foreground">{r.mainTeacher}</td>
                            <td className="py-3 text-right tabular-nums">{r.totalViews.toLocaleString("es-CO")}</td>
                            <td className="py-3 text-right tabular-nums">{r.totalSales.toLocaleString("es-CO")}</td>
                            <td className="py-3 text-right tabular-nums">{r.averageRating.toFixed(1)}</td>
                            <td className="py-3 text-right tabular-nums">{r.estimatedPlaybackMinutes}</td>
                            <td className="py-3 text-right tabular-nums">{r.estimatedCompletionRate}%</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

function RankTable({ rows, emptyText }: { rows: ChoreographyStatRow[]; emptyText: string }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground py-6 text-center">{emptyText}</p>;
  }

  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-6 h-6 rounded-full bg-gradient-brand text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{r.title}</p>
              <p className="text-xs text-muted-foreground truncate">{r.mainTeacher}</p>
            </div>
          </div>
          <span className="text-sm font-display font-extrabold tabular-nums shrink-0">{r.totalSales}</span>
        </div>
      ))}
    </div>
  );
}

export default CourseStatistics;
