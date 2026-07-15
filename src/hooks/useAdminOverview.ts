import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import {
  buildRecentUsers,
  buildTopSellingChoreographies,
  computeKpis,
  countNewUsersSince,
  sumRevenueForMonth,
  type RecentUserRow,
  type TopSellingRow,
} from "@/lib/reportsAggregator";
import { getAllUsers } from "@/services/adminService";
import { listChoreographies } from "@/services/choreographyService";
import { fetchAllSales } from "@/services/reportsService";

export interface AdminOverview {
  totalRevenue: number;
  newUsersCount: number;
  choreographyCount: number;
  revenueThisMonth: number;
  topSelling: TopSellingRow[];
  recentUsers: RecentUserRow[];
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Resumen del panel admin/director calculado a partir de usuarios, coreografías y ventas reales. */
export function useAdminOverview() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [users, choreographies, sales] = await Promise.all([
        getAllUsers(),
        listChoreographies(),
        fetchAllSales(),
      ]);

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - THIRTY_DAYS_MS);
      const kpis = computeKpis(sales);

      setOverview({
        totalRevenue: kpis.totalRevenue,
        newUsersCount: countNewUsersSince(users, thirtyDaysAgo),
        choreographyCount: choreographies.length,
        revenueThisMonth: sumRevenueForMonth(sales, now.getFullYear(), now.getMonth()),
        topSelling: buildTopSellingChoreographies(choreographies, 4),
        recentUsers: buildRecentUsers(users, 3),
      });
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo cargar el resumen administrativo"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { overview, isLoading, error, reload: load };
}
