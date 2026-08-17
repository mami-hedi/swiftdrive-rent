import { jsPDF } from "jspdf";
import { STATUS_LABELS, eur, formatDateTime, type Reservation } from "@/lib/domain";

export interface ReceiptCompany {
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  vat_rate?: number | null;
}

/** Numéro de reçu unique et lisible (fallback si la base n'en a pas encore fourni un). */
export function receiptNumber(r: Reservation) {
  return r.receipt_number ?? `REC-${r.reference}`;
}

/** Détail financier : le total stocké est TTC. */
export function receiptBreakdown(r: Reservation, vatRate = 20) {
  const rate = Number(vatRate) || 0;
  const total = Number(r.total) || 0;
  const vehicleTtc = Number(r.daily_rate) * Number(r.days);
  const optionsTtc = Number(r.options_total) || 0;
  const subtotalHt = total / (1 + rate / 100);
  const vatAmount = total - subtotalHt;
  const paid = r.status === "cancelled" ? 0 : total;
  return {
    rate,
    total,
    vehicleTtc,
    optionsTtc,
    subtotalHt,
    vatAmount,
    paid,
    balance: total - paid,
  };
}

/** Génère et télécharge un reçu PDF détaillé pour une réservation. */
export function downloadReservationReceipt(r: Reservation, company: ReceiptCompany = {}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const left = 56;
  const right = 540;
  let y = 72;

  const name = company.company_name ?? "Velora Rent";
  const b = receiptBreakdown(r, company.vat_rate ?? 20);
  const number = receiptNumber(r);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(name, left, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(110);
  y += 18;
  doc.text("Recu de reservation", left, y);
  doc.text(`Emis le ${formatDateTime(new Date().toISOString())}`, right, y, { align: "right" });
  y += 15;
  doc.setFontSize(10);
  doc.text([company.address, company.phone, company.email].filter(Boolean).join(" | "), left, y);
  doc.setFont("helvetica", "bold");
  doc.text(`Recu n° ${number}`, right, y, { align: "right" });

  doc.setDrawColor(220);
  y += 16;
  doc.line(left, y, right, y);

  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  y += 32;
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
  ];

  y += 28;
  rows.forEach(([label, value]) => {
    doc.setTextColor(130);
    doc.text(label, left, y);
    doc.setTextColor(20);
    doc.text(String(value), right, y, { align: "right" });
    doc.setDrawColor(238);
    doc.line(left, y + 8, right, y + 8);
    y += 24;
  });

  // Recapitulatif financier detaille
  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20);
  doc.text("Recapitulatif financier", left, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y += 22;

  const money: [string, string][] = [
    [`Location vehicule (${r.days} j x ${eur(Number(r.daily_rate))})`, eur(b.vehicleTtc)],
    ["Options et suppléments", eur(b.optionsTtc)],
    ["Total HT", eur(b.subtotalHt)],
    [`TVA (${b.rate}%)`, eur(b.vatAmount)],
  ];

  money.forEach(([label, value]) => {
    doc.setTextColor(130);
    doc.text(label, left, y);
    doc.setTextColor(20);
    doc.text(value, right, y, { align: "right" });
    doc.setDrawColor(238);
    doc.line(left, y + 8, right, y + 8);
    y += 24;
  });

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Total TTC", left, y);
  doc.text(eur(b.total), right, y, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y += 24;
  doc.setTextColor(130);
  doc.text("Montant regle", left, y);
  doc.setTextColor(20);
  doc.text(eur(b.paid), right, y, { align: "right" });
  y += 22;
  doc.setTextColor(130);
  doc.text(r.status === "cancelled" ? "Montant rembourse / annule" : "Solde restant du", left, y);
  doc.setTextColor(20);
  doc.text(eur(r.status === "cancelled" ? b.total : b.balance), right, y, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(140);
  doc.text(
    `Recu n° ${number} genere automatiquement par ${name}. Ce recu ne constitue pas une facture fiscale.`,
    left,
    780,
  );

  doc.save(`recu-${number}.pdf`);
}
