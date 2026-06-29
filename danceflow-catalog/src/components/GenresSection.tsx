import { genres } from "@/lib/mock-data";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const genreEmojis: Record<string, string> = {
  Salsa: "💃",
  Merengue: "🎺",
  Bachata: "🌹",
  Pop: "🎤",
  "Hip-Hop": "🔥",
  "Reggaetón": "🎶",
  Cumbia: "🥁",
  "Contemporáneo": "🦢",
};

export function GenresSection() {
  const ref = useScrollReveal();

  return (
    <section ref={ref} className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center mb-12">
          <p className="label-caps text-primary mb-2">Explora</p>
          <h2>Todos los Géneros</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
          {genres.map((genre) => (
            <button
              key={genre}
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 active:scale-[0.97]"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                {genreEmojis[genre] || "🎵"}
              </span>
              <span className="font-semibold text-sm">{genre}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
