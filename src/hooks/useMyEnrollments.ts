import { useEffect, useState, useCallback } from "react";
import { getMyEnrollments } from "@/services/salesService";
import { getChoreographyDetail } from "@/services/choreographyService";
import { getApiErrorMessage } from "@/lib/api";
import type { BackendEnrollment, BackendChoreography } from "@/types/backend";

export interface EnrichedEnrollment extends BackendEnrollment {
  detail?: BackendChoreography;
  detailError?: string;
}

/**
 * Obtiene los enrollments del cliente y enriquece cada uno con el detalle
 * de la coreografía (que incluye los video_url de las clases).
 */
export function useMyEnrollments() {
  const [enrollments, setEnrollments] = useState<EnrichedEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await getMyEnrollments();
      setEnrollments(list.map((e) => ({ ...e })));

      // Cargar detalles en paralelo (no bloquea la UI si alguno falla)
      const details = await Promise.allSettled(
        list.map((e) => getChoreographyDetail(e.choreography))
      );

      setEnrollments(
        list.map((e, i) => {
          const res = details[i];
          if (res.status === "fulfilled") return { ...e, detail: res.value };
          return { ...e, detailError: getApiErrorMessage(res.reason, "No se pudo cargar el detalle") };
        })
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudieron cargar tus cursos"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { enrollments, isLoading, error, reload: load };
}