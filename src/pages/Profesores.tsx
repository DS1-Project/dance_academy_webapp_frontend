import { useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Star, Music, Award, Loader2 } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCatalogChoreographies } from "@/hooks/useCatalogChoreographies";
import { deriveTeachersFromChoreographies } from "@/lib/teacherDirectory";

const Profesores = () => {
  const ref = useScrollReveal();
  const { backendItems, loading, error, reload } = useCatalogChoreographies();

  const teacherProfiles = useMemo(
    () => deriveTeachersFromChoreographies(backendItems),
    [backendItems]
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 md:pt-28 pb-20">
        <div className="container">
          <div className="mb-12 max-w-2xl">
            <p className="label-caps text-secondary mb-2">Nuestro equipo</p>
            <h1 className="text-4xl md:text-6xl mb-4">Profesores</h1>
            <p className="text-lg text-muted-foreground">
              Aprende de los mejores bailarines profesionales. Cada profesor trae años de experiencia y pasión al escenario digital.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Cargando profesores...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">⚠️</p>
              <h3 className="text-lg font-bold mb-2">No se pudieron cargar los profesores</h3>
              <p className="text-muted-foreground text-sm mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={reload}>
                Reintentar
              </Button>
            </div>
          ) : teacherProfiles.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-sm">Aún no hay profesores con coreografías publicadas.</p>
            </div>
          ) : (
            <div ref={ref} className="space-y-6">
              {teacherProfiles.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-card rounded-3xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Avatar area */}
                    <div className={`w-full md:w-64 h-48 md:h-auto bg-gradient-to-br ${teacher.gradientFrom} ${teacher.gradientTo} flex items-center justify-center shrink-0`}>
                      <span className="text-6xl md:text-7xl font-display font-extrabold text-primary-foreground/90">
                        {teacher.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-5 md:p-8">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-xl md:text-2xl font-display font-extrabold">{teacher.name}</h3>
                          <p className="text-sm text-primary font-semibold">{teacher.specialty}</p>
                        </div>
                        {teacher.rating > 0 && (
                          <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            <span className="text-sm font-bold tabular-nums">{teacher.rating}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 max-w-xl" style={{ textWrap: "pretty" }}>
                        {teacher.bio}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {teacher.genres.map((g) => (
                          <span key={g} className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                            {g}
                          </span>
                        ))}
                      </div>

                      {/* Stats row */}
                      <div className="flex flex-wrap items-center gap-6 text-sm">
                        {teacher.experience !== "—" && (
                          <div className="flex items-center gap-1.5">
                            <Award className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">{teacher.experience} exp.</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Music className="h-4 w-4 text-secondary" />
                          <span className="text-muted-foreground">{teacher.choreographyCount} coreografías</span>
                        </div>
                        {teacher.students > 0 && (
                          <div className="text-muted-foreground">
                            {teacher.students.toLocaleString()} alumnos
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profesores;
