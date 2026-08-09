import { readStore, writeStore } from "./store";

export interface StoredBooking {
  id: string;
  itemType: "course" | "event";
  itemSlug: string;
  itemName: string;
  itemDetails: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  requestedDate?: string;
  requestedTime?: string;
  requestedEndTime?: string;
  notes?: string;
  isOnline: boolean;
  meetingUrl?: string;
  meetingInstructions?: string;
  location?: string;
  amountLabel: string;
  createdAt: number;
  source: "stripe" | "free" | "demo";
  paymentStatus: "pending" | "paid";
}

/** Normalize legacy records that pre-date the paymentStatus field. */
function withDefaults(b: StoredBooking): StoredBooking {
  if (b.paymentStatus) return b;
  return { ...b, paymentStatus: b.source === "stripe" ? "paid" : "paid" };
}

const KEY = "bookings";

async function loadAll(): Promise<StoredBooking[]> {
  const existing = await readStore<StoredBooking[]>(KEY);
  return existing ?? [];
}

async function saveAll(bookings: StoredBooking[]): Promise<void> {
  await writeStore(KEY, bookings);
}

export async function addBooking(b: StoredBooking): Promise<void> {
  const all = await loadAll();
  const deduped = all.filter((x) => x.id !== b.id);
  await saveAll([...deduped, b]);
}

export async function getAllBookings(): Promise<StoredBooking[]> {
  const all = await loadAll();
  return [...all].map(withDefaults).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getBookingsForCourse(slug: string): Promise<StoredBooking[]> {
  const all = await loadAll();
  return all
    .filter((b) => b.itemType === "course" && b.itemSlug === slug)
    .map(withDefaults)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export interface BookingCounts {
  paid: number;
  pending: number;
}

export async function getBookingCountsByCourse(): Promise<Record<string, BookingCounts>> {
  const all = await loadAll();
  const counts: Record<string, BookingCounts> = {};
  for (const raw of all) {
    if (raw.itemType !== "course") continue;
    const b = withDefaults(raw);
    if (!counts[b.itemSlug]) counts[b.itemSlug] = { paid: 0, pending: 0 };
    if (b.paymentStatus === "paid") counts[b.itemSlug].paid++;
    else counts[b.itemSlug].pending++;
  }
  return counts;
}
