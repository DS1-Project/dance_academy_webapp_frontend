import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "@/lib/api";
import { mapBackendUserToUser } from "@/services/authService";
import type { BackendUser } from "@/types/auth";
import { AxiosError, AxiosHeaders } from "axios";

describe("auth integration helpers", () => {
  it("maps backend roles to frontend roles", () => {
    const backendUser: BackendUser = {
      id: "1",
      email: "client@test.com",
      username: "client",
      first_name: "Laura",
      last_name: "Pérez",
      role: "client",
      is_active: true,
      is_approved: true,
      created_at: "2026-01-01T00:00:00Z",
      date_joined: "2026-01-01T00:00:00Z",
    };

    expect(mapBackendUserToUser(backendUser)).toEqual({
      id: "1",
      email: "client@test.com",
      name: "Laura Pérez",
      role: "cliente",
      isApproved: true,
    });
  });

  it("extracts pending approval message from backend login error", () => {
    const error = new AxiosError(
      "Request failed",
      "400",
      undefined,
      undefined,
      {
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: {
          non_field_errors: [
            "Tu cuenta aún no ha sido aprobada por un administrador.",
          ],
        },
      }
    );

    expect(getApiErrorMessage(error)).toBe(
      "Tu cuenta aún no ha sido aprobada por un administrador."
    );
  });

  it("extracts field validation errors from register response", () => {
    const error = new AxiosError(
      "Request failed",
      "400",
      undefined,
      undefined,
      {
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: {
          password_confirm: ["Las contraseñas no coinciden."],
        },
      }
    );

    expect(getApiErrorMessage(error)).toBe("Las contraseñas no coinciden.");
  });
});
