import type { User } from "@/types/auth";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Play,
  BookOpen,
  Star,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { useMyEnrollments } from "@/hooks/useMyEnrollments";
import { choreographies } from "@/lib/mock-data";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ClienteDashboard({ user }: { user: User }) {
  const { items } = useCart();
  const { enrollments, isLoading, error, reload } = useMyEnrollments();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const suggestions = choreographies.slice(0, 4);

  return (
    <div>
      <div className="mb-8">
        <p className="label-caps text-accent mb-1">Alumno</p>
        <h1 className="text-3xl md:text-5xl mb-2">Hola, {user.name.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Tu espacio de aprendizaje</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-2xl shadow-card p-5">
          <BookOpen className="h-5 w-5 text-primary mb-2" />
          <p className="text-2xl font-display font-extrabold">
            {isLoading ? "…" : enrollments.length}
          </p>
          <p className="text-xs text-muted-foreground">Compradas</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-5">
          <ShoppingCart className="h-5 w-5 text-secondary mb-2" />
          <p className="text-2xl font-display font-extrabold">{items.length}</p>
          <p className="text-xs text-muted-foreground">En Carrito</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-5">
          <Star className="h-5 w-5 text-accent mb-2" />
          <p className="text-2xl font-display font-extrabold">4.8</p>
          <p className="text-xs text-muted-foreground">Mi Valoración</p>
        </div>
      </div>

      {/* Purchased courses from backend */}
      <div className="bg-card rounded-2xl shadow-card p-5 md:p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">🎬 Mis Coreografías Compradas</h3>
          <Button variant="ghost" size="sm" onClick={reload} disabled={isLoading} className="gap-1">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Cargando tus cursos...
          </div>
        )}

        {!isLoading && error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!isLoading && !error && enrollments.length === 0 && (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">📚</p>
            <p className="font-semibold mb-1">Aún no tienes coreografías</p>
            <p className="text-sm text-muted-foreground mb-4">Explora el catálogo y compra tu primera clase.</p>
            <Button asChild size="sm">
              <Link to="/catalogo">Ir al catálogo</Link>
            </Button>
          </div>
        )}

        {!isLoading && !error && enrollments.length > 0 && (
          <div className="space-y-3">
            {enrollments.map((e) => {
              const isOpen = expandedId === e.id;
              const videos = e.detail?.videos ?? [];
              return (
                <div key={e.id} className="rounded-xl bg-muted/50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : e.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0">
                        <Play className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{e.choreography_title}</p>
                        <p className="text-xs text-muted-foreground">
                          Adquirida el {new Date(e.acquired_at).toLocaleDateString()}
                          {e.detail?.videos ? ` · ${e.detail.videos.length} videos` : ""}
                        </p>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-border/50 p-4 space-y-2">
                      {e.detailError && (
                        <div className="flex items-start gap-2 text-xs text-destructive">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>{e.detailError}</span>
                        </div>
                      )}
                      {!e.detail && !e.detailError && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                          Cargando videos...
                        </div>
                      )}
                      {e.detail?.description && (
                        <p className="text-xs text-muted-foreground mb-2">{e.detail.description}</p>
                      )}
                      {videos.length === 0 && e.detail && (
                        <p className="text-xs text-muted-foreground">
                          Esta coreografía aún no tiene videos publicados.
                        </p>
                      )}
                      {videos.length > 0 && (
                        <ul className="space-y-1.5">
                          {videos
                            .slice()
                            .sort((a, b) => a.sequence_order - b.sequence_order)
                            .map((v) => (
                              <li key={v.id}>
                                <a
                                  href={v.video_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-background hover:bg-primary/5 border border-border/50 transition-colors"
                                >
                                  <span className="flex items-center gap-2 min-w-0">
                                    <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                                      {v.sequence_order}
                                    </span>
                                    <span className="text-sm font-medium truncate">{v.title}</span>
                                  </span>
                                  <span className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                                    {formatDuration(v.duration_seconds)}
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </span>
                                </a>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="bg-card rounded-2xl shadow-card p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">✨ Sugerencias para ti</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/catalogo">Ver catálogo</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c.thumbnailColor} shrink-0`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{c.songName}</p>
                <p className="text-xs text-muted-foreground">{c.genre} · ${c.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
