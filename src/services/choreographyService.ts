import { api } from "@/lib/api";
import type { BackendChoreography } from "@/types/backend";

/** GET /api/coreografias/{uuid}/ — devuelve el detalle de una coreografía (incluye videos si el backend los serializa). */
export async function getChoreographyDetail(id: string): Promise<BackendChoreography> {
  const { data } = await api.get<BackendChoreography>(`/api/coreografias/${id}/`);
  return data;
}