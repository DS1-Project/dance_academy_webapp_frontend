import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Music } from "lucide-react";

const CourseConfig = () => (
  <div className="min-h-screen">
    <Navbar />
    <main className="pt-24 md:pt-28 pb-20">
      <div className="container max-w-2xl">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel admin
        </Link>

        <div className="bg-card rounded-2xl shadow-card p-8 text-center">
          <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
            <Music className="h-7 w-7 text-secondary" />
          </div>
          <h1 className="text-2xl md:text-3xl mb-2">Configurar Cursos</h1>
          <p className="text-muted-foreground">
            Este módulo estará disponible próximamente. Aquí podrás administrar el catálogo de
            coreografías y contenido educativo.
          </p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default CourseConfig;
