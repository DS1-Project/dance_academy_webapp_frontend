import { describe, expect, it } from "vitest";
import { canLeaveReview, canViewReviewsSection } from "@/lib/reviewAccess";

describe("canLeaveReview", () => {
  it("allows only purchased clients", () => {
    expect(canLeaveReview("cliente", true)).toBe(true);
  });

  it("blocks staff and non-buyers", () => {
    expect(canLeaveReview("admin", true)).toBe(false);
    expect(canLeaveReview("director", true)).toBe(false);
    expect(canLeaveReview("profesor", true)).toBe(false);
    expect(canLeaveReview("cliente", false)).toBe(false);
    expect(canLeaveReview(null, true)).toBe(false);
  });
});

describe("canViewReviewsSection", () => {
  it("hides reviews for staff roles", () => {
    expect(canViewReviewsSection("admin")).toBe(false);
    expect(canViewReviewsSection("director")).toBe(false);
    expect(canViewReviewsSection("profesor")).toBe(false);
  });

  it("shows reviews for clients and guests", () => {
    expect(canViewReviewsSection("cliente")).toBe(true);
    expect(canViewReviewsSection(null)).toBe(true);
  });
});
