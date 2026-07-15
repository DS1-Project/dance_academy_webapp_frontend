import type { User } from "@/types/auth";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  BookOpen,
  History,
  Loader2,
  AlertCircle,
  RefreshCw,
  PlayCircle,
} from "lucide-react";
import { usePurchasedChoreographies } from "@/hooks/usePurchasedChoreographies";
import { usePlaybackHistory } from "@/hooks/usePlaybackHistory";
import { useCatalogChoreographies } from "@/hooks/useCatalogChoreographies";
import { PurchasedChoreographyCard } from "@/components/dashboards/PurchasedChoreographyCard";

export function ClienteDashboard({ user }: { user: User }) {
  const { items } = useCart();
  const {
    choreographies: purchased,
    isLoading: purchasedLoading,
    error: purchasedError,
    reload: reloadPurchased,
  } = usePurchasedChoreographies();
  const { history, isLoading: historyLoading, error: historyError, reload: reloadHistory } = usePlaybackHistory();
  const { items: catalogItems, loading: catalogLoading } = useCatalogChoreographies();

  const purchasedIds = new Set(purchased.map((c) => c.id));
  const suggestions = catalogItems.filter((c) => !purchasedIds.has(c.id)).slice(0, 4);

  function handleVideoPlayed() {
    reloadHistory();
  }

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
          <p className="text-2xl font-display font-extrabold">{purchasedLoading ? "…" : purchased.length}</p>
          <p className="text-xs text-muted-foreground">Compradas</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-5">
          <ShoppingCart className="h-5 w-5 text-secondary mb-2" />
          <p className="text-2xl font-display font-extrabold">{items.length}</p>
          <p className="text-xs text-muted-foreground">En Carrito</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-5">
          <History className="h-5 w-5 text-accent mb-2" />
          <p className="text-2xl font-display font-extrabold">{historyLoading ? "…" : history.length}</p>
          <p className="text-xs text-muted-foreground">Reproducciones</p>
        </div>
      </div>

      {/* Purchased courses from backend */}
      <div className="bg-card rounded-2xl shadow-card p-5 md:p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">🎬 Mis Coreografías Compradas</h3>
          <Button variant="ghost" size="sm" onClick={reloadPurchased} disabled={purchasedLoading} className="gap-1">
            <RefreshCw className={`h-4 w-4 ${purchasedLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        {purchasedLoading && (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Cargando tus cursos...
          </div>
        )}

        {!purchasedLoading && purchasedError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{purchasedError}</span>
          </div>
        )}

        {!purchasedLoading && !purchasedError && purchased.length === 0 && (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">📚</p>
            <p className="font-semibold mb-1">Aún no tienes coreografías</p>
            <p className="text-sm text-muted-foreground mb-4">Explora el catálogo y compra tu primera clase.</p>
            <Button asChild size="sm">
              <Link to="/catalogo">Ir al catálogo</Link>
            </Button>
          </div>
        )}

        {!purchasedLoading && !purchasedError && purchased.length > 0 && (
          <div className="space-y-3">
            {purchased.map((c) => (
              <PurchasedChoreographyCard
                key={c.id}
                choreography={c}
                currentUserId={user.id}
                onPlayed={handleVideoPlayed}
              />
            ))}
          </div>
        )}
      </div>

      {/* Playback history */}
      <div className="bg-card rounded-2xl shadow-card p-5 md:p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <History className="h-4 w-4 text-accent" />
            Historial de reproducción
          </h3>
        </div>

        {historyLoading && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Cargando historial...
          </div>
        )}

        {!historyLoading && historyError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{historyError}</span>
          </div>
        )}

        {!historyLoading && !historyError && history.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Aún no has reproducido ningún video. Empieza desde tus coreografías compradas.
          </p>
        )}

        {!historyLoading && !historyError && history.length > 0 && (
          <div className="space-y-2">
            {history.slice(0, 8).map((h) => (
              <div key={h.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <PlayCircle className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{h.video_title ?? "Video"}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {h.choreography_title ?? "Coreografía"} · {new Date(h.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
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

        {catalogLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Cargando sugerencias...
          </div>
        ) : suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Ya tienes acceso a todo nuestro catálogo actual. ¡Vuelve pronto por más!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestions.map((c) => (
              <Link
                key={c.id}
                to="/catalogo"
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c.thumbnailColor} shrink-0`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{c.songName}</p>
                  <p className="text-xs text-muted-foreground">{c.genre} · ${c.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
