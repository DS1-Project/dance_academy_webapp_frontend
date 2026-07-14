import { describe, expect, it } from "vitest";
import {
  firstError,
  required,
  validateEmail,
  validateMinVideos,
  validatePassword,
  validatePasswordMatch,
  validateHttpUrl,
} from "@/lib/formValidation";

describe("formValidation", () => {
  it("validates required and email", () => {
    expect(required("  ")).toMatch(/obligatorio/i);
    expect(validateEmail("bad")).toMatch(/válido/i);
    expect(validateEmail("a@b.com")).toBeNull();
  });

  it("validates password rules", () => {
    expect(validatePassword("123")).toMatch(/al menos/i);
    expect(validatePassword("12345678")).toBeNull();
    expect(validatePasswordMatch("abc", "xyz")).toMatch(/coinciden/i);
  });

  it("validates videos and urls", () => {
    expect(validateMinVideos(0)).toMatch(/al menos/i);
    expect(validateMinVideos(2)).toBeNull();
    expect(validateHttpUrl("notaurl")).toMatch(/válida/i);
    expect(validateHttpUrl("https://cdn.example.com/v.mp4")).toBeNull();
  });

  it("returns first error", () => {
    expect(firstError(null, "uno", "dos")).toBe("uno");
    expect(firstError(null, null)).toBeNull();
  });
});
