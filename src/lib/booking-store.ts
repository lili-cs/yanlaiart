import { readStore, updateStore } from "./store";

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

/**
 * Stripe pending bookings older than this are treated as abandoned. The
 * customer opened the modal and clicked through to Stripe but never
 * completed payment — we ignore them in admin views + counts.
 */
const STALE_PENDING_MS = 24 * 60 * 60 * 1000;

function isFresh(b: StoredBooking): boolean {
  if (b.paymentStatus !== "pending") return true;
  if (b.source !== "stripe") return true;
  return Date.now() - b.createdAt < STALE_PENDING_MS;
}

const KEY = "bookings";

async function loadAll(): Promise<StoredBooking[]> {
  const existing = await readStore<StoredBooking[]>(KEY);
  return existing ?? [];
}

export async function addBooking(b: StoredBooking): Promise<void> {
  await updateStore<StoredBooking[]>(KEY, (current) => {
    const all = Array.isArray(current) ? current : [];
    const deduped = all.filter((x) => x.id !== b.id);
    return [...deduped, b];
  });
}

export async function getAllBookings(): Promise<StoredBooking[]> {
  const all = await loadAll();
  return [...all]
    .map(withDefaults)
    .filter(isFresh)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getBookingsForCourse(slug: string): Promise<StoredBooking[]> {
  const all = await loadAll();
  return all
    .filter((b) => b.itemType === "course" && b.itemSlug === slug)
    .map(withDefaults)
    .filter(isFresh)
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Includes abandoned Stripe checkouts — used by the safety check on purge. */
export async function courseHasAnyBookings(slug: string): Promise<boolean> {
  const all = await loadAll();
  return all.some((b) => b.itemType === "course" && b.itemSlug === slug);
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
    if (!isFresh(b)) continue;
    if (!counts[b.itemSlug]) counts[b.itemSlug] = { paid: 0, pending: 0 };
    if (b.paymentStatus === "paid") counts[b.itemSlug].paid++;
    else counts[b.itemSlug].pending++;
  }
  return counts;
}
