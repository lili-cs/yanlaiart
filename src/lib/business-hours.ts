import { readStore, updateStore } from "./store";
import {
  toMinutes,
  type BusinessHours,
  type DayHours,
} from "./business-hours-types";

export {
  WEEKDAY_LABELS,
  weekdayOfLocalDate,
  validateBookingSlot,
  type BusinessHours,
  type DayHours,
  type ValidationOk,
  type ValidationErr,
} from "./business-hours-types";

const KEY = "business-hours";

const DEFAULT_HOURS: BusinessHours = {
  days: [
    { open: "10:00", close: "19:00", closed: true },  // Sun
    { open: "10:00", close: "19:00", closed: false }, // Mon
    { open: "10:00", close: "19:00", closed: false }, // Tue
    { open: "10:00", close: "19:00", closed: false }, // Wed
    { open: "10:00", close: "19:00", closed: false }, // Thu
    { open: "10:00", close: "19:00", closed: false }, // Fri
    { open: "10:00", close: "19:00", closed: false }, // Sat
  ],
};

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

function normalizeDay(input: unknown): DayHours {
  const d = (input ?? {}) as Partial<DayHours>;
  const open = typeof d.open === "string" && HHMM.test(d.open) ? d.open : "10:00";
  const close = typeof d.close === "string" && HHMM.test(d.close) ? d.close : "19:00";
  const closed = Boolean(d.closed);
  return { open, close, closed };
}

function normalize(input: unknown): BusinessHours {
  const days: DayHours[] = Array.from({ length: 7 }, (_, i) => {
    const raw = Array.isArray((input as BusinessHours | null)?.days)
      ? (input as BusinessHours).days[i]
      : undefined;
    const day = normalizeDay(raw ?? DEFAULT_HOURS.days[i]);
    if (toMinutes(day.close) <= toMinutes(day.open)) {
      day.close = DEFAULT_HOURS.days[i].close;
      day.open = DEFAULT_HOURS.days[i].open;
    }
    return day;
  });
  return { days };
}

export async function getBusinessHours(): Promise<BusinessHours> {
  const raw = await readStore<BusinessHours>(KEY);
  if (!raw) return DEFAULT_HOURS;
  return normalize(raw);
}

export async function saveBusinessHours(
  input: BusinessHours
): Promise<BusinessHours> {
  const next = normalize(input);
  await updateStore<BusinessHours>(KEY, () => next);
  return next;
}
