import { describe, expect, it } from "vitest";
import {
  buildBillingAddress,
  buildCreateSalePayload,
  validateBillingDetails,
  validateBuyerDetails,
  validatePaymentDetails,
} from "@/lib/checkoutForm";

describe("checkoutForm", () => {
  it("validates buyer details", () => {
    expect(validateBuyerDetails({ name: "", email: "a@b.com", phone: "" })).toMatch(/nombre/i);
    expect(validateBuyerDetails({ name: "Ana", email: "bad", phone: "" })).toMatch(/válido/i);
    expect(validateBuyerDetails({ name: "Ana", email: "a@b.com", phone: "" })).toBeNull();
  });

  it("validates billing details requiring address and city", () => {
    expect(validateBillingDetails({ documentId: "", address: "", city: "Bogotá", country: "Colombia" })).toMatch(
      /dirección/i
    );
    expect(validateBillingDetails({ documentId: "", address: "Calle 1", city: "", country: "Colombia" })).toMatch(
      /ciudad/i
    );
    expect(
      validateBillingDetails({ documentId: "", address: "Calle 1", city: "Bogotá", country: "Colombia" })
    ).toBeNull();
  });

  it("validates payment details requiring method and card fields", () => {
    expect(validatePaymentDetails({ method: "", cardNumber: "4111", expiry: "12/28", cvv: "123" })).toMatch(
      /método/i
    );
    expect(
      validatePaymentDetails({ method: "Tarjeta de Crédito", cardNumber: "", expiry: "12/28", cvv: "123" })
    ).toMatch(/tarjeta/i);
    expect(
      validatePaymentDetails({ method: "Tarjeta de Crédito", cardNumber: "4111111111111111", expiry: "12/28", cvv: "123" })
    ).toBeNull();
  });

  it("builds a billing address string joining non-empty parts", () => {
    expect(buildBillingAddress({ documentId: "1", address: "Calle 1", city: "Bogotá", country: "Colombia" })).toBe(
      "Calle 1, Bogotá, Colombia"
    );
    expect(buildBillingAddress({ documentId: "1", address: "Calle 1", city: "", country: "" })).toBe("Calle 1");
  });

  it("builds the create sale payload with choreography ids and billing address", () => {
    const payload = buildCreateSalePayload(["id-1", "id-2"], {
      documentId: "1",
      address: "Calle 1",
      city: "Bogotá",
      country: "Colombia",
    });
    expect(payload).toEqual({
      choreography_ids: ["id-1", "id-2"],
      billing_address: "Calle 1, Bogotá, Colombia",
    });
  });
});
