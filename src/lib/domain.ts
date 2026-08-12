export type VehicleStatus = "available" | "rented" | "maintenance" | "disabled";
export type ReservationStatus = "pending" | "confirmed" | "ongoing" | "completed" | "cancelled";

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  transmission: string;
  fuel: string;
  seats: number;
  doors: number;
  luggage: number;
  mileage: number;
  daily_price: number;
  weekly_price: number | null;
  monthly_price: number | null;
  description: string | null;
  features: string[];
  images: string[];
  status: VehicleStatus;
  created_at?: string;
}

export interface RentalOption {
  id: string;
  name: string;
  description: string | null;
  price_per_day: number;
  active: boolean;
}

export interface LocationRow {
  id: string;
  name: string;
  address: string | null;
  active: boolean;
}

export interface Reservation {
  id: string;
  reference: string;
  user_id: string | null;
  vehicle_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string | null;
  license_number: string | null;
  pickup_location: string;
  dropoff_location: string;
  start_at: string;
  end_at: string;
  days: number;
  daily_rate: number;
  options_total: number;
  total: number;
  status: ReservationStatus;
  created_at: string;
  vehicles?: Pick<Vehicle, "id" | "brand" | "model" | "images" | "category"> | null;
}

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  ongoing: "En cours",
  completed: "Terminée",
  cancelled: "Annulée",
};

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  available: "Disponible",
  rented: "Louée",
  maintenance: "Maintenance",
  disabled: "Désactivée",
};

export const CATEGORIES = ["Citadine", "Compacte", "Berline", "SUV", "Utilitaire", "Premium"];
export const TRANSMISSIONS = ["Automatique", "Manuelle"];
export const FUELS = ["Essence", "Diesel", "Hybride", "Électrique"];

export const eur = (value: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    value ?? 0,
  );

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function rentalDays(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.max(1, Math.ceil(ms / 86_400_000));
}

/** Effective daily rate: weekly/monthly packages give a lower per-day price. */
export function effectiveDailyRate(vehicle: Pick<Vehicle, "daily_price" | "weekly_price" | "monthly_price">, days: number) {
  if (days >= 30 && vehicle.monthly_price) return Number(vehicle.monthly_price) / 30;
  if (days >= 7 && vehicle.weekly_price) return Number(vehicle.weekly_price) / 7;
  return Number(vehicle.daily_price);
}

export function combineDateTime(date: string, time: string) {
  if (!date) return "";
  return new Date(`${date}T${time || "10:00"}:00`).toISOString();
}

export function toDateInput(d: Date) {
  return d.toISOString().slice(0, 10);
}
