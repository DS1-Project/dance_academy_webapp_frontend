import { describe, expect, it } from "vitest";
import { roleRequiresApproval } from "@/lib/userRoleOptions";

describe("userRoleOptions", () => {
  it("only non-client roles require approval", () => {
    expect(roleRequiresApproval("client")).toBe(false);
    expect(roleRequiresApproval("teacher")).toBe(true);
    expect(roleRequiresApproval("admin")).toBe(true);
    expect(roleRequiresApproval("director")).toBe(true);
  });
});
