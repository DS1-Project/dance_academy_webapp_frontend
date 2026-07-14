import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Eye, EyeOff, LogIn, AlertCircle, Loader2, Clock } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { required, validateEmail } from "@/lib/formValidation";
import {
  LOGIN_ROLE_OPTIONS,
  matchesSelectedRole,
  type SelectableLoginRole,
} from "@/lib/userRoleOptions";
import type { BackendRole } from "@/types/auth";

const RECAPTCHA_SITE_KEY =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LfIKlItAAAAADuaamFvCgnFpHUvGruN2egJsNX6";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<SelectableLoginRole>("client");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { login, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const infoMessage = (location.state as { message?: string })?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailError = validateEmail(email);
    const passwordError = required(password, "La contraseña");
    if (emailError || passwordError) {
      setError(emailError || passwordError || "Completa los campos.");
      return;
    }

    const token =
      captchaToken ||
      (import.meta.env.DEV
        ? import.meta.env.VITE_CAPTCHA_DEV_TOKEN || "dev-bypass"
        : null);

    if (!token) {
      setError("Completa el captcha antes de continuar.");
      return;
    }

    const result = await login(email, password, token);

    if (result.success) {
      const role = result.user?.role as BackendRole | undefined;
      if (!matchesSelectedRole(selectedRole, role)) {
        logout();
        setError(
          "El tipo de usuario seleccionado no coincide con esta cuenta. Elige el rol correcto e inténtalo de nuevo."
        );
        return;
      }

      if (role === "admin" || role === "director") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } else {
      setError(result.error || "Error al iniciar sesión");
    }
  };

  const isPendingApprovalError = error.toLowerCase().includes("aprobada");

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 md:pt-28 pb-20">
        <div className="container max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl mb-3">Iniciar Sesión</h1>
            <p className="text-muted-foreground">Accede a tu cuenta de DanceFlow</p>
          </div>

          <div className="bg-card rounded-3xl shadow-card p-6 md:p-8">
            {infoMessage && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/10 text-primary text-sm mb-6">
                <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{infoMessage}</span>
              </div>
            )}

            {error && (
              <div
                className={`flex items-start gap-2 p-3 rounded-xl text-sm mb-6 ${
                  isPendingApprovalError
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {isPendingApprovalError ? (
                  <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                )}
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-caps text-xs text-muted-foreground mb-1.5 block">
                  Tipo de usuario
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as SelectableLoginRole)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                >
                  {LOGIN_ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-caps text-xs text-muted-foreground mb-1.5 block">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                />
              </div>
              <div>
                <label className="label-caps text-xs text-muted-foreground mb-1.5 block">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-12 disabled:opacity-60"
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

              <ReCAPTCHA
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
                onExpired={() => setCaptchaToken(null)}
              />

              <Button type="submit" className="w-full gap-2" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              ¿No tienes cuenta?{" "}
              <Link to="/registro" className="text-primary font-semibold hover:underline">
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
