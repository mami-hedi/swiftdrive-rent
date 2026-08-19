
create or replace function public.create_public_reservation(_payload jsonb, _options jsonb default '[]'::jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  _id uuid;
  _reference text;
  _opt jsonb;
begin
  insert into public.reservations (
    user_id, vehicle_id, first_name, last_name, email, phone, address, license_number,
    pickup_location, dropoff_location, start_at, end_at, days, daily_rate, options_total, total
  ) values (
    null,
    (_payload->>'vehicle_id')::uuid,
    _payload->>'first_name',
    _payload->>'last_name',
    _payload->>'email',
    _payload->>'phone',
    nullif(_payload->>'address',''),
    nullif(_payload->>'license_number',''),
    _payload->>'pickup_location',
    _payload->>'dropoff_location',
    (_payload->>'start_at')::timestamptz,
    (_payload->>'end_at')::timestamptz,
    (_payload->>'days')::int,
    (_payload->>'daily_rate')::numeric,
    coalesce((_payload->>'options_total')::numeric, 0),
    (_payload->>'total')::numeric
  )
  returning id, reference into _id, _reference;

  for _opt in select * from jsonb_array_elements(coalesce(_options, '[]'::jsonb))
  loop
    insert into public.reservation_options (reservation_id, option_id, name, price_per_day)
    values (_id, nullif(_opt->>'option_id','')::uuid, _opt->>'name', (_opt->>'price_per_day')::numeric);
  end loop;

  return _reference;
end;
$$;

revoke all on function public.create_public_reservation(jsonb, jsonb) from public;
grant execute on function public.create_public_reservation(jsonb, jsonb) to anon, authenticated;

create or replace function public.get_public_reservation(_reference text, _email text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select to_jsonb(r) || jsonb_build_object(
    'vehicles',
    (select jsonb_build_object('id', v.id, 'brand', v.brand, 'model', v.model, 'images', v.images, 'category', v.category)
     from public.vehicles v where v.id = r.vehicle_id)
  )
  from public.reservations r
  where r.reference = _reference
    and lower(r.email) = lower(_email)
  limit 1;
$$;

revoke all on function public.get_public_reservation(text, text) from public;
grant execute on function public.get_public_reservation(text, text) to anon, authenticated;
