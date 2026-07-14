import { describe, expect, it } from "vitest";
import { firstError, required, validateEmail, validatePassword } from "@/lib/formValidation";

/** Mirrors Login captcha resolution without mounting ReCAPTCHA. */
export function resolveCaptchaToken(
  widgetToken: string | null,
  isDev: boolean,
  devToken = "dev-bypass"
): string | null {
  if (widgetToken) return widgetToken;
  if (isDev) return devToken;
  return null;
}

describe("login captcha + profile validation helpers", () => {
  it("requires captcha token in production", () => {
    expect(resolveCaptchaToken(null, false)).toBeNull();
    expect(resolveCaptchaToken("tok-1", false)).toBe("tok-1");
  });

  it("allows dev bypass when widget is empty", () => {
    expect(resolveCaptchaToken(null, true, "dev-bypass")).toBe("dev-bypass");
  });

  it("validates profile name fields", () => {
    expect(firstError(required("", "El nombre"), required("Pérez", "El apellido"))).toMatch(
      /nombre/i
    );
    expect(firstError(required("Ana", "El nombre"), required("Pérez", "El apellido"))).toBeNull();
  });

  it("validates create-user credentials", () => {
    expect(validateEmail("admin@dance.com")).toBeNull();
    expect(validatePassword("short")).toMatch(/al menos/i);
  });
});
