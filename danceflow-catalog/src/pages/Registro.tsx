import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UserPlus, AlertCircle } from "lucide-react";

const Registro = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    const result = register(name, email, password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Error al registrarse");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 md:pt-28 pb-20">
        <div className="container max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl mb-3">Crear Cuenta</h1>
            <p className="text-muted-foreground">Únete a la comunidad DanceFlow</p>
          </div>

          <div className="bg-card rounded-3xl shadow-card p-6 md:p-8">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm mb-6">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Nombre completo</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" required className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Correo electrónico</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" required className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Confirmar contraseña</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repite la contraseña" required className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <Button type="submit" className="w-full gap-2" size="lg">
                <UserPlus className="h-4 w-4" />
                Crear Cuenta
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Registro;
