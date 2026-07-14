import { describe, expect, it } from "vitest";
import {
  matchesSelectedRole,
  roleRequiresApproval,
} from "@/lib/userRoleOptions";

describe("userRoleOptions", () => {
  it("only non-client roles require approval", () => {
    expect(roleRequiresApproval("client")).toBe(false);
    expect(roleRequiresApproval("teacher")).toBe(true);
    expect(roleRequiresApproval("admin")).toBe(true);
    expect(roleRequiresApproval("director")).toBe(true);
  });

  it("checks selected login role against backend role", () => {
    expect(matchesSelectedRole("client", "client")).toBe(true);
    expect(matchesSelectedRole("teacher", "client")).toBe(false);
    expect(matchesSelectedRole("admin", undefined)).toBe(false);
  });
});
