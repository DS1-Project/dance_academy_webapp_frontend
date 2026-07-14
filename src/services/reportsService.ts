// Mock service that simulates a JSON response from an optimized SQL backend.
// It emulates aggregations like:
//   SELECT DATE_TRUNC('month', created_at) AS month, SUM(amount) AS revenue,
//          COUNT(*) AS orders FROM sales GROUP BY 1 ORDER BY 1;
//   SELECT category, COUNT(*) AS videos_sold, SUM(amount) AS revenue
//   FROM sales JOIN videos ... GROUP BY category ORDER BY 2 DESC;

export interface MonthlyRevenuePoint {
  month: string;      // "Ene", "Feb", ...
  revenue: number;    // SUM(amount)
  orders: number;     // COUNT(*)
}

export interface CategorySalesPoint {
  category: string;   // Genre
  videosSold: number; // COUNT(*)
  revenue: number;    // SUM(amount)
}

export interface KpiSummary {
  totalRevenue: number;
  totalOrders: number;
  totalVideosSold: number;
  avgTicket: number;
}

export interface ReportsResponse {
  kpis: KpiSummary;
  monthlyRevenue: MonthlyRevenuePoint[];
  salesByCategory: CategorySalesPoint[];
  generatedAt: string;
}

const MOCK_RESPONSE: ReportsResponse = {
  generatedAt: new Date().toISOString(),
  kpis: {
    totalRevenue: 128470,
    totalOrders: 4210,
    totalVideosSold: 8930,
    avgTicket: 30.51,
  },
  monthlyRevenue: [
    { month: "Ene", revenue: 8200, orders: 260 },
    { month: "Feb", revenue: 9450, orders: 305 },
    { month: "Mar", revenue: 10120, orders: 330 },
    { month: "Abr", revenue: 11780, orders: 380 },
    { month: "May", revenue: 12540, orders: 410 },
    { month: "Jun", revenue: 11890, orders: 395 },
    { month: "Jul", revenue: 13420, orders: 445 },
    { month: "Ago", revenue: 14280, orders: 470 },
    { month: "Sep", revenue: 12980, orders: 425 },
    { month: "Oct", revenue: 15320, orders: 510 },
    { month: "Nov", revenue: 16890, orders: 560 },
    { month: "Dic", revenue: 18470, orders: 620 },
  ],
  salesByCategory: [
    { category: "Reggaetón", videosSold: 2340, revenue: 42120 },
    { category: "Salsa", videosSold: 1890, revenue: 34210 },
    { category: "Bachata", videosSold: 1520, revenue: 27890 },
    { category: "Pop", videosSold: 1240, revenue: 21340 },
    { category: "Hip-Hop", videosSold: 980, revenue: 17650 },
    { category: "Merengue", videosSold: 720, revenue: 12480 },
    { category: "Contemporáneo", videosSold: 240, revenue: 4980 },
  ],
};

/**
 * Simulates fetching aggregated report data from the backend.
 * Adds a small latency to emulate a real network round-trip.
 */
export async function fetchDashboardReports(): Promise<ReportsResponse> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  // Return a fresh copy so consumers can't mutate the mock.
  return JSON.parse(JSON.stringify(MOCK_RESPONSE));
}