import { describe, expect, it } from "vitest";
import {
  aggregateMonthlyRevenue,
  aggregateSalesByCategory,
  buildRecentUsers,
  buildTopSellingChoreographies,
  computeKpis,
  countNewUsersSince,
  filterCompletedSales,
  sumRevenueForMonth,
} from "@/lib/reportsAggregator";
import type { AdminUser } from "@/types/admin";
import type { BackendChoreography, BackendSale } from "@/types/backend";

function makeSale(overrides: Partial<BackendSale> & Pick<BackendSale, "id">): BackendSale {
  return {
    client: "client-1",
    client_email: "client@test.com",
    total_amount: "0.00",
    payment_status: "completed",
    billing_address: "Calle 1, Bogotá",
    created_at: "2026-01-10T00:00:00Z",
    details: [],
    ...overrides,
  };
}

describe("reportsAggregator", () => {
  const sales: BackendSale[] = [
    makeSale({
      id: "s1",
      total_amount: "50.00",
      created_at: "2026-01-05T00:00:00Z",
      details: [
        { id: "d1", choreography: "c1", choreography_title: "Despacito", unit_price: "30.00" },
        { id: "d2", choreography: "c2", choreography_title: "Suavemente", unit_price: "20.00" },
      ],
    }),
    makeSale({
      id: "s2",
      total_amount: "20.00",
      created_at: "2026-01-20T00:00:00Z",
      details: [{ id: "d3", choreography: "c1", choreography_title: "Despacito", unit_price: "20.00" }],
    }),
    makeSale({
      id: "s3",
      total_amount: "999.00",
      payment_status: "pending",
      created_at: "2026-01-22T00:00:00Z",
      details: [{ id: "d4", choreography: "c1", choreography_title: "Despacito", unit_price: "999.00" }],
    }),
    makeSale({
      id: "s4",
      total_amount: "15.00",
      created_at: "2026-02-02T00:00:00Z",
      details: [{ id: "d5", choreography: "c2", choreography_title: "Suavemente", unit_price: "15.00" }],
    }),
  ];

  const choreographies: BackendChoreography[] = [
    {
      id: "c1",
      title: "Despacito",
      description: "",
      difficulty_level: "beginner",
      thumbnail_url: "",
      is_approved: true,
      created_at: "2026-01-01T00:00:00Z",
      main_teacher: { id: "t1", email: "maria@test.com", first_name: "María", last_name: "García" },
      dance_style: { id: "s1", name: "Reggaetón", description: null },
      stats: {
        actual_price: "20.00",
        total_views: 100,
        total_sales_count: 2,
        average_rating: "4.5",
        last_updated: "2026-01-02T00:00:00Z",
      },
    },
    {
      id: "c2",
      title: "Suavemente",
      description: "",
      difficulty_level: "beginner",
      thumbnail_url: "",
      is_approved: true,
      created_at: "2026-01-01T00:00:00Z",
      main_teacher: { id: "t2", email: "carlos@test.com", first_name: "Carlos", last_name: "Fuentes" },
      dance_style: { id: "s2", name: "Merengue", description: null },
      stats: {
        actual_price: "15.00",
        total_views: 50,
        total_sales_count: 1,
        average_rating: "4.0",
        last_updated: "2026-01-02T00:00:00Z",
      },
    },
  ];

  it("filters only completed sales", () => {
    expect(filterCompletedSales(sales).map((s) => s.id)).toEqual(["s1", "s2", "s4"]);
  });

  it("computes kpis ignoring non-completed sales", () => {
    expect(computeKpis(sales)).toEqual({
      totalRevenue: 85,
      totalOrders: 3,
      totalVideosSold: 4,
      avgTicket: Number((85 / 3).toFixed(2)),
    });
  });

  it("aggregates monthly revenue grouped by month, sorted chronologically", () => {
    const result = aggregateMonthlyRevenue(sales);
    expect(result).toEqual([
      { month: "Ene 2026", revenue: 70, orders: 2 },
      { month: "Feb 2026", revenue: 15, orders: 1 },
    ]);
  });

  it("aggregates sales by dance style category sorted by revenue desc", () => {
    const result = aggregateSalesByCategory(sales, choreographies);
    expect(result).toEqual([
      { category: "Reggaetón", videosSold: 2, revenue: 50 },
      { category: "Merengue", videosSold: 2, revenue: 35 },
    ]);
  });

  it("builds top selling choreographies ranked by sales with estimated revenue", () => {
    const result = buildTopSellingChoreographies(choreographies, 2);
    expect(result).toEqual([
      { id: "c1", title: "Despacito", teacher: "María García", sales: 2, revenue: 40 },
      { id: "c2", title: "Suavemente", teacher: "Carlos Fuentes", sales: 1, revenue: 15 },
    ]);
  });

  it("sums revenue for a specific month", () => {
    expect(sumRevenueForMonth(sales, 2026, 0)).toBe(70);
    expect(sumRevenueForMonth(sales, 2026, 1)).toBe(15);
  });

  const users: AdminUser[] = [
    {
      id: "u1",
      email: "a@test.com",
      username: "a",
      first_name: "Ana",
      last_name: "Ruiz",
      role: "client",
      is_active: true,
      is_approved: true,
      created_at: "2026-01-01T00:00:00Z",
      date_joined: "2026-01-01T00:00:00Z",
    },
    {
      id: "u2",
      email: "b@test.com",
      username: "b",
      first_name: "Beto",
      last_name: "Lopez",
      role: "client",
      is_active: true,
      is_approved: true,
      created_at: "2026-02-15T00:00:00Z",
      date_joined: "2026-02-15T00:00:00Z",
    },
  ];

  it("builds recent users sorted by most recently created", () => {
    const result = buildRecentUsers(users, 1);
    expect(result).toEqual([{ id: "u2", name: "Beto Lopez", role: "client", createdAt: "2026-02-15T00:00:00Z" }]);
  });

  it("counts new users created since a given date", () => {
    expect(countNewUsersSince(users, new Date("2026-02-01T00:00:00Z"))).toBe(1);
    expect(countNewUsersSince(users, new Date("2025-12-01T00:00:00Z"))).toBe(2);
  });
});
