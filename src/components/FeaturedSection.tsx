import { useMemo } from "react";
import { ChoreographyCard } from "@/components/ChoreographyCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCatalogChoreographies } from "@/hooks/useCatalogChoreographies";

export function FeaturedSection() {
  const ref = useScrollReveal();
  const { items, loading, error, reload } = useCatalogChoreographies();

  const topSellers = useMemo(
    () => [...items].sort((a, b) => b.salesCount - a.salesCount).slice(0, 4),
    [items]
  );

  const newReleases = useMemo(
    () =>
      [...items]
        .sort((a, b) => {
          const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
          const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
          return bTime - aTime;
        })
        .slice(0, 4),
    [items]
  );

  if (loading) {
    return (
      <section ref={ref} className="py-20 md:py-32">
        <div className="container flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando destacados...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section ref={ref} className="py-20 md:py-32">
        <div className="container text-center py-12">
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={reload}>
            Reintentar
          </Button>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section ref={ref} className="py-20 md:py-32">
      <div className="container">
        {/* Most Popular */}
        <div className="mb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="label-caps text-primary mb-2">🔥 Tendencia</p>
              <h2>Los Más Vendidos</h2>
            </div>
            <Button variant="ghost" className="gap-1 hidden sm:inline-flex" asChild>
              <Link to="/catalogo">
                Ver todo <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {topSellers.map((c) => (
              <ChoreographyCard key={c.id} choreography={c} />
            ))}
          </div>
        </div>

        {/* New Releases */}
        <div>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="label-caps text-secondary mb-2">✨ Nuevo</p>
              <h2>Lanzamientos Recientes</h2>
            </div>
            <Button variant="ghost" className="gap-1 hidden sm:inline-flex" asChild>
              <Link to="/catalogo">
                Ver todo <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {newReleases.map((c) => (
              <ChoreographyCard key={c.id} choreography={c} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
