import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Star, Music, Award } from "lucide-react";
import { choreographies } from "@/lib/mock-data";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface TeacherProfile {
  name: string;
  specialty: string;
  bio: string;
  experience: string;
  genres: string[];
  rating: number;
  students: number;
  gradientFrom: string;
  gradientTo: string;
}

const teacherProfiles: TeacherProfile[] = [
  {
    name: "María García",
    specialty: "Bachata & Reggaetón",
    bio: "Bailarina profesional con más de 12 años de experiencia internacional. Ha competido en campeonatos de bachata en República Dominicana y España.",
    experience: "12 años",
    genres: ["Bachata", "Reggaetón", "Salsa"],
    rating: 4.9,
    students: 1315,
    gradientFrom: "from-secondary",
    gradientTo: "to-rose-400",
  },
  {
    name: "Carlos Fuentes",
    specialty: "Merengue & Salsa",
    bio: "Instructor certificado y coreógrafo. Fundador de la escuela 'Ritmo Latino' en Medellín. Especialista en ritmos caribeños tradicionales.",
    experience: "15 años",
    genres: ["Merengue", "Salsa", "Cumbia"],
    rating: 4.7,
    students: 1625,
    gradientFrom: "from-primary",
    gradientTo: "to-amber-400",
  },
  {
    name: "Ana Rodríguez",
    specialty: "Salsa & Contemporáneo",
    bio: "Formada en la Escuela Nacional de Danza de Cuba. Combina técnica clásica con expresión moderna. Jurado en múltiples competencias nacionales.",
    experience: "10 años",
    genres: ["Salsa", "Contemporáneo"],
    rating: 4.9,
    students: 943,
    gradientFrom: "from-violet-500",
    gradientTo: "to-secondary",
  },
  {
    name: "David Chen",
    specialty: "Hip-Hop & Pop Dance",
    bio: "Ex bailarín de backup para artistas internacionales. Especialista en coreografías urbanas y freestyle. Creador de contenido con +500K seguidores.",
    experience: "8 años",
    genres: ["Hip-Hop", "Pop"],
    rating: 4.7,
    students: 1356,
    gradientFrom: "from-fuchsia-600",
    gradientTo: "to-primary",
  },
  {
    name: "Lucía Morales",
    specialty: "Cumbia & Folclor",
    bio: "Investigadora y difusora de danzas folclóricas latinoamericanas. Ha llevado la cumbia colombiana a escenarios en Europa y Asia.",
    experience: "14 años",
    genres: ["Cumbia", "Salsa", "Merengue"],
    rating: 4.6,
    students: 472,
    gradientFrom: "from-amber-500",
    gradientTo: "to-primary",
  },
];

const Profesores = () => {
  const ref = useScrollReveal();

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

          <div ref={ref} className="space-y-6">
            {teacherProfiles.map((teacher) => {
              const teacherChoreographies = choreographies.filter(
                (c) => c.mainTeacher === teacher.name || c.guestTeacher === teacher.name
              );
              return (
                <div
                  key={teacher.name}
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
                        <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="text-sm font-bold tabular-nums">{teacher.rating}</span>
                        </div>
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
                        <div className="flex items-center gap-1.5">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">{teacher.experience} exp.</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Music className="h-4 w-4 text-secondary" />
                          <span className="text-muted-foreground">{teacherChoreographies.length} coreografías</span>
                        </div>
                        <div className="text-muted-foreground">
                          {teacher.students.toLocaleString()} alumnos
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profesores;
