import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardHomePath } from "@/lib/dashboardHome";
import { firstError, required } from "@/lib/formValidation";
import { AlertCircle, ArrowLeft, Loader2, UserRound } from "lucide-react";

const Perfil = () => {
  const { user, isAuthenticated, isLoading, updateProfile, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    void refreshUser();
    // Solo al montar para hidratar el perfil desde /me/
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) return;
    const [first = "", ...rest] = user.name.split(" ");
    setFirstName(first);
    setLastName(rest.join(" "));
  }, [user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = firstError(
      required(firstName, "El nombre"),
      required(lastName, "El apellido")
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    const result = await updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
    if (!result.success) {
      setError(result.error || "No se pudo guardar");
      return;
    }
    setSuccess("Perfil actualizado correctamente.");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 md:pt-28 pb-20">
        <div className="container max-w-lg mx-auto">
          <Link
            to={dashboardHomePath(user.role)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al dashboard
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <UserRound className="h-5 w-5 text-primary" />
              <p className="label-caps text-primary">Mi cuenta</p>
            </div>
            <h1 className="text-3xl md:text-4xl mb-2">Perfil</h1>
            <p className="text-muted-foreground">Actualiza tus datos personales</p>
          </div>

          <div className="bg-card rounded-3xl shadow-card p-6 md:p-8">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm mb-4">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-accent/15 text-accent text-sm mb-4">{success}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Correo</label>
                <input
                  type="email"
                  value={user?.email ?? ""}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 text-sm text-muted-foreground"
                />
              </div>
              <div>
                <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Nombre</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Apellido</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar cambios
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Perfil;
