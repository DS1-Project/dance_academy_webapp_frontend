import { describe, expect, it } from "vitest";
import { canPurchaseCourses } from "@/lib/purchaseAccess";

describe("purchaseAccess", () => {
  it("allows guests and clients to purchase", () => {
    expect(canPurchaseCourses(null)).toBe(true);
    expect(canPurchaseCourses(undefined)).toBe(true);
    expect(canPurchaseCourses("cliente")).toBe(true);
  });

  it("blocks admin, director and teacher from purchasing", () => {
    expect(canPurchaseCourses("admin")).toBe(false);
    expect(canPurchaseCourses("director")).toBe(false);
    expect(canPurchaseCourses("profesor")).toBe(false);
  });
});
