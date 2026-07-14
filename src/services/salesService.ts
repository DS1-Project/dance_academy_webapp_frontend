import { api } from "@/lib/api";
import type { BackendEnrollment, BackendSale } from "@/types/backend";

/** GET /api/sales/my-enrollments/ — cursos/coreografías compradas del cliente autenticado. */
export async function getMyEnrollments(): Promise<BackendEnrollment[]> {
  const { data } = await api.get<BackendEnrollment[]>("/api/sales/my-enrollments/");
  return data;
}

/** GET /api/sales/ — historial de ventas del cliente autenticado. */
export async function getMySales(): Promise<BackendSale[]> {
  const { data } = await api.get<BackendSale[]>("/api/sales/");
  return data;
}

/** POST /api/sales/ — crea una venta en estado pending a partir de coreografías del carrito. */
export async function createSale(payload: {
  choreography_ids: string[];
  billing_address: string;
}): Promise<BackendSale> {
  const { data } = await api.post<BackendSale>("/api/sales/", payload);
  return data;
}

/** POST /api/sales/{id}/checkout/ — confirma el pago simulado de la venta. */
export async function checkoutSale(saleId: string, success = true): Promise<BackendSale> {
  const { data } = await api.post<BackendSale>(`/api/sales/${saleId}/checkout/`, { success });
  return data;
}