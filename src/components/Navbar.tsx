import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingCart, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const navLinks = [
  { label: "Inicio", path: "/" },
  { label: "Catálogo", path: "/catalogo" },
  { label: "Profesores", path: "/profesores" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
            <span className="text-primary-foreground font-display font-extrabold text-lg">D</span>
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight hidden sm:block">
            DanceFlow
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                location.pathname === link.path
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/carrito" className="relative p-2 rounded-full hover:bg-muted transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-brand rounded-full text-[10px] text-primary-foreground font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated && user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-1.5" asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
                <div className="w-6 h-6 rounded-full bg-gradient-brand flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold max-w-[100px] truncate">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Iniciar Sesión</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/registro">Registrarse</Link>
              </Button>
            </div>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl animate-reveal-up">
          <div className="container py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  location.pathname === link.path ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl text-sm font-semibold text-primary">
                  Dashboard
                </Link>
                <Button variant="outline" size="sm" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>Iniciar Sesión</Link>
                </Button>
                <Button size="sm" className="flex-1" asChild>
                  <Link to="/registro" onClick={() => setMobileOpen(false)}>Registrarse</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
