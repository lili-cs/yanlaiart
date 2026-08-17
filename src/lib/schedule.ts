import { getAllCourses } from "@/data/courses";
import { getAllEvents } from "@/data/events";
import type { Course, ArtEvent, Category } from "@/types";
import { parseTimeRange } from "@/lib/ics";

export interface CalendarItem {
  id: string;
  type: "course" | "event";
  title: string;
  titleCn?: string;
  slug: string;
  /** YYYY-MM-DD, studio local date. */
  date: string;
  /** HH:mm (24-hour), studio local time. */
  startTime?: string;
  endTime?: string;
  isOnline: boolean;
  /** Meeting URL for online sessions — surfaced as a "Join" link on the calendar. */
  meetingUrl?: string;
  /** Free-form meeting instructions (meeting ID, dial-in numbers, etc.). */
  meetingInstructions?: string;
  /** e.g. "Class 3 of 8" — only set for course sessions. */
  sessionInfo?: string;
  category?: Category;
  /** True when the item is bookable (course status = "open" or a free event). */
  enrollable: boolean;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function addDays(iso: string, days: number): string {
  // Parse at noon UTC to avoid DST/TZ edge-case flips.
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function addMinutesToHhmm(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const total = h * 60 + m + minutes;
  const wrapped = ((total % 1440) + 1440) % 1440;
  return `${pad(Math.floor(wrapped / 60))}:${pad(wrapped % 60)}`;
}

function dayOfWeekUtc(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

/** Whole-week offset from anchor's Sunday to date's Sunday. */
function weekOffsetSunday(dateIso: string, anchorIso: string): number {
  const anchor = new Date(`${anchorIso}T12:00:00Z`);
  const anchorSun = addDays(anchorIso, -anchor.getUTCDay());
  const d = new Date(`${dateIso}T12:00:00Z`);
  const dSun = addDays(dateIso, -d.getUTCDay());
  return Math.round(
    (new Date(`${dSun}T12:00:00Z`).getTime() -
      new Date(`${anchorSun}T12:00:00Z`).getTime()) /
      (7 * 86400 * 1000)
  );
}

/**
 * Compute the list of session dates a course produces from its recurrence
 * rule. Backward compatible: a course without `recurrence` behaves as
 * weekly-on-startDate-weekday for `sessionCount` occurrences.
 */
function courseSessionDates(c: Course): string[] {
  if (!c.startDate) return [];
  const rec = c.recurrence ?? {};
  const interval = Math.max(1, rec.interval ?? 1);
  const weekdays =
    rec.weekdays && rec.weekdays.length
      ? [...new Set(rec.weekdays)].sort((a, b) => a - b)
      : [dayOfWeekUtc(c.startDate)];
  const endMode = rec.endMode ?? "count";
  const targetCount = c.sessionCount ?? 0;
  const skip = new Set(c.skipDates ?? []);

  const out: string[] = [];
  const MAX_DAYS = 365 * 3; // 3-year safety cap
  for (let offset = 0; offset < MAX_DAYS; offset++) {
    const date = addDays(c.startDate, offset);
    if (date < c.startDate) continue;
    const wk = weekOffsetSunday(date, c.startDate);
    if (wk % interval !== 0) continue;
    if (!weekdays.includes(dayOfWeekUtc(date))) continue;
    if (skip.has(date)) continue;
    if (endMode === "date") {
      if (rec.endDate && date > rec.endDate) break;
    } else {
      if (targetCount && out.length >= targetCount) break;
    }
    out.push(date);
    if (endMode === "date" && rec.endDate && date >= rec.endDate) break;
  }
  return out;
}

function courseToItems(c: Course): CalendarItem[] {
  if (!c.startDate || !c.startTime) return [];
  const dates = courseSessionDates(c);
  if (dates.length === 0) return [];
  const items: CalendarItem[] = [];
  const times = [c.startTime, ...(c.sessionTimes ?? [])];
  const durationMin = c.sessionMinutes ?? 60;
  const total = dates.length;
  dates.forEach((date, i) => {
    for (let s = 0; s < times.length; s++) {
      const start = times[s];
      const end = addMinutesToHhmm(start, durationMin);
      items.push({
        id: `course-${c.slug}-${i}-${s}`,
        type: "course",
        title: c.title,
        titleCn: c.titleCn,
        slug: c.slug,
        date,
        startTime: start,
        endTime: end,
        isOnline: c.format === "online",
        meetingUrl: c.format === "online" ? c.meetingUrl : undefined,
        meetingInstructions:
          c.format === "online" ? c.meetingInstructions : undefined,
        sessionInfo: total > 1 ? `Class ${i + 1} of ${total}` : undefined,
        category: c.category,
        enrollable: c.status === "open",
      });
    }
  });
  return items;
}

function eventToItem(e: ArtEvent): CalendarItem {
  const range = parseTimeRange(e.time);
  return {
    id: `event-${e.slug}`,
    type: "event",
    title: e.title,
    titleCn: e.titleCn,
    slug: e.slug,
    date: e.date,
    startTime: range?.start,
    endTime: range?.end,
    isOnline: Boolean(e.meetingUrl),
    meetingUrl: e.meetingUrl,
    enrollable: true,
  };
}

/** All course sessions + all events, sorted by date/time. */
export async function getAllCalendarItems(): Promise<CalendarItem[]> {
  const items: CalendarItem[] = [];
  const courses = await getAllCourses();
  for (const c of courses) items.push(...courseToItems(c));
  for (const e of getAllEvents()) items.push(eventToItem(e));
  return items.sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return (a.startTime ?? "").localeCompare(b.startTime ?? "");
  });
}

/** Courses that are open for booking but have no fixed schedule (e.g. hourly). */
export async function getUnscheduledOpenCourses(): Promise<Course[]> {
  const all = await getAllCourses();
  return all.filter((c) => c.status === "open" && !c.startDate);
}
