"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";
import {
  createCourse,
  deleteCourse,
  getCourseBySlug,
  purgeCourse,
  restoreCourse,
  updateCourse,
} from "@/lib/course-store";
import {
  courseHasAnyBookings,
  getBookingsForCourse,
} from "@/lib/booking-store";
import {
  sendCourseCancellationEmail,
  sendCourseConfirmationEmail,
  sendCourseFollowUpEmail,
} from "@/lib/email";
import { formatCourseDuration } from "@/lib/utils";
import {
  saveBusinessHours,
  type BusinessHours,
  type DayHours,
} from "@/lib/business-hours";
import type { Course, Category } from "@/types";

async function requireSession(): Promise<void> {
  const c = await cookies();
  const session = verifySession(c.get(SESSION_COOKIE_NAME)?.value);
  if (!session) redirect("/admin/login");
}

export async function logoutAction(): Promise<void> {
  const c = await cookies();
  c.delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function optionalString(v: FormDataEntryValue | null): string | undefined {
  const s = String(v ?? "").trim();
  return s || undefined;
}

function optionalNumber(v: FormDataEntryValue | null): number | undefined {
  const s = String(v ?? "").trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function coursePriceCents(dollarsStr: string): number {
  const dollars = Number(dollarsStr);
  if (!Number.isFinite(dollars) || dollars < 0) {
    throw new Error("Price must be a non-negative number.");
  }
  return Math.round(dollars * 100);
}

function buildCourseFromFormData(formData: FormData, existing?: Course): Course {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required.");

  const providedSlug = optionalString(formData.get("slug"));
  const slug = existing?.slug ?? providedSlug ?? slugify(title);
  if (!slug) throw new Error("Slug is required.");

  const category = String(formData.get("category") ?? "") as Category;
  if (!["drawing", "painting", "ceramic"].includes(category)) {
    throw new Error("Category must be drawing, painting, or ceramic.");
  }

  const priceUnit = (String(formData.get("priceUnit") ?? "total")) as
    | "total"
    | "hourly";
  if (!["total", "hourly"].includes(priceUnit)) {
    throw new Error("Price unit must be 'total' or 'hourly'.");
  }

  const format = String(formData.get("format") ?? "in-person") as
    | "in-person"
    | "online";
  if (!["in-person", "online"].includes(format)) {
    throw new Error("Format must be 'in-person' or 'online'.");
  }

  const level = String(formData.get("level") ?? "All Levels") as Course["level"];
  const status = String(formData.get("status") ?? "upcoming") as Course["status"];
  if (!["upcoming", "open", "cancelled"].includes(status)) {
    throw new Error("Status must be 'upcoming', 'open', or 'cancelled'.");
  }

  const priceInput = String(formData.get("price") ?? "0");
  const price = coursePriceCents(priceInput);

  const sessionMinutes = optionalNumber(formData.get("sessionMinutes"));
  const startDate = optionalString(formData.get("startDate"));
  const startTime = optionalString(formData.get("startTime"));
  const sessionCount = optionalNumber(formData.get("sessionCount"));
  const sessionTimes = (() => {
    const raw = optionalString(formData.get("sessionTimes"));
    if (!raw) return undefined;
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /^\d{1,2}:\d{2}$/.test(s));
    return parts.length > 0 ? parts : undefined;
  })();

  // --- Google-Calendar-style recurrence ---
  const rawInterval = optionalNumber(formData.get("recurrenceInterval"));
  const interval = rawInterval && rawInterval > 0 ? Math.min(12, Math.floor(rawInterval)) : 1;
  const weekdays = formData
    .getAll("recurrenceWeekdays")
    .map((v) => Number(String(v)))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
  const uniqueWeekdays = [...new Set(weekdays)].sort((a, b) => a - b);
  const endModeRaw = String(formData.get("endMode") ?? "count");
  const endMode: "count" | "date" = endModeRaw === "date" ? "date" : "count";
  const recurrenceEndDate = optionalString(formData.get("recurrenceEndDate"));
  const skipDates = (() => {
    const raw = optionalString(formData.get("skipDates"));
    if (!raw) return undefined;
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));
    return parts.length > 0 ? parts : undefined;
  })();

  const recurrence: Course["recurrence"] | undefined = startDate
    ? {
        interval,
        weekdays: uniqueWeekdays.length > 0 ? uniqueWeekdays : undefined,
        endMode,
        endDate: endMode === "date" ? recurrenceEndDate : undefined,
      }
    : undefined;

  if (recurrence?.endMode === "date" && !recurrence.endDate) {
    throw new Error("Please choose an end date, or switch Ends to 'After N classes'.");
  }
  if (recurrence?.endMode === "count" && startDate && !sessionCount) {
    throw new Error("Please enter how many classes the series should run for.");
  }
  if (recurrence?.endDate && startDate && recurrence.endDate < startDate) {
    throw new Error("End date can't be before the first class date.");
  }

  const course: Course = {
    slug,
    title,
    titleCn: String(formData.get("titleCn") ?? "").trim(),
    category,
    description: String(formData.get("description") ?? "").trim(),
    longDescription: String(formData.get("longDescription") ?? "").trim(),
    price,
    priceUnit,
    duration:
      optionalString(formData.get("duration")) ??
      formatCourseDuration({
        priceUnit,
        status,
        sessionCount,
        sessionMinutes,
        sessionTimes,
        startDate,
      }),
    level,
    format,
    status,
    maxStudents: optionalNumber(formData.get("maxStudents")),
    minStudents: optionalNumber(formData.get("minStudents")),
    imageUrl:
      optionalString(formData.get("imageUrl")) ??
      existing?.imageUrl ??
      "https://placehold.co/800x500/e2e8f0/475569?text=Course",
    featured: formData.get("featured") === "on",
    meetingUrl:
      format === "online" ? optionalString(formData.get("meetingUrl")) : undefined,
    meetingInstructions:
      format === "online"
        ? optionalString(formData.get("meetingInstructions"))
        : undefined,
    sessionMinutes,
    startDate,
    startTime,
    sessionCount,
    sessionTimes,
    recurrence,
    skipDates,
  };

  return course;
}

export interface CourseActionState {
  error?: string;
}

export async function createCourseAction(
  _prev: CourseActionState,
  formData: FormData
): Promise<CourseActionState> {
  await requireSession();
  let course: Course;
  try {
    course = buildCourseFromFormData(formData);
    await createCourse(course);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save course." };
  }
  revalidatePath("/", "layout");
  redirect(`/admin/courses/${course.slug}/edit?saved=1`);
}

export async function updateCourseAction(
  slug: string,
  _prev: CourseActionState,
  formData: FormData
): Promise<CourseActionState> {
  await requireSession();
  try {
    const course = buildCourseFromFormData(formData, { slug } as Course);
    await updateCourse(slug, course);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save course." };
  }
  revalidatePath("/", "layout");
  redirect(`/admin/courses/${slug}/edit?saved=1`);
}

export async function deleteCourseAction(formData: FormData): Promise<void> {
  await requireSession();
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  await deleteCourse(slug);
  revalidatePath("/", "layout");
  // ?undo=<slug> triggers the "Deleted — Undo" banner on the dashboard.
  redirect(`/admin?undo=${encodeURIComponent(slug)}`);
}

export async function restoreCourseAction(formData: FormData): Promise<void> {
  await requireSession();
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  await restoreCourse(slug);
  revalidatePath("/", "layout");
  redirect(`/admin?restored=${encodeURIComponent(slug)}`);
}

export async function purgeCourseAction(formData: FormData): Promise<void> {
  await requireSession();
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  if (await courseHasAnyBookings(slug)) {
    // Refuse to hard-delete a course that has any bookings — the admin
    // would lose visibility into who was enrolled. Restore + edit instead.
    redirect(`/admin?purgeBlocked=${encodeURIComponent(slug)}`);
  }
  await purgeCourse(slug);
  revalidatePath("/", "layout");
  redirect("/admin?purged=1");
}

/* ---- Notify enrolled students -------------------------------------- */

export interface NotifyState {
  ok?: boolean;
  sent?: number;
  skipped?: number;
  error?: string;
  /** Set on a successful cancel — lets the UI offer an "undo status" button. */
  previousStatus?: "upcoming" | "open" | "cancelled";
}

async function notifyCourse(
  slug: string,
  action: "confirm" | "cancel" | "followup",
  customMessage: string,
  bookingIds: string[]
): Promise<NotifyState> {
  const course = await getCourseBySlug(slug);
  if (!course) return { error: "Course not found." };
  if (bookingIds.length === 0) {
    return { error: "Please select at least one student." };
  }

  const allBookings = await getBookingsForCourse(slug);
  const wanted = new Set(bookingIds);
  const bookings = allBookings.filter((b) => wanted.has(b.id));
  if (bookings.length === 0) {
    return {
      error: "None of the selected students match a booking for this course.",
    };
  }

  const courseName = `${course.title}${course.titleCn ? ` (${course.titleCn})` : ""}`;

  let sent = 0;
  let skipped = 0;
  for (const b of bookings) {
    if (!b.customerEmail) {
      skipped++;
      continue;
    }
    try {
      if (action === "cancel") {
        await sendCourseCancellationEmail({
          courseName,
          customerName: b.customerName || "there",
          customerEmail: b.customerEmail,
          requestedDate: b.requestedDate,
          requestedTime: b.requestedTime,
          customMessage,
        });
      } else if (action === "followup") {
        await sendCourseFollowUpEmail({
          courseName,
          customerName: b.customerName || "there",
          customerEmail: b.customerEmail,
          requestedDate: b.requestedDate,
          requestedTime: b.requestedTime,
          customMessage,
        });
      } else {
        await sendCourseConfirmationEmail({
          courseName,
          customerName: b.customerName || "there",
          customerEmail: b.customerEmail,
          requestedDate: b.requestedDate,
          requestedTime: b.requestedTime,
          meetingUrl: course.meetingUrl,
          meetingInstructions: course.meetingInstructions,
          location: b.location,
          isOnline: course.format === "online",
          customMessage,
        });
      }
      sent++;
    } catch (err) {
      console.error(
        `Failed to send ${action} email to ${b.customerEmail}:`,
        err
      );
      skipped++;
    }
  }

  let previousStatus: NotifyState["previousStatus"];
  if (action === "cancel") {
    previousStatus = course.status;
    await updateCourse(slug, { status: "cancelled" });
  }

  revalidatePath("/", "layout");
  return { ok: true, sent, skipped, previousStatus };
}

/** Restore a course status after a cancel (emails are already sent). */
export async function revertStatusAction(
  slug: string,
  targetStatus: "upcoming" | "open"
): Promise<void> {
  await requireSession();
  await updateCourse(slug, { status: targetStatus });
  revalidatePath("/", "layout");
}

function readBookingIds(formData: FormData): string[] {
  return formData
    .getAll("bookingId")
    .map((v) => String(v).trim())
    .filter(Boolean);
}

function requireMessage(formData: FormData): string | { error: string } {
  const customMessage = String(formData.get("customMessage") ?? "").trim();
  if (!customMessage) {
    return { error: "Please write a message before sending." };
  }
  return customMessage;
}

export async function confirmCourseAction(
  slug: string,
  _prev: NotifyState,
  formData: FormData
): Promise<NotifyState> {
  await requireSession();
  const msg = requireMessage(formData);
  if (typeof msg !== "string") return msg;
  const bookingIds = readBookingIds(formData);
  try {
    return await notifyCourse(slug, "confirm", msg, bookingIds);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to send notifications.",
    };
  }
}

export async function cancelCourseAction(
  slug: string,
  _prev: NotifyState,
  formData: FormData
): Promise<NotifyState> {
  await requireSession();
  const msg = requireMessage(formData);
  if (typeof msg !== "string") return msg;
  const bookingIds = readBookingIds(formData);
  try {
    return await notifyCourse(slug, "cancel", msg, bookingIds);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to send notifications.",
    };
  }
}

export async function followUpCourseAction(
  slug: string,
  _prev: NotifyState,
  formData: FormData
): Promise<NotifyState> {
  await requireSession();
  const msg = requireMessage(formData);
  if (typeof msg !== "string") return msg;
  const bookingIds = readBookingIds(formData);
  try {
    return await notifyCourse(slug, "followup", msg, bookingIds);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to send notifications.",
    };
  }
}

/* ---- Business hours ------------------------------------------------ */

export interface HoursFormState {
  ok?: boolean;
  error?: string;
}

export async function updateBusinessHoursAction(
  _prev: HoursFormState,
  formData: FormData
): Promise<HoursFormState> {
  await requireSession();
  const days: DayHours[] = [];
  for (let i = 0; i < 7; i++) {
    const open = String(formData.get(`day-${i}-open`) ?? "").trim() || "10:00";
    const close = String(formData.get(`day-${i}-close`) ?? "").trim() || "19:00";
    const closed = formData.get(`day-${i}-closed`) === "on";
    if (!closed && open >= close) {
      return {
        error: `Closing time must be after opening time (day ${i}).`,
      };
    }
    days.push({ open, close, closed });
  }
  const next: BusinessHours = { days };
  try {
    await saveBusinessHours(next);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to save business hours.",
    };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
