import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import { getPlaybackHistory } from "@/services/choreographyService";
import type { PlaybackHistoryItem } from "@/types/backend";

/** Historial de reproducción de videos del cliente autenticado, más reciente primero. */
export function usePlaybackHistory() {
  const [history, setHistory] = useState<PlaybackHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPlaybackHistory();
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setHistory(sorted);
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo cargar tu historial de reproducción"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { history, isLoading, error, reload: load };
}
