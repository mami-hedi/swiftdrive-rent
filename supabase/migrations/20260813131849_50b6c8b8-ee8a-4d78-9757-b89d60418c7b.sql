ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_by uuid,
  ADD COLUMN IF NOT EXISTS cancellation_reason text;

CREATE OR REPLACE FUNCTION public.track_reservation_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'confirmed' AND NEW.confirmed_at IS NULL THEN
      NEW.confirmed_at = now();
    END IF;
    IF NEW.status = 'cancelled' THEN
      IF NEW.cancelled_at IS NULL THEN NEW.cancelled_at = now(); END IF;
      IF NEW.cancelled_by IS NULL THEN NEW.cancelled_by = auth.uid(); END IF;
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS reservations_status_tracking ON public.reservations;
CREATE TRIGGER reservations_status_tracking
BEFORE UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.track_reservation_status();

ALTER TABLE public.reservations REPLICA IDENTITY FULL;
ALTER TABLE public.vehicles REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='reservations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='vehicles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
  END IF;
END $$;