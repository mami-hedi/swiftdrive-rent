CREATE SEQUENCE IF NOT EXISTS public.receipt_seq START 1;

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS receipt_number text;

CREATE OR REPLACE FUNCTION public.next_receipt_number()
RETURNS text
LANGUAGE sql
VOLATILE
SET search_path TO 'public'
AS $$
  SELECT 'REC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.receipt_seq')::text, 6, '0');
$$;

UPDATE public.reservations SET receipt_number = public.next_receipt_number() WHERE receipt_number IS NULL;

ALTER TABLE public.reservations ALTER COLUMN receipt_number SET DEFAULT public.next_receipt_number();
ALTER TABLE public.reservations ALTER COLUMN receipt_number SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS reservations_receipt_number_key ON public.reservations (receipt_number);