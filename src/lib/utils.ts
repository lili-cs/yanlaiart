export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** "18:30" → "6:30 PM" */
export function formatTime12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${pad(m)} ${period}`;
}

/** Add minutes to "HH:mm" and return new "HH:mm". */
export function addMinutesToHhmm(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const total = h * 60 + m + minutes;
  const wrapped = ((total % 1440) + 1440) % 1440;
  return `${pad(Math.floor(wrapped / 60))}:${pad(wrapped % 60)}`;
}

/** "18:30" + 60 → "6:30 – 7:30 PM" */
export function formatTimeSlot(startHhmm: string, minutes: number): string {
  const endHhmm = addMinutesToHhmm(startHhmm, minutes);
  return `${formatTime12(startHhmm)} – ${formatTime12(endHhmm)}`;
}

/** YYYY-MM-DD → localized weekday (plural, en-US), e.g. "Mondays". */
export function weekdayPlural(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  const names = [
    "Sundays",
    "Mondays",
    "Tuesdays",
    "Wednesdays",
    "Thursdays",
    "Fridays",
    "Saturdays",
  ];
  return names[d.getUTCDay()] ?? "";
}

/** Add days to YYYY-MM-DD, DST-safe via UTC noon. */
export function addDaysToIso(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** "Aug 24 – Oct 12, 2026" from startDate + weekly session count. */
/**
 * Human-friendly duration label for a course, derived from the schedule fields
 * so it never drifts from the actual schedule. Used on cards, detail pages,
 * emails, and calendar invites in place of a hand-typed string.
 */
export function formatCourseDuration(course: {
  priceUnit: "total" | "hourly";
  status: "upcoming" | "open" | "cancelled";
  sessionCount?: number;
  sessionMinutes?: number;
  sessionTimes?: string[];
  startDate?: string;
}): string {
  if (course.status === "cancelled") return "Cancelled";

  const mins = course.sessionMinutes ?? 60;
  const perLabel =
    mins >= 60 && mins % 60 === 0
      ? mins === 60
        ? "1 hour"
        : `${mins / 60} hours`
      : `${mins} min`;

  const isScheduled = Boolean(course.startDate && course.sessionCount);
  if (isScheduled) {
    const weeks = course.sessionCount!;
    const weekLabel =
      weeks === 1 ? "One-time session" : `${weeks} weekly classes`;
    const slotCount = 1 + (course.sessionTimes?.length ?? 0);
    const slotLabel = slotCount > 1 ? ` · ${slotCount} slots per week` : "";
    return `${weekLabel} · ${perLabel} each${slotLabel}`;
  }

  if (course.priceUnit === "hourly") return "Book by the hour";
  // Upcoming courses without a schedule aren't one-time — they just don't
  // have dates set yet. Say so explicitly.
  if (course.status === "upcoming") return "Schedule to be announced";
  return `${perLabel} · one-time session`;
}

/**
 * Wire a simple Tab-key focus trap onto a container element. Returns a
 * cleanup function. Meant to be called inside a useEffect for open modals.
 */
export function trapFocus(container: HTMLElement): () => void {
  const selector =
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function handler(e: KeyboardEvent) {
    if (e.key !== "Tab") return;
    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(selector)
    ).filter((el) => !el.hasAttribute("aria-hidden"));
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey && (active === first || !container.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  container.addEventListener("keydown", handler);
  return () => container.removeEventListener("keydown", handler);
}

export function formatWeeklyRange(startIso: string, sessionCount: number): string {
  if (sessionCount <= 0) return "";
  const lastIso = addDaysToIso(startIso, (sessionCount - 1) * 7);
  const start = new Date(`${startIso}T12:00:00Z`);
  const end = new Date(`${lastIso}T12:00:00Z`);
  const startStr = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const endStr = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return sessionCount === 1
    ? startStr + `, ${end.getUTCFullYear()}`
    : `${startStr} – ${endStr}`;
}
