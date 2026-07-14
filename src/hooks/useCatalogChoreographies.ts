import { useCallback, useEffect, useState } from "react";
import { mapBackendChoreographyToCard } from "@/lib/choreographyMapper";
import { getApiErrorMessage } from "@/lib/api";
import { listChoreographies, listDanceStyles } from "@/services/choreographyService";
import type { BackendChoreography, DanceStyle } from "@/types/backend";
import type { Choreography } from "@/lib/mock-data";

export function useCatalogChoreographies() {
  const [items, setItems] = useState<Choreography[]>([]);
  const [backendItems, setBackendItems] = useState<BackendChoreography[]>([]);
  const [styles, setStyles] = useState<DanceStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [choreographiesResult, stylesResult] = await Promise.allSettled([
        listChoreographies(),
        listDanceStyles(),
      ]);

      if (choreographiesResult.status === "rejected") {
        throw choreographiesResult.reason;
      }

      const raw = choreographiesResult.value;
      setBackendItems(raw);
      setItems(raw.map((item, index) => mapBackendChoreographyToCard(item, index)));

      if (stylesResult.status === "fulfilled") {
        setStyles(stylesResult.value);
      } else {
        const fallbackStyles = [...new Set(raw.map((item) => {
          if (!item.dance_style) return null;
          if (typeof item.dance_style === "string") {
            return { id: item.dance_style, name: item.dance_style };
          }
          return item.dance_style;
        }).filter(Boolean))] as DanceStyle[];
        setStyles(fallbackStyles.sort((a, b) => a.name.localeCompare(b.name, "es")));
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo cargar el catálogo"));
      setItems([]);
      setBackendItems([]);
      setStyles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { items, backendItems, styles, loading, error, reload: load };
}
