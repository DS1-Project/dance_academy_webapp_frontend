import { api } from "@/lib/api";
import { listChoreographies } from "@/services/choreographyService";
import {
  aggregateMonthlyRevenue,
  aggregateSalesByCategory,
  computeKpis,
  type CategorySalesPoint,
  type KpiSummary,
  type MonthlyRevenuePoint,
} from "@/lib/reportsAggregator";
import type { BackendSale } from "@/types/backend";

export type { MonthlyRevenuePoint, CategorySalesPoint, KpiSummary };

export interface ReportsResponse {
  kpis: KpiSummary;
  monthlyRevenue: MonthlyRevenuePoint[];
  salesByCategory: CategorySalesPoint[];
  generatedAt: string;
}

/** GET /api/sales/ — para staff el backend devuelve todas las ventas de la plataforma. */
export async function fetchAllSales(): Promise<BackendSale[]> {
  const { data } = await api.get<BackendSale[]>("/api/sales/");
  return data;
}

/**
 * Construye el reporte gerencial combinando ventas y coreografías reales del backend,
 * emulando las agregaciones SQL de ingresos mensuales y ventas por categoría.
 */
export async function fetchDashboardReports(): Promise<ReportsResponse> {
  const [sales, choreographies] = await Promise.all([fetchAllSales(), listChoreographies()]);

  return {
    kpis: computeKpis(sales),
    monthlyRevenue: aggregateMonthlyRevenue(sales),
    salesByCategory: aggregateSalesByCategory(sales, choreographies),
    generatedAt: new Date().toISOString(),
  };
}
