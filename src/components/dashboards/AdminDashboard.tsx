import type { User } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { useAdminOverview } from "@/hooks/useAdminOverview";
import {
  BarChart3,
  Users,
  Music,
  TrendingUp,
  DollarSign,
  Loader2,
  AlertCircle,
} from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  director: "Director",
  teacher: "Profesor",
  client: "Cliente",
};

export function AdminDashboard({ user }: { user: User }) {
  const { overview, isLoading, error, reload } = useAdminOverview();

  const stats = [
    { label: "Ingresos Totales", value: `$${(overview?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign },
    { label: "Usuarios Nuevos (30d)", value: String(overview?.newUsersCount ?? 0), icon: Users },
    { label: "Coreografías", value: String(overview?.choreographyCount ?? 0), icon: Music },
    { label: "Ingresos Este Mes", value: `$${(overview?.revenueThisMonth ?? 0).toLocaleString()}`, icon: TrendingUp },
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="label-caps text-primary mb-1">{user.role === "admin" ? "Administrador" : "Director"}</p>
        <h1 className="text-3xl md:text-5xl mb-2">Hola, {user.name.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Panel de control general</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm mb-6">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{error}</span>
            <Button variant="link" size="sm" className="h-auto p-0 ml-2 text-destructive" onClick={reload}>
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Cargando panel...
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="bg-card rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-display font-extrabold tabular-nums">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Top Selling Table */}
          <div className="bg-card rounded-2xl shadow-card p-5 md:p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="font-bold">Coreografías Más Vendidas</h3>
            </div>
            {!overview || overview.topSelling.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aún no hay ventas registradas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-semibold">Coreografía</th>
                      <th className="text-left py-2 text-muted-foreground font-semibold">Profesor</th>
                      <th className="text-right py-2 text-muted-foreground font-semibold">Ventas</th>
                      <th className="text-right py-2 text-muted-foreground font-semibold">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.topSelling.map((item) => (
                      <tr key={item.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 font-semibold">{item.title}</td>
                        <td className="py-3 text-muted-foreground">{item.teacher}</td>
                        <td className="py-3 text-right tabular-nums">{item.sales.toLocaleString()}</td>
                        <td className="py-3 text-right font-semibold tabular-nums">${item.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Users */}
          <div className="bg-card rounded-2xl shadow-card p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-secondary" />
              <h3 className="font-bold">Usuarios Recientes</h3>
            </div>
            {!overview || overview.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No hay usuarios registrados todavía.</p>
            ) : (
              <div className="space-y-3">
                {overview.recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{ROLE_LABELS[u.role] ?? u.role}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
