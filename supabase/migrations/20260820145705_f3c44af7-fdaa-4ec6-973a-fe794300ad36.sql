-- Reduce the public SECURITY DEFINER surface to the strict minimum needed by the guest booking flow.

-- 1) Staff-only reads of reservations happen through RLS, so signed-in staff never need the guest helpers.
REVOKE EXECUTE ON FUNCTION public.create_public_reservation(jsonb, jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_reservation(text, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.available_vehicle_ids(timestamptz, timestamptz) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.vehicle_busy_ranges(uuid) FROM authenticated;

-- 2) Availability helpers must not leak anything beyond dates/ids.
CREATE OR REPLACE FUNCTION public.vehicle_busy_ranges(_vehicle_id uuid)
RETURNS TABLE(start_at timestamptz, end_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT r.start_at, r.end_at FROM public.reservations r
  WHERE r.vehicle_id = _vehicle_id
    AND r.status IN ('pending','confirmed','ongoing')
    AND r.end_at >= now() - interval '1 day';
$$;

-- 3) Guest receipt lookup: only return non-sensitive fields, and require a valid reference + matching email.
CREATE OR REPLACE FUNCTION public.get_public_reservation(_reference text, _email text)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'id', r.id,
    'reference', r.reference,
    'receipt_number', r.receipt_number,
    'first_name', r.first_name,
    'last_name', r.last_name,
    'email', r.email,
    'phone', r.phone,
    'pickup_location', r.pickup_location,
    'dropoff_location', r.dropoff_location,
    'start_at', r.start_at,
    'end_at', r.end_at,
    'days', r.days,
    'daily_rate', r.daily_rate,
    'options_total', r.options_total,
    'total', r.total,
    'status', r.status,
    'created_at', r.created_at,
    'confirmed_at', r.confirmed_at,
    'cancelled_at', r.cancelled_at,
    'cancellation_reason', r.cancellation_reason,
    'vehicles', (
      SELECT jsonb_build_object('id', v.id, 'brand', v.brand, 'model', v.model, 'images', v.images, 'category', v.category)
      FROM public.vehicles v WHERE v.id = r.vehicle_id
    )
  )
  FROM public.reservations r
  WHERE length(coalesce(_reference,'')) >= 6
    AND length(coalesce(_email,'')) >= 5
    AND r.reference = _reference
    AND lower(r.email) = lower(_email)
  LIMIT 1;
$$;

-- 4) Guest booking: validate input server-side, force guest ownership and pending status.
CREATE OR REPLACE FUNCTION public.create_public_reservation(_payload jsonb, _options jsonb DEFAULT '[]'::jsonb)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  _id uuid;
  _reference text;
  _opt jsonb;
  _start timestamptz := (_payload->>'start_at')::timestamptz;
  _end timestamptz := (_payload->>'end_at')::timestamptz;
  _vehicle_id uuid := (_payload->>'vehicle_id')::uuid;
  _email text := lower(trim(_payload->>'email'));
  _days int;
  _rate numeric;
  _options_total numeric := 0;
begin
  if _vehicle_id is null or _start is null or _end is null then
    raise exception 'Invalid reservation request';
  end if;
  if _end <= _start or _start < now() - interval '1 day' or _start > now() + interval '2 years' then
    raise exception 'Invalid reservation dates';
  end if;
  if _email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(_email) > 254 then
    raise exception 'Invalid email address';
  end if;
  if coalesce(trim(_payload->>'first_name'),'') = '' or coalesce(trim(_payload->>'last_name'),'') = ''
     or coalesce(trim(_payload->>'phone'),'') = '' then
    raise exception 'Missing contact details';
  end if;

  -- Price and duration are derived server-side, never trusted from the client.
  select v.daily_price into _rate from public.vehicles v
  where v.id = _vehicle_id and v.status = 'available';
  if _rate is null then
    raise exception 'Vehicle unavailable';
  end if;
  _days := greatest(1, ceil(extract(epoch from (_end - _start)) / 86400)::int);

  for _opt in select * from jsonb_array_elements(coalesce(_options, '[]'::jsonb))
  loop
    _options_total := _options_total + coalesce((
      select o.price_per_day from public.rental_options o
      where o.id = nullif(_opt->>'option_id','')::uuid and o.active
    ), 0) * _days;
  end loop;

  insert into public.reservations (
    user_id, vehicle_id, first_name, last_name, email, phone, address, license_number,
    pickup_location, dropoff_location, start_at, end_at, days, daily_rate, options_total, total, status
  ) values (
    null,
    _vehicle_id,
    left(trim(_payload->>'first_name'), 80),
    left(trim(_payload->>'last_name'), 80),
    _email,
    left(trim(_payload->>'phone'), 40),
    left(nullif(trim(_payload->>'address'),''), 200),
    left(nullif(trim(_payload->>'license_number'),''), 60),
    left(trim(_payload->>'pickup_location'), 120),
    left(trim(_payload->>'dropoff_location'), 120),
    _start,
    _end,
    _days,
    _rate,
    _options_total,
    (_rate * _days) + _options_total,
    'pending'
  )
  returning id, reference into _id, _reference;

  for _opt in select * from jsonb_array_elements(coalesce(_options, '[]'::jsonb))
  loop
    insert into public.reservation_options (reservation_id, option_id, name, price_per_day)
    select _id, o.id, o.name, o.price_per_day
    from public.rental_options o
    where o.id = nullif(_opt->>'option_id','')::uuid and o.active;
  end loop;

  return _reference;
end;
$$;

-- Keep the guest endpoints reachable only by anonymous visitors (plus service role).
REVOKE ALL ON FUNCTION public.create_public_reservation(jsonb, jsonb) FROM PUBLIC, authenticated;
REVOKE ALL ON FUNCTION public.get_public_reservation(text, text) FROM PUBLIC, authenticated;
REVOKE ALL ON FUNCTION public.vehicle_busy_ranges(uuid) FROM PUBLIC, authenticated;
REVOKE ALL ON FUNCTION public.available_vehicle_ids(timestamptz, timestamptz) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.create_public_reservation(jsonb, jsonb) TO anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_reservation(text, text) TO anon, service_role;
GRANT EXECUTE ON FUNCTION public.vehicle_busy_ranges(uuid) TO anon, service_role;
GRANT EXECUTE ON FUNCTION public.available_vehicle_ids(timestamptz, timestamptz) TO anon, service_role;