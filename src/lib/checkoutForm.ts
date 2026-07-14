import {
  firstError,
  required,
  validateCardNumber,
  validateCvv,
  validateEmail,
  validatePhone,
} from "@/lib/formValidation";

export interface BuyerDetails {
  name: string;
  email: string;
  phone: string;
}

export interface BillingDetails {
  documentId: string;
  address: string;
  city: string;
  country: string;
}

export interface PaymentDetails {
  method: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export interface CreateSalePayload {
  choreography_ids: string[];
  billing_address: string;
}

export function validateBuyerDetails(values: BuyerDetails): string | null {
  return firstError(
    required(values.name, "El nombre"),
    validateEmail(values.email),
    validatePhone(values.phone)
  );
}

export function validateBillingDetails(values: BillingDetails): string | null {
  return firstError(
    required(values.documentId, "El documento"),
    required(values.address, "La dirección"),
    required(values.city, "La ciudad"),
    required(values.country, "El país")
  );
}

export function validatePaymentDetails(values: PaymentDetails): string | null {
  return firstError(
    required(values.method, "El método de pago"),
    validateCardNumber(values.cardNumber),
    required(values.expiry, "La fecha de vencimiento"),
    validateCvv(values.cvv)
  );
}

export function buildBillingAddress(billing: BillingDetails): string {
  const parts = [billing.address, billing.city, billing.country].map((p) => p.trim()).filter(Boolean);
  return parts.join(", ");
}

export function buildCreateSalePayload(
  choreographyIds: string[],
  billing: BillingDetails
): CreateSalePayload {
  return {
    choreography_ids: choreographyIds,
    billing_address: buildBillingAddress(billing),
  };
}
