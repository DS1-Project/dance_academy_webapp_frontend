import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, BarChart3 } from "lucide-react";

const CourseStatistics = () => (
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
          <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-7 w-7 text-accent" />
          </div>
          <h1 className="text-2xl md:text-3xl mb-2">Estadísticas de Cursos</h1>
          <p className="text-muted-foreground">
            Este módulo estará disponible próximamente. Aquí podrás consultar métricas de ventas,
            popularidad y rendimiento de las coreografías.
          </p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default CourseStatistics;
