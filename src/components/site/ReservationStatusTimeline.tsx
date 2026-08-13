import { Check, X } from "lucide-react";
import { STATUS_LABELS, formatDateTime, type ReservationStatus } from "@/lib/domain";
import { cn } from "@/lib/utils";

const FLOW: ReservationStatus[] = ["pending", "confirmed", "ongoing", "completed"];

export function ReservationStatusTimeline({
  status,
  confirmedAt,
  cancelledAt,
  cancellationReason,
}: {
  status: ReservationStatus;
  confirmedAt?: string | null | undefined;
  cancelledAt?: string | null | undefined;
  cancellationReason?: string | null | undefined;
}) {
  if (status === "cancelled") {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-destructive">
          <X className="size-4" /> Réservation annulée
          {cancelledAt ? <span className="font-normal">· {formatDateTime(cancelledAt)}</span> : null}
        </p>
        {cancellationReason ? (
          <p className="mt-1 text-sm text-muted-foreground">Motif : {cancellationReason}</p>
        ) : null}
      </div>
    );
  }

  const current = FLOW.indexOf(status);

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {FLOW.map((s, i) => {
          const reached = i <= current;
          return (
            <li key={s} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border text-[10px]",
                  reached ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted-foreground",
                )}
              >
                {reached ? <Check className="size-3" /> : i + 1}
              </span>
              <span className={cn("text-xs", reached ? "font-medium" : "text-muted-foreground")}>
                {STATUS_LABELS[s]}
              </span>
              {i < FLOW.length - 1 && <span className="hidden h-px w-6 bg-border sm:block" />}
            </li>
          );
        })}
      </ol>
      {status === "confirmed" && confirmedAt ? (
        <p className="mt-3 text-xs text-muted-foreground">Confirmée le {formatDateTime(confirmedAt)}</p>
      ) : null}
      {status === "pending" ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Votre demande est en cours de validation par notre équipe. Vous serez notifié dès sa confirmation.
        </p>
      ) : null}
    </div>
  );
}
