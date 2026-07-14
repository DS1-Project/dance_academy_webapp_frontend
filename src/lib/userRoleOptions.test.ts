import { describe, expect, it } from "vitest";
import { REGISTER_ROLE_OPTIONS, roleRequiresApproval } from "@/lib/userRoleOptions";

describe("userRoleOptions", () => {
  it("only offers client and teacher on public register", () => {
    expect(REGISTER_ROLE_OPTIONS.map((option) => option.value)).toEqual(["client", "teacher"]);
  });

  it("only non-client roles require approval", () => {
    expect(roleRequiresApproval("client")).toBe(false);
    expect(roleRequiresApproval("teacher")).toBe(true);
    expect(roleRequiresApproval("admin")).toBe(true);
    expect(roleRequiresApproval("director")).toBe(true);
  });
});
