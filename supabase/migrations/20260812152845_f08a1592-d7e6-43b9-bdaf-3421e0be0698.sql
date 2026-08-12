
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE public.app_role AS ENUM ('admin','manager','client');
CREATE TYPE public.reservation_status AS ENUM ('pending','confirmed','ongoing','completed','cancelled');
CREATE TYPE public.vehicle_status AS ENUM ('available','rented','maintenance','disabled');

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  email text,
  phone text,
  address text,
  license_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','manager'));
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "profiles select" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid())) WITH CHECK (id = auth.uid() OR public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- LOCATIONS
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.locations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.locations TO authenticated;
GRANT ALL ON public.locations TO service_role;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "locations public read" ON public.locations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "locations staff manage" ON public.locations FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- VEHICLES
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  model text NOT NULL,
  year int NOT NULL,
  category text NOT NULL,
  transmission text NOT NULL,
  fuel text NOT NULL,
  seats int NOT NULL DEFAULT 5,
  doors int NOT NULL DEFAULT 5,
  luggage int NOT NULL DEFAULT 2,
  mileage int NOT NULL DEFAULT 0,
  daily_price numeric(10,2) NOT NULL,
  weekly_price numeric(10,2),
  monthly_price numeric(10,2),
  description text,
  features text[] NOT NULL DEFAULT '{}',
  images text[] NOT NULL DEFAULT '{}',
  status public.vehicle_status NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vehicles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicles public read" ON public.vehicles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "vehicles staff manage" ON public.vehicles FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER vehicles_updated BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SEASONAL RATES
CREATE TABLE public.seasonal_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  daily_price numeric(10,2),
  multiplier numeric(5,2) NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.seasonal_rates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.seasonal_rates TO authenticated;
GRANT ALL ON public.seasonal_rates TO service_role;
ALTER TABLE public.seasonal_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rates public read" ON public.seasonal_rates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "rates staff manage" ON public.seasonal_rates FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- RENTAL OPTIONS
CREATE TABLE public.rental_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_per_day numeric(10,2) NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rental_options TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.rental_options TO authenticated;
GRANT ALL ON public.rental_options TO service_role;
ALTER TABLE public.rental_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "options public read" ON public.rental_options FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "options staff manage" ON public.rental_options FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- RESERVATIONS
CREATE SEQUENCE public.reservation_seq START 1000;
CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT ('RES-' || nextval('public.reservation_seq')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text,
  license_number text,
  pickup_location text NOT NULL,
  dropoff_location text NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  days int NOT NULL,
  daily_rate numeric(10,2) NOT NULL,
  options_total numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL,
  status public.reservation_status NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reservations_dates_valid CHECK (end_at > start_at),
  CONSTRAINT reservations_no_overlap EXCLUDE USING gist (
    vehicle_id WITH =, tstzrange(start_at, end_at) WITH &&
  ) WHERE (status IN ('pending','confirmed','ongoing'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reservations select own or staff" ON public.reservations FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "reservations insert own" ON public.reservations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "reservations update own or staff" ON public.reservations FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid())) WITH CHECK (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "reservations delete staff" ON public.reservations FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER reservations_updated BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.reservation_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  option_id uuid REFERENCES public.rental_options(id) ON DELETE SET NULL,
  name text NOT NULL,
  price_per_day numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservation_options TO authenticated;
GRANT ALL ON public.reservation_options TO service_role;
ALTER TABLE public.reservation_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "res options access" ON public.reservation_options FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.reservations r WHERE r.id = reservation_id AND (r.user_id = auth.uid() OR public.is_staff(auth.uid()))))
WITH CHECK (EXISTS (SELECT 1 FROM public.reservations r WHERE r.id = reservation_id AND (r.user_id = auth.uid() OR public.is_staff(auth.uid()))));

-- CONTACT MESSAGES
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  handled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can send message" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "staff read messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff manage messages" ON public.contact_messages FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- SETTINGS
CREATE TABLE public.settings (
  id int PRIMARY KEY DEFAULT 1,
  company_name text NOT NULL DEFAULT 'Velora Rent',
  logo_url text,
  phone text,
  email text,
  address text,
  currency text NOT NULL DEFAULT 'EUR',
  vat_rate numeric(5,2) NOT NULL DEFAULT 20,
  terms text,
  opening_hours text,
  facebook text,
  instagram text,
  linkedin text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT settings_singleton CHECK (id = 1)
);
GRANT SELECT ON public.settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings staff manage" ON public.settings FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- PUBLIC AVAILABILITY HELPERS
CREATE OR REPLACE FUNCTION public.vehicle_busy_ranges(_vehicle_id uuid)
RETURNS TABLE (start_at timestamptz, end_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.start_at, r.end_at FROM public.reservations r
  WHERE r.vehicle_id = _vehicle_id AND r.status IN ('pending','confirmed','ongoing') AND r.end_at >= now() - interval '1 day';
$$;

CREATE OR REPLACE FUNCTION public.available_vehicle_ids(_start timestamptz, _end timestamptz)
RETURNS TABLE (vehicle_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT v.id FROM public.vehicles v
  WHERE v.status = 'available'
  AND NOT EXISTS (
    SELECT 1 FROM public.reservations r
    WHERE r.vehicle_id = v.id AND r.status IN ('pending','confirmed','ongoing')
    AND tstzrange(r.start_at, r.end_at) && tstzrange(_start, _end)
  );
$$;
GRANT EXECUTE ON FUNCTION public.vehicle_busy_ranges(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.available_vehicle_ids(timestamptz, timestamptz) TO anon, authenticated;

-- SEED
INSERT INTO public.settings (id, company_name, phone, email, address, opening_hours, terms)
VALUES (1, 'Velora Rent', '+33 1 84 60 22 10', 'contact@velora-rent.fr', '18 Avenue des Champs, 75008 Paris', 'Lun-Ven 8h-20h · Sam 9h-18h · Dim 10h-16h', 'Le locataire doit être âgé de 21 ans minimum et détenir un permis de conduire valide depuis au moins 2 ans.');

INSERT INTO public.locations (name, address) VALUES
('Paris Centre', '18 Avenue des Champs, 75008 Paris'),
('Aéroport Charles de Gaulle', 'Terminal 2E, 95700 Roissy'),
('Aéroport Orly', 'Terminal 3, 94390 Orly'),
('Lyon Part-Dieu', '5 Place Charles Béraudier, 69003 Lyon'),
('Marseille Saint-Charles', 'Square Narvik, 13001 Marseille'),
('Nice Côte d''Azur', 'Terminal 1, 06206 Nice');

INSERT INTO public.rental_options (name, description, price_per_day) VALUES
('GPS', 'Navigation GPS dernière génération', 5),
('Siège bébé', 'Siège homologué 0-4 ans', 7),
('Conducteur supplémentaire', 'Ajoutez un second conducteur', 10),
('Assurance premium', 'Franchise réduite à 0 €', 15);

INSERT INTO public.vehicles (brand, model, year, category, transmission, fuel, seats, doors, luggage, mileage, daily_price, weekly_price, monthly_price, description, features, images, status) VALUES
('BMW','Série 3',2024,'Berline','Automatique','Diesel',5,5,3,12000,89,540,1750,'Berline sportive et confortable, idéale pour les longs trajets comme pour la ville.','{"Climatisation","GPS","Bluetooth","Caméra de recul","Régulateur adaptatif"}','{"/images/cars/bmw-3.jpg"}','available'),
('Mercedes','Classe C',2024,'Berline','Automatique','Hybride',5,5,3,8000,95,580,1850,'Élégance allemande, finitions haut de gamme et motorisation hybride sobre.','{"Climatisation bi-zone","GPS","Bluetooth","Sièges chauffants"}','{"/images/cars/mercedes-c.jpg"}','available'),
('Audi','A4',2023,'Berline','Automatique','Diesel',5,5,3,21000,85,510,1690,'Une routière raffinée avec un excellent rapport confort/consommation.','{"Climatisation","GPS","Bluetooth","Apple CarPlay"}','{"/images/cars/audi-a4.jpg"}','available'),
('Volkswagen','Golf',2023,'Compacte','Manuelle','Essence',5,5,2,30000,55,330,1090,'La compacte polyvalente par excellence, agile et économique.','{"Climatisation","Bluetooth","Régulateur de vitesse"}','{"/images/cars/vw-golf.jpg"}','available'),
('Peugeot','208',2024,'Citadine','Automatique','Électrique',5,5,2,9000,49,290,950,'Citadine 100% électrique, parfaite pour la ville avec 340 km d''autonomie.','{"Climatisation","GPS","Bluetooth","Recharge rapide"}','{"/images/cars/peugeot-208.jpg"}','available'),
('Renault','Clio',2023,'Citadine','Manuelle','Essence',5,5,2,27000,42,250,830,'Économique, maniable et confortable pour tous vos déplacements urbains.','{"Climatisation","Bluetooth"}','{"/images/cars/renault-clio.jpg"}','available'),
('Toyota','Corolla',2024,'Compacte','Automatique','Hybride',5,5,3,15000,62,370,1220,'Hybride fiable et très sobre, jusqu''à 4,2 L/100 km.','{"Climatisation","GPS","Bluetooth","Caméra de recul"}','{"/images/cars/toyota-corolla.jpg"}','available'),
('Hyundai','Tucson',2023,'SUV','Automatique','Hybride',5,5,4,24000,78,470,1550,'SUV familial spacieux avec un grand coffre et une position de conduite haute.','{"Climatisation","GPS","Bluetooth","Toit panoramique"}','{"/images/cars/hyundai-tucson.jpg"}','available'),
('Mercedes','GLC',2024,'SUV','Automatique','Diesel',5,5,4,11000,120,720,2400,'SUV premium alliant prestance, confort et technologies embarquées.','{"Climatisation 4 zones","GPS","Bluetooth","Sièges cuir","Hayon électrique"}','{"/images/cars/mercedes-glc.jpg"}','available'),
('BMW','X5',2024,'SUV','Automatique','Hybride',7,5,5,7000,155,930,3100,'Grand SUV 7 places, motorisation hybride rechargeable et équipement complet.','{"Climatisation 4 zones","GPS","Bluetooth","Sièges cuir","Système audio Harman Kardon"}','{"/images/cars/bmw-x5.jpg"}','available');

INSERT INTO public.seasonal_rates (vehicle_id, name, start_date, end_date, multiplier)
SELECT id, 'Haute saison été', '2026-07-01', '2026-08-31', 1.25 FROM public.vehicles;

INSERT INTO public.reservations (vehicle_id, first_name, last_name, email, phone, pickup_location, dropoff_location, start_at, end_at, days, daily_rate, options_total, total, status)
SELECT v.id, x.fn, x.ln, x.em, x.ph, 'Paris Centre', 'Paris Centre', x.s, x.e, x.d, v.daily_price, x.opt, v.daily_price * x.d + x.opt, x.st
FROM (VALUES
  ('BMW','Série 3','Julien','Moreau','julien.moreau@example.com','+33 6 12 34 56 78', now() + interval '3 day', now() + interval '8 day', 5, 25::numeric, 'confirmed'::public.reservation_status),
  ('Renault','Clio','Sarah','Benali','sarah.benali@example.com','+33 6 22 11 09 45', now() + interval '1 day', now() + interval '4 day', 3, 15::numeric, 'pending'::public.reservation_status),
  ('Mercedes','GLC','Thomas','Girard','thomas.girard@example.com','+33 6 55 78 12 30', now() - interval '2 day', now() + interval '2 day', 4, 0::numeric, 'ongoing'::public.reservation_status),
  ('Audi','A4','Camille','Petit','camille.petit@example.com','+33 6 44 90 21 76', now() - interval '20 day', now() - interval '15 day', 5, 35::numeric, 'completed'::public.reservation_status),
  ('Peugeot','208','Marc','Lefevre','marc.lefevre@example.com','+33 6 78 65 43 21', now() - interval '10 day', now() - interval '7 day', 3, 0::numeric, 'cancelled'::public.reservation_status)
) AS x(brand, model, fn, ln, em, ph, s, e, d, opt, st)
JOIN public.vehicles v ON v.brand = x.brand AND v.model = x.model;
