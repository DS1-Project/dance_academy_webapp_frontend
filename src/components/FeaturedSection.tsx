import { ChoreographyCard } from "@/components/ChoreographyCard";
import { choreographies } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function FeaturedSection() {
  const ref = useScrollReveal();
  const topSellers = [...choreographies].sort((a, b) => b.salesCount - a.salesCount).slice(0, 4);
  const newReleases = choreographies.slice(0, 4);

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
