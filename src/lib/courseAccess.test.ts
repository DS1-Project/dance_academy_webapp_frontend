import { describe, expect, it } from "vitest";
import { canManageCourse } from "@/lib/courseAccess";

describe("canManageCourse", () => {
  const course = { main_teacher: { id: "t1", email: "t@x.com", first_name: "A", last_name: "B" } };

  it("allows the owning teacher", () => {
    expect(canManageCourse({ id: "t1", role: "profesor" }, course)).toBe(true);
  });

  it("allows admin and director", () => {
    expect(canManageCourse({ id: "x", role: "admin" }, course)).toBe(true);
    expect(canManageCourse({ id: "x", role: "director" }, course)).toBe(true);
  });

  it("blocks other teachers and clients", () => {
    expect(canManageCourse({ id: "t2", role: "profesor" }, course)).toBe(false);
    expect(canManageCourse({ id: "c1", role: "cliente" }, course)).toBe(false);
    expect(canManageCourse(null, course)).toBe(false);
  });
});
