import type { AdminUser } from "@/types/admin";
import type { BackendChoreography, BackendSale } from "@/types/backend";

export interface MonthlyRevenuePoint {
  month: string;
  revenue: number;
  orders: number;
}

export interface CategorySalesPoint {
  category: string;
  videosSold: number;
  revenue: number;
}

export interface KpiSummary {
  totalRevenue: number;
  totalOrders: number;
  totalVideosSold: number;
  avgTicket: number;
}

export interface TopSellingRow {
  id: string;
  title: string;
  teacher: string;
  sales: number;
  revenue: number;
}

export interface RecentUserRow {
  id: string;
  name: string;
  role: string;
  createdAt: string;
}

const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function monthKeyAndLabel(dateStr: string): { key: string; label: string } {
  const date = new Date(dateStr);
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  return { key, label: `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}` };
}

export function filterCompletedSales(sales: BackendSale[]): BackendSale[] {
  return sales.filter((s) => s.payment_status === "completed");
}

/** SUM(total_amount), COUNT(*), y ticket promedio solo sobre ventas completadas. */
export function computeKpis(sales: BackendSale[]): KpiSummary {
  const completed = filterCompletedSales(sales);
  const totalRevenue = completed.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
  const totalOrders = completed.length;
  const totalVideosSold = completed.reduce((sum, s) => sum + s.details.length, 0);
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalOrders,
    totalVideosSold,
    avgTicket: Number(avgTicket.toFixed(2)),
  };
}

/** Emula: SELECT DATE_TRUNC('month', created_at), SUM(total_amount), COUNT(*) GROUP BY 1 ORDER BY 1. */
export function aggregateMonthlyRevenue(sales: BackendSale[]): MonthlyRevenuePoint[] {
  const completed = filterCompletedSales(sales);
  const byMonth = new Map<string, { label: string; revenue: number; orders: number }>();

  for (const sale of completed) {
    const { key, label } = monthKeyAndLabel(sale.created_at);
    const amount = Number(sale.total_amount || 0);
    const existing = byMonth.get(key);
    if (existing) {
      existing.revenue += amount;
      existing.orders += 1;
    } else {
      byMonth.set(key, { label, revenue: amount, orders: 1 });
    }
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => ({ month: value.label, revenue: Number(value.revenue.toFixed(2)), orders: value.orders }));
}

/** Emula: SELECT dance_style, COUNT(*), SUM(unit_price) FROM sales JOIN choreographies GROUP BY 1 ORDER BY 2 DESC. */
export function aggregateSalesByCategory(
  sales: BackendSale[],
  choreographies: BackendChoreography[]
): CategorySalesPoint[] {
  const styleById = new Map<string, string>();
  for (const c of choreographies) {
    const style = c.dance_style;
    const name = !style ? "Sin categoría" : typeof style === "string" ? style : style.name;
    styleById.set(c.id, name);
  }

  const byCategory = new Map<string, CategorySalesPoint>();
  for (const sale of filterCompletedSales(sales)) {
    for (const detail of sale.details) {
      const category =
        (detail.choreography && styleById.get(detail.choreography)) ||
        detail.choreography_title ||
        "Sin categoría";
      const price = Number(detail.unit_price || 0);
      const existing = byCategory.get(category);
      if (existing) {
        existing.videosSold += 1;
        existing.revenue += price;
      } else {
        byCategory.set(category, { category, videosSold: 1, revenue: price });
      }
    }
  }

  return [...byCategory.values()]
    .map((p) => ({ ...p, revenue: Number(p.revenue.toFixed(2)) }))
    .sort((a, b) => b.revenue - a.revenue);
}

function teacherLabel(teacher: BackendChoreography["main_teacher"]): string {
  if (!teacher) return "Sin profesor";
  if (typeof teacher === "string") return teacher;
  const full = `${teacher.first_name} ${teacher.last_name}`.trim();
  return full || teacher.email;
}

/** Ranking de coreografías más vendidas con ingresos estimados (ventas × precio actual). */
export function buildTopSellingChoreographies(
  choreographies: BackendChoreography[],
  limit = 4
): TopSellingRow[] {
  return [...choreographies]
    .sort((a, b) => (b.stats?.total_sales_count ?? 0) - (a.stats?.total_sales_count ?? 0))
    .slice(0, limit)
    .map((c) => {
      const sales = c.stats?.total_sales_count ?? 0;
      const price = c.stats?.actual_price ? Number(c.stats.actual_price) : 0;
      return {
        id: c.id,
        title: c.title,
        teacher: teacherLabel(c.main_teacher),
        sales,
        revenue: Number((sales * price).toFixed(2)),
      };
    });
}

/** Usuarios más recientes por fecha de creación, para el listado del panel admin. */
export function buildRecentUsers(users: AdminUser[], limit = 3): RecentUserRow[] {
  return [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
    .map((u) => ({
      id: u.id,
      name: [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || u.email,
      role: u.role,
      createdAt: u.created_at,
    }));
}

export function countNewUsersSince(users: AdminUser[], sinceDate: Date): number {
  return users.filter((u) => new Date(u.created_at).getTime() >= sinceDate.getTime()).length;
}

export function sumRevenueForMonth(sales: BackendSale[], year: number, month: number): number {
  const total = filterCompletedSales(sales)
    .filter((s) => {
      const d = new Date(s.created_at);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
  return Number(total.toFixed(2));
}
