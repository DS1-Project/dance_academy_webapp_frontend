import { Link } from "react-router-dom";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCatalogChoreographies } from "@/hooks/useCatalogChoreographies";
import { buildLandingGenreLinks } from "@/lib/landingStats";

const genreEmojis: Record<string, string> = {
  Salsa: "💃",
  Merengue: "🎺",
  Bachata: "🌹",
  Pop: "🎤",
  "Hip-Hop": "🔥",
  "Reggaetón": "🎶",
  Cumbia: "🥁",
  Contemporáneo: "🦢",
};

export function GenresSection() {
  const ref = useScrollReveal();
  const { items, loading, error } = useCatalogChoreographies();
  const genres = useMemo(() => buildLandingGenreLinks(items, 5), [items]);

  return (
    <section ref={ref} className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center mb-12">
          <p className="label-caps text-primary mb-2">Explora</p>
          <h2>Géneros Destacados</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Solo géneros con coreografías disponibles en el catálogo
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando géneros...
          </div>
        ) : error || genres.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {error || "Aún no hay géneros con coreografías publicadas."}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 stagger-children max-w-4xl mx-auto">
            {genres.map((genre) => (
              <Link
                key={genre.name}
                to={`/catalogo?genre=${encodeURIComponent(genre.name)}`}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 active:scale-[0.97]"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {genreEmojis[genre.name] || "🎵"}
                </span>
                <span className="font-semibold text-sm text-center">{genre.name}</span>
                <span className="text-xs text-muted-foreground">
                  {genre.count} {genre.count === 1 ? "curso" : "cursos"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
