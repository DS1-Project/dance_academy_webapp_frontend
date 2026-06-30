import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { ProfesorDashboard } from "@/components/dashboards/ProfesorDashboard";
import { ClienteDashboard } from "@/components/dashboards/ClienteDashboard";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 md:pt-28 pb-20">
        <div className="container">
          {(user.role === "admin" || user.role === "director") && <AdminDashboard user={user} />}
          {user.role === "profesor" && <ProfesorDashboard user={user} />}
          {user.role === "cliente" && <ClienteDashboard user={user} />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
