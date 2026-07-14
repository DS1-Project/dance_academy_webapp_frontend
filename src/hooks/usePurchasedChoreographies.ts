import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import { getPurchasedChoreographies } from "@/services/choreographyService";
import type { BackendChoreography } from "@/types/backend";

/** Coreografías ya adquiridas por el cliente autenticado, con sus videos y URLs. */
export function usePurchasedChoreographies() {
  const [choreographies, setChoreographies] = useState<BackendChoreography[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPurchasedChoreographies();
      setChoreographies(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudieron cargar tus coreografías compradas"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { choreographies, isLoading, error, reload: load };
}
