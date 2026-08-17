import { readStore, updateStore } from "./store";
import { getAllBookings, type StoredBooking } from "./booking-store";
import {
  sendPendingBacklogAlert,
  sendSuspiciousBurstAlert,
} from "./email";

const ALERTS_KEY = "alerts";

/** Fresh pending bookings for one course beyond this count trigger a warning. */
const PENDING_BACKLOG_THRESHOLD = 5;

/** Window used to spot a booking burst from the same email. */
const BURST_WINDOW_MS = 10 * 60 * 1000;

/** N bookings from the same email inside BURST_WINDOW_MS flag as suspicious. */
const BURST_COUNT_THRESHOLD = 3;

/** Minimum delay before re-alerting on the same course or email. */
const ALERT_COOLDOWN_MS = 60 * 60 * 1000;

interface AlertsRecord {
  courseBacklog?: Record<string, number>;
  suspectEmails?: Record<string, number>;
}

async function readAlerts(): Promise<AlertsRecord> {
  const raw = await readStore<AlertsRecord>(ALERTS_KEY);
  return raw && typeof raw === "object" ? raw : {};
}

async function mutateAlerts(
  mutator: (current: AlertsRecord) => AlertsRecord
): Promise<void> {
  await updateStore<AlertsRecord>(ALERTS_KEY, (current) =>
    mutator(current && typeof current === "object" ? current : {})
  );
}

export interface AnomalyContext {
  courseSlug: string;
  courseName?: string;
  customerEmail: string;
}

/**
 * Called after a new booking is written. Inspects the whole booking set,
 * fires at most one email per alert type per cooldown window.
 */
export async function checkBookingAnomalies(ctx: AnomalyContext): Promise<void> {
  const [alerts, allBookings] = await Promise.all([
    readAlerts(),
    getAllBookings(),
  ]);
  const now = Date.now();
  const emailKey = ctx.customerEmail.trim().toLowerCase();

  const jobs: Array<Promise<void>> = [];

  // 1. Pending backlog per course.
  const pendingForCourse = allBookings.filter(
    (b) =>
      b.itemType === "course" &&
      b.itemSlug === ctx.courseSlug &&
      b.paymentStatus === "pending"
  );
  if (pendingForCourse.length > PENDING_BACKLOG_THRESHOLD) {
    const lastAlertedAt = alerts.courseBacklog?.[ctx.courseSlug] ?? 0;
    if (now - lastAlertedAt > ALERT_COOLDOWN_MS) {
      jobs.push(
        (async () => {
          try {
            await sendPendingBacklogAlert({
              courseSlug: ctx.courseSlug,
              courseName: ctx.courseName ?? ctx.courseSlug,
              pendingCount: pendingForCourse.length,
              recent: pendingForCourse.slice(0, 10),
            });
            await mutateAlerts((prev) => ({
              ...prev,
              courseBacklog: {
                ...(prev.courseBacklog ?? {}),
                [ctx.courseSlug]: now,
              },
            }));
          } catch (err) {
            console.error("[alerts] pending backlog notification failed", err);
          }
        })()
      );
    }
  }

  // 2. Same-email booking burst (potential bot / attack).
  const cutoff = now - BURST_WINDOW_MS;
  const recentFromEmail = allBookings.filter(
    (b) =>
      b.customerEmail?.trim().toLowerCase() === emailKey &&
      b.createdAt >= cutoff
  );
  if (recentFromEmail.length >= BURST_COUNT_THRESHOLD) {
    const lastAlertedAt = alerts.suspectEmails?.[emailKey] ?? 0;
    if (now - lastAlertedAt > ALERT_COOLDOWN_MS) {
      jobs.push(
        (async () => {
          try {
            await sendSuspiciousBurstAlert({
              customerEmail: ctx.customerEmail,
              windowMinutes: Math.floor(BURST_WINDOW_MS / 60000),
              count: recentFromEmail.length,
              latest: recentFromEmail.slice(0, 10),
            });
            await mutateAlerts((prev) => ({
              ...prev,
              suspectEmails: {
                ...(prev.suspectEmails ?? {}),
                [emailKey]: now,
              },
            }));
          } catch (err) {
            console.error("[alerts] suspicious burst notification failed", err);
          }
        })()
      );
    }
  }

  await Promise.allSettled(jobs);
}

export type AnomalyBooking = Pick<
  StoredBooking,
  | "id"
  | "itemSlug"
  | "itemName"
  | "customerName"
  | "customerEmail"
  | "createdAt"
  | "paymentStatus"
  | "source"
>;
