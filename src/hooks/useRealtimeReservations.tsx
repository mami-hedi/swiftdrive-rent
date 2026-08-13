import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Souscrit aux changements temps réel de la table reservations (et vehicles)
 * et rafraîchit les caches TanStack Query concernés.
 */
export function useRealtimeReservations(onChange?: (payload: { new: Record<string, unknown> | null; old: Record<string, unknown> | null; eventType: string }) => void) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("reservations-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, (payload) => {
        queryClient.invalidateQueries({ queryKey: ["all-reservations"] });
        queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
        queryClient.invalidateQueries({ queryKey: ["busy-ranges"] });
        queryClient.invalidateQueries({ queryKey: ["available-ids"] });
        onChange?.({
          new: (payload.new as Record<string, unknown>) ?? null,
          old: (payload.old as Record<string, unknown>) ?? null,
          eventType: payload.eventType,
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "vehicles" }, () => {
        queryClient.invalidateQueries({ queryKey: ["vehicles"] });
        queryClient.invalidateQueries({ queryKey: ["vehicle"] });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient]);
}
