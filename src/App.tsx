import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index.tsx";
import Catalogo from "./pages/Catalogo.tsx";
import CursoDetalle from "./pages/CursoDetalle.tsx";
import Profesores from "./pages/Profesores.tsx";
import Login from "./pages/Login.tsx";
import Registro from "./pages/Registro.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Carrito from "./pages/Carrito.tsx";
import Perfil from "./pages/Perfil.tsx";
import NotFound from "./pages/NotFound.tsx";
import { AdminRoute } from "@/components/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import UserManagement from "./pages/admin/UserManagement.tsx";
import CourseConfig from "./pages/admin/CourseConfig.tsx";
import CourseStatistics from "./pages/admin/CourseStatistics.tsx";
import Reports from "./pages/admin/Reports.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/curso/:id" element={<CursoDetalle />} />
              <Route path="/profesores" element={<Profesores />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/usuarios"
                element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/cursos"
                element={
                  <AdminRoute>
                    <CourseConfig />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/estadisticas"
                element={
                  <AdminRoute>
                    <CourseStatistics />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/reportes"
                element={
                  <AdminRoute>
                    <Reports />
                  </AdminRoute>
                }
              />
              <Route path="/carrito" element={<Carrito />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
