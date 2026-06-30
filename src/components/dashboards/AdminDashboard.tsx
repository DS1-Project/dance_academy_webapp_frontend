import type { User } from "@/types/auth";
import { BarChart3, Users, Music, TrendingUp, DollarSign } from "lucide-react";

const stats = [
  { label: "Ventas Totales", value: "$12,847", icon: DollarSign, change: "+12.5%" },
  { label: "Usuarios Nuevos", value: "284", icon: Users, change: "+8.2%" },
  { label: "Coreografías", value: "120", icon: Music, change: "+5" },
  { label: "Ingresos Mes", value: "$3,421", icon: TrendingUp, change: "+15.3%" },
];

const topSelling = [
  { name: "Suavemente", teacher: "Carlos Fuentes", sales: 1247, revenue: "$31,162" },
  { name: "Despacito Remix", teacher: "María García", sales: 892, revenue: "$26,746" },
  { name: "Blinding Lights", teacher: "David Chen", sales: 789, revenue: "$27,607" },
  { name: "Vivir Mi Vida", teacher: "Ana Rodríguez", sales: 654, revenue: "$22,870" },
];

export function AdminDashboard({ user }: { user: User }) {
  return (
    <div>
      <div className="mb-8">
        <p className="label-caps text-primary mb-1">{user.role === "admin" ? "Administrador" : "Director"}</p>
        <h1 className="text-3xl md:text-5xl mb-2">Hola, {user.name.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Panel de control general</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-accent">{s.change}</span>
            </div>
            <p className="text-2xl font-display font-extrabold">{s.value}</p>
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
              {topSelling.map((item, i) => (
                <tr key={i} className="border-b border-border/50 last:border-0">
                  <td className="py-3 font-semibold">{item.name}</td>
                  <td className="py-3 text-muted-foreground">{item.teacher}</td>
                  <td className="py-3 text-right tabular-nums">{item.sales.toLocaleString()}</td>
                  <td className="py-3 text-right font-semibold tabular-nums">{item.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-card rounded-2xl shadow-card p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-secondary" />
          <h3 className="font-bold">Usuarios Recientes</h3>
        </div>
        <div className="space-y-3">
          {[
            { name: "Camila Restrepo", role: "cliente", date: "Hace 2 horas" },
            { name: "Diego Ramírez", role: "cliente", date: "Hace 5 horas" },
            { name: "Valentina López", role: "cliente", date: "Hace 1 día" },
          ].map((u, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.role}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{u.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
