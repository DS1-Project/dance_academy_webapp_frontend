import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, testUsers } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = login(email, password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Error al iniciar sesión");
    }
  };

  const quickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword("dance123");
    const result = login(userEmail, "dance123");
    if (result.success) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 md:pt-28 pb-20">
        <div className="container max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl mb-3">Iniciar Sesión</h1>
            <p className="text-muted-foreground">Accede a tu cuenta de DanceFlow</p>
          </div>

          <div className="bg-card rounded-3xl shadow-card p-6 md:p-8 mb-6">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm mb-6">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full gap-2" size="lg">
                <LogIn className="h-4 w-4" />
                Iniciar Sesión
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              ¿No tienes cuenta?{" "}
              <Link to="/registro" className="text-primary font-semibold hover:underline">
                Regístrate
              </Link>
            </p>
          </div>

          {/* Quick login with test users */}
          <div className="bg-muted/50 rounded-3xl p-5">
            <p className="label-caps text-xs text-muted-foreground mb-3">Usuarios de prueba (contraseña: dance123)</p>
            <div className="grid grid-cols-1 gap-2">
              {testUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => quickLogin(u.email)}
                  className="flex items-center justify-between p-3 rounded-xl bg-card hover:shadow-card transition-all text-left active:scale-[0.98]"
                >
                  <div>
                    <p className="text-sm font-semibold">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    u.role === "admin" ? "bg-destructive/15 text-destructive" :
                    u.role === "director" ? "bg-primary/15 text-primary" :
                    u.role === "profesor" ? "bg-secondary/15 text-secondary" :
                    "bg-accent/15 text-accent"
                  }`}>
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
