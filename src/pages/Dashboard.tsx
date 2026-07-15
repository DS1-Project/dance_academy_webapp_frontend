import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProfesorDashboard } from "@/components/dashboards/ProfesorDashboard";
import { ClienteDashboard } from "@/components/dashboards/ClienteDashboard";
import { dashboardHomePath } from "@/lib/dashboardHome";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  // Admin/director hub is /admin (4 modules), not the legacy metrics panel.
  if (user.role === "admin" || user.role === "director") {
    return <Navigate to={dashboardHomePath(user.role)} replace />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 md:pt-28 pb-20">
        <div className="container">
          {user.role === "profesor" && <ProfesorDashboard user={user} />}
          {user.role === "cliente" && <ClienteDashboard user={user} />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
