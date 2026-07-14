import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  DollarSign,
  ShoppingBag,
  Video,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import {
  fetchDashboardReports,
  type ReportsResponse,
} from "@/services/reportsService";

const currency = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const Reports = () => {
  const [data, setData] = useState<ReportsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    fetchDashboardReports()
      .then((res) => setData(res))
      .catch((err) => setError(getApiErrorMessage(err, "No se pudieron cargar los reportes")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kpis = data
    ? [
        {
          label: "Ingresos totales",
          value: currency(data.kpis.totalRevenue),
          icon: DollarSign,
          tone: "text-primary bg-primary/10",
        },
        {
          label: "Órdenes",
          value: data.kpis.totalOrders.toLocaleString("es-CO"),
          icon: ShoppingBag,
          tone: "text-secondary bg-secondary/10",
        },
        {
          label: "Videos vendidos",
          value: data.kpis.totalVideosSold.toLocaleString("es-CO"),
          icon: Video,
          tone: "text-accent bg-accent/10",
        },
        {
          label: "Ticket promedio",
          value: currency(data.kpis.avgTicket),
          icon: TrendingUp,
          tone: "text-primary bg-primary/10",
        },
      ]
    : [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 md:pt-28 pb-20">
        <div className="container">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al panel admin
          </Link>

          <div className="mb-8">
            <p className="label-caps text-primary mb-1">Reportes</p>
            <h1 className="text-3xl md:text-5xl mb-2">Dashboard Gerencial</h1>
            <p className="text-muted-foreground">
              Visión consolidada de ventas y desempeño, calculada a partir de las ventas y coreografías reales.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm mb-6">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{error}</span>
                <Button variant="link" size="sm" className="h-auto p-0 ml-2 text-destructive" onClick={load}>
                  Reintentar
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Cargando reportes...
            </div>
          ) : !data ? null : (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {kpis.map((k) => (
                  <Card key={k.label}>
                    <CardContent className="p-5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${k.tone}`}
                      >
                        <k.icon className="h-5 w-5" />
                      </div>
                      <p className="text-2xl font-display font-extrabold tabular-nums">
                        {k.value}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{k.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ingresos mensuales</CardTitle>
                    <CardDescription>
                      Evolución de ingresos y órdenes durante el año.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full h-[300px] md:h-[340px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={data.monthlyRevenue}
                          margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                          />
                          <XAxis
                            dataKey="month"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "12px",
                              fontSize: "12px",
                            }}
                            formatter={(value: number, name) =>
                              name === "revenue"
                                ? [currency(value), "Ingresos"]
                                : [value.toLocaleString("es-CO"), "Órdenes"]
                            }
                          />
                          <Legend
                            formatter={(v) => (v === "revenue" ? "Ingresos" : "Órdenes")}
                            wrapperStyle={{ fontSize: "12px" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2.5}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="orders"
                            stroke="hsl(var(--secondary))"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ventas por categoría</CardTitle>
                    <CardDescription>
                      Cantidad de videos vendidos por género musical.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full h-[300px] md:h-[340px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={data.salesByCategory}
                          margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                          />
                          <XAxis
                            dataKey="category"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={11}
                            interval={0}
                            angle={-20}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "12px",
                              fontSize: "12px",
                            }}
                            formatter={(value: number) => [
                              value.toLocaleString("es-CO"),
                              "Videos vendidos",
                            ]}
                          />
                          <Bar
                            dataKey="videosSold"
                            fill="hsl(var(--primary))"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reports;