import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChoreographyCard } from "@/components/ChoreographyCard";
import { choreographies, genres, difficulties, teachers } from "@/lib/mock-data";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Catalogo = () => {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return choreographies.filter((c) => {
      const matchSearch = !search || c.songName.toLowerCase().includes(search.toLowerCase()) || c.mainTeacher.toLowerCase().includes(search.toLowerCase());
      const matchGenre = !selectedGenre || c.genre === selectedGenre;
      const matchDifficulty = !selectedDifficulty || c.difficulty === selectedDifficulty;
      const matchTeacher = !selectedTeacher || c.mainTeacher === selectedTeacher || c.guestTeacher === selectedTeacher;
      return matchSearch && matchGenre && matchDifficulty && matchTeacher;
    });
  }, [search, selectedGenre, selectedDifficulty, selectedTeacher]);

  const hasFilters = selectedGenre || selectedDifficulty || selectedTeacher;

  const clearFilters = () => {
    setSelectedGenre(null);
    setSelectedDifficulty(null);
    setSelectedTeacher(null);
    setSearch("");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 md:pt-28 pb-20">
        <div className="container">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-6xl mb-4">Catálogo</h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Explora todas nuestras coreografías. Filtra por género, nivel o profesor.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por canción o profesor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="default"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
              </Button>
            </div>

            {showFilters && (
              <div className="p-5 rounded-2xl bg-card shadow-card animate-reveal-up space-y-4">
                {/* Genre */}
                <div>
                  <p className="label-caps text-muted-foreground mb-2 text-xs">Género</p>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((g) => (
                      <button
                        key={g}
                        onClick={() => setSelectedGenre(selectedGenre === g ? null : g)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-[0.95] ${
                          selectedGenre === g
                            ? "bg-gradient-brand text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <p className="label-caps text-muted-foreground mb-2 text-xs">Nivel</p>
                  <div className="flex flex-wrap gap-2">
                    {difficulties.map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDifficulty(selectedDifficulty === d ? null : d)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-[0.95] ${
                          selectedDifficulty === d
                            ? "bg-gradient-brand text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Teacher */}
                <div>
                  <p className="label-caps text-muted-foreground mb-2 text-xs">Profesor</p>
                  <div className="flex flex-wrap gap-2">
                    {teachers.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTeacher(selectedTeacher === t ? null : t)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-[0.95] ${
                          selectedTeacher === t
                            ? "bg-gradient-brand text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                    <X className="h-4 w-4" /> Limpiar filtros
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Results */}
          <p className="text-sm text-muted-foreground mb-6">{filtered.length} coreografías encontradas</p>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
              {filtered.map((c) => (
                <ChoreographyCard key={c.id} choreography={c} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="text-lg font-bold mb-2">Sin resultados</h3>
              <p className="text-muted-foreground text-sm">Intenta con otros filtros o términos de búsqueda.</p>
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Catalogo;
