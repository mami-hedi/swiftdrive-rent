import { supabase } from "@/integrations/supabase/client";
import type { LocationRow, RentalOption, Reservation, Vehicle } from "@/lib/domain";

export async function fetchVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabase.from("vehicles").select("*").order("daily_price");
  if (error) throw error;
  return (data ?? []) as unknown as Vehicle[];
}

export async function fetchVehicle(id: string): Promise<Vehicle> {
  const { data, error } = await supabase.from("vehicles").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Véhicule introuvable");
  return data as unknown as Vehicle;
}

export async function fetchOptions(): Promise<RentalOption[]> {
  const { data, error } = await supabase.from("rental_options").select("*").order("price_per_day");
  if (error) throw error;
  return (data ?? []) as unknown as RentalOption[];
}

export async function fetchLocations(): Promise<LocationRow[]> {
  const { data, error } = await supabase.from("locations").select("*").eq("active", true).order("name");
  if (error) throw error;
  return (data ?? []) as unknown as LocationRow[];
}

export async function fetchAvailableIds(startIso: string, endIso: string): Promise<string[]> {
  const { data, error } = await supabase.rpc("available_vehicle_ids", { _start: startIso, _end: endIso });
  if (error) throw error;
  return ((data ?? []) as { vehicle_id: string }[]).map((r) => r.vehicle_id);
}

export async function fetchBusyRanges(vehicleId: string) {
  const { data, error } = await supabase.rpc("vehicle_busy_ranges", { _vehicle_id: vehicleId });
  if (error) throw error;
  return (data ?? []) as { start_at: string; end_at: string }[];
}

export async function fetchMyReservations(userId: string): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select("*, vehicles(id, brand, model, images, category)")
    .eq("user_id", userId)
    .order("start_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Reservation[];
}

export async function fetchAllReservations(): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select("*, vehicles(id, brand, model, images, category)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Reservation[];
}

export async function fetchSettings() {
  const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  return data;
}
