export interface DayHours {
  open: string;   // "HH:mm"
  close: string;  // "HH:mm"
  closed: boolean;
}

export interface BusinessHours {
  /** Index 0 = Sunday, 6 = Saturday — matches Date.getDay() */
  days: DayHours[];
}

export const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function weekdayOfLocalDate(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return -1;
  return new Date(y, m - 1, d, 12, 0, 0).getDay();
}

export interface ValidationOk {
  ok: true;
}
export interface ValidationErr {
  ok: false;
  error: string;
}

export function validateBookingSlot(
  date: string,
  time: string,
  hours: BusinessHours
): ValidationOk | ValidationErr {
  if (!HHMM.test(time)) {
    return { ok: false, error: "Please pick a valid time." };
  }
  const weekday = weekdayOfLocalDate(date);
  if (weekday < 0) {
    return { ok: false, error: "Please pick a valid date." };
  }
  const day = hours.days[weekday];
  if (day.closed) {
    return {
      ok: false,
      error: `We're closed on ${WEEKDAY_LABELS[weekday]}s. Please pick another day.`,
    };
  }
  const t = toMinutes(time);
  const open = toMinutes(day.open);
  const close = toMinutes(day.close);
  if (t < open || t > close) {
    return {
      ok: false,
      error: `${WEEKDAY_LABELS[weekday]} hours are ${day.open}–${day.close}. Please pick a time in that range.`,
    };
  }
  return { ok: true };
}
