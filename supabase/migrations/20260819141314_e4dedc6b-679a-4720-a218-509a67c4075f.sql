CREATE TABLE public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  entity_label text,
  old_value text,
  new_value text,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit logs staff read" ON public.audit_logs
FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs (created_at DESC);
CREATE INDEX audit_logs_entity_idx ON public.audit_logs (entity_type, entity_id);

CREATE OR REPLACE FUNCTION public.log_reservation_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
BEGIN
  SELECT email INTO _email FROM public.profiles WHERE id = auth.uid();

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (actor_id, actor_email, action, entity_type, entity_id, entity_label, new_value)
    VALUES (auth.uid(), _email, 'reservation.created', 'reservation', NEW.id, NEW.reference, NEW.status::text);
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.audit_logs (actor_id, actor_email, action, entity_type, entity_id, entity_label, old_value, new_value, reason)
    VALUES (auth.uid(), _email, 'reservation.' || NEW.status::text, 'reservation', NEW.id, NEW.reference,
            OLD.status::text, NEW.status::text,
            CASE WHEN NEW.status = 'cancelled' THEN NEW.cancellation_reason ELSE NULL END);
  END IF;
  RETURN NEW;
END; $$;

REVOKE EXECUTE ON FUNCTION public.log_reservation_changes() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER reservations_audit_ins
AFTER INSERT ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.log_reservation_changes();

CREATE TRIGGER reservations_audit_upd
AFTER UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.log_reservation_changes();

CREATE OR REPLACE FUNCTION public.log_vehicle_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
  _label text;
BEGIN
  SELECT email INTO _email FROM public.profiles WHERE id = auth.uid();
  IF TG_OP = 'DELETE' THEN
    _label := OLD.brand || ' ' || OLD.model;
    INSERT INTO public.audit_logs (actor_id, actor_email, action, entity_type, entity_id, entity_label)
    VALUES (auth.uid(), _email, 'vehicle.deleted', 'vehicle', OLD.id, _label);
    RETURN OLD;
  END IF;
  _label := NEW.brand || ' ' || NEW.model;
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (actor_id, actor_email, action, entity_type, entity_id, entity_label, new_value)
    VALUES (auth.uid(), _email, 'vehicle.created', 'vehicle', NEW.id, _label, NEW.status::text);
  ELSIF NEW.status IS DISTINCT FROM OLD.status OR NEW.daily_price IS DISTINCT FROM OLD.daily_price THEN
    INSERT INTO public.audit_logs (actor_id, actor_email, action, entity_type, entity_id, entity_label, old_value, new_value)
    VALUES (auth.uid(), _email, 'vehicle.updated', 'vehicle', NEW.id, _label,
            OLD.status::text || ' / ' || OLD.daily_price::text,
            NEW.status::text || ' / ' || NEW.daily_price::text);
  END IF;
  RETURN NEW;
END; $$;

REVOKE EXECUTE ON FUNCTION public.log_vehicle_changes() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER vehicles_audit
AFTER INSERT OR UPDATE OR DELETE ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION public.log_vehicle_changes();

ALTER TABLE public.audit_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;