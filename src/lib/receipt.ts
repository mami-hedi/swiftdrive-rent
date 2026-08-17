import { jsPDF } from "jspdf";
import { STATUS_LABELS, eur, formatDateTime, type Reservation } from "@/lib/domain";

/** Génère et télécharge un reçu PDF pour une réservation. */
export function downloadReservationReceipt(r: Reservation) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const left = 56;
  let y = 72;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Velora Rent", left, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(110);
  y += 18;
  doc.text("Recu de reservation", left, y);
  doc.text(`Emis le ${formatDateTime(new Date().toISOString())}`, 540, y, { align: "right" });

  doc.setDrawColor(220);
  y += 16;
  doc.line(left, y, 540, y);

  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  y += 34;
  doc.text(`Reservation ${r.reference}`, left, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90);
  y += 18;
  doc.text(`Statut : ${STATUS_LABELS[r.status]}`, left, y);
  if (r.status === "cancelled" && r.cancellation_reason) {
    y += 15;
    doc.text(`Motif d'annulation : ${r.cancellation_reason}`, left, y);
  }

  const rows: [string, string][] = [
    ["Client", `${r.first_name} ${r.last_name}`],
    ["Email", r.email],
    ["Vehicule", `${r.vehicles?.brand ?? ""} ${r.vehicles?.model ?? ""}`.trim() || "-"],
    ["Depart", `${formatDateTime(r.start_at)} - ${r.pickup_location}`],
    ["Retour", `${formatDateTime(r.end_at)} - ${r.dropoff_location}`],
    ["Duree", `${r.days} jour(s)`],
    ["Tarif journalier", eur(Number(r.daily_rate))],
    ["Options", eur(Number(r.options_total))],
  ];

  y += 30;
  rows.forEach(([label, value]) => {
    doc.setTextColor(130);
    doc.text(label, left, y);
    doc.setTextColor(20);
    doc.text(String(value), 540, y, { align: "right" });
    doc.setDrawColor(238);
    doc.line(left, y + 8, 540, y + 8);
    y += 26;
  });

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(20);
  doc.text("Montant total", left, y);
  doc.text(eur(Number(r.total)), 540, y, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(140);
  doc.text(
    "Document genere automatiquement par Velora Rent. Ce recu ne constitue pas une facture fiscale.",
    left,
    780,
  );

  doc.save(`recu-${r.reference}.pdf`);
}
