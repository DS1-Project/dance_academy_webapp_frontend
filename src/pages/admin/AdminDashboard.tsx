import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, BarChart3, Music, Users } from "lucide-react";

const adminCards = [
  {
    title: "Configurar Usuarios",
    description: "Gestiona cuentas, roles y accesos de la plataforma.",
    icon: Users,
    to: "/admin/usuarios",
    accent: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Configurar Cursos",
    description: "Administra el catálogo de coreografías y contenido.",
    icon: Music,
    to: "/admin/cursos",
    accent: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    title: "Estadísticas de Cursos",
    description: "Consulta métricas de ventas y rendimiento.",
    icon: BarChart3,
    to: "/admin/estadisticas",
    accent: "text-accent",
    bg: "bg-accent/10",
  },
];

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 md:pt-28 pb-20">
        <div className="container">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al dashboard
          </Link>

          <div className="mb-8">
            <p className="label-caps text-primary mb-1">Panel de administración</p>
            <h1 className="text-3xl md:text-5xl mb-2">Hola, {user?.name.split(" ")[0]}</h1>
            <p className="text-muted-foreground">Selecciona un módulo para comenzar</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {adminCards.map((card) => (
              <Link
                key={card.to}
                to={card.to}
                className="group bg-card rounded-2xl shadow-card p-6 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}
                >
                  <card.icon className={`h-6 w-6 ${card.accent}`} />
                </div>
                <h2 className="text-lg font-bold mb-2">{card.title}</h2>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
