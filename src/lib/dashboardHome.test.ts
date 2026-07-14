import { describe, expect, it } from "vitest";
import { dashboardHomePath } from "@/lib/dashboardHome";

describe("dashboardHomePath", () => {
  it("sends admin and director to the admin hub", () => {
    expect(dashboardHomePath("admin")).toBe("/admin");
    expect(dashboardHomePath("director")).toBe("/admin");
  });

  it("sends other roles to /dashboard", () => {
    expect(dashboardHomePath("profesor")).toBe("/dashboard");
    expect(dashboardHomePath("cliente")).toBe("/dashboard");
    expect(dashboardHomePath(null)).toBe("/dashboard");
  });
});
