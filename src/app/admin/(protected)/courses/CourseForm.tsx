"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { Course } from "@/types";
import { formatCourseDuration } from "@/lib/utils";
import type { CourseActionState } from "../actions";

const initial: CourseActionState = {};

interface Props {
  mode: "new" | "edit";
  course?: Course;
  action: (prev: CourseActionState, fd: FormData) => Promise<CourseActionState>;
}

function SubmitButton({ mode }: { mode: "new" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : mode === "new" ? "Create course" : "Save changes"}
    </button>
  );
}

const inputCls =
  "mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 sm:text-sm";
const labelCls = "block text-sm font-medium text-stone-700";

export default function CourseForm({ mode, course, action }: Props) {
  const [state, formAction] = useActionState(action, initial);
  const [format, setFormat] = useState<"in-person" | "online">(
    course?.format ?? "in-person"
  );
  const [imageUrl, setImageUrl] = useState(course?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    const file = event.target.files?.[0];
    // Reset the input so re-selecting the same file works.
    event.target.value = "";
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        setUploadError(data.error ?? "Upload failed. Please try again.");
        return;
      }
      setImageUrl(data.url);
    } catch {
      setUploadError("Network error while uploading.");
    } finally {
      setUploading(false);
    }
  }

  // Live-updating schedule preview so the admin can see what the
  // auto-generated duration label will read as they type.
  const [priceUnit, setPriceUnit] = useState<"total" | "hourly">(
    course?.priceUnit ?? "total"
  );
  const [status, setStatus] = useState<"upcoming" | "open" | "cancelled">(
    course?.status ?? "upcoming"
  );
  const [startDate, setStartDate] = useState(course?.startDate ?? "");
  const [startTime, setStartTime] = useState(course?.startTime ?? "");
  const [sessionMinutes, setSessionMinutes] = useState<string>(
    String(course?.sessionMinutes ?? 60)
  );
  const [sessionCount, setSessionCount] = useState<string>(
    course?.sessionCount ? String(course.sessionCount) : ""
  );
  const [sessionTimesRaw, setSessionTimesRaw] = useState<string>(
    course?.sessionTimes?.join(", ") ?? ""
  );

  // --- Google Calendar-style recurrence ---
  const derivedInitialWeekday =
    course?.startDate && !course?.recurrence?.weekdays?.length
      ? [new Date(`${course.startDate}T12:00:00Z`).getUTCDay()]
      : course?.recurrence?.weekdays ?? [];
  const [interval, setInterval] = useState<string>(
    String(course?.recurrence?.interval ?? 1)
  );
  const [weekdays, setWeekdays] = useState<number[]>(derivedInitialWeekday);
  const [endMode, setEndMode] = useState<"count" | "date">(
    course?.recurrence?.endMode ?? "count"
  );
  const [endDate, setEndDate] = useState<string>(
    course?.recurrence?.endDate ?? ""
  );
  const [skipDatesRaw, setSkipDatesRaw] = useState<string>(
    course?.skipDates?.join(", ") ?? ""
  );

  // Auto-follow startDate: when the admin picks a new first-class date and
  // hasn't manually toggled weekdays, mirror the picker to that weekday.
  const [manualWeekdays, setManualWeekdays] = useState<boolean>(
    Boolean(course?.recurrence?.weekdays?.length)
  );
  if (
    startDate &&
    !manualWeekdays &&
    weekdays.length === 1 &&
    weekdays[0] !== new Date(`${startDate}T12:00:00Z`).getUTCDay()
  ) {
    // Sync in render (no effect needed) to keep the toggle in step.
    setWeekdays([new Date(`${startDate}T12:00:00Z`).getUTCDay()]);
  }

  const [duration, setDuration] = useState<string>(course?.duration ?? "");

  const previewDuration = formatCourseDuration({
    priceUnit,
    status,
    sessionCount: sessionCount ? Number(sessionCount) : undefined,
    sessionMinutes: sessionMinutes ? Number(sessionMinutes) : undefined,
    sessionTimes: sessionTimesRaw
      ? sessionTimesRaw
          .split(",")
          .map((s) => s.trim())
          .filter((s) => /^\d{1,2}:\d{2}$/.test(s))
      : undefined,
    startDate: startDate || undefined,
  });
  // If the admin typed something that doesn't match what the schedule would
  // derive, flag it — they may have intentionally overridden, or they may
  // have forgotten to update the label after editing dates.
  const durationTrimmed = duration.trim();
  const durationMismatch =
    durationTrimmed.length > 0 && durationTrimmed !== previewDuration;

  const priceDollars = course ? (course.price / 100).toFixed(2) : "";

  return (
    <form action={formAction} className="space-y-6">
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-stone-900">Basics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className={labelCls}>Title *</label>
            <input id="title" name="title" required defaultValue={course?.title} className={inputCls} />
          </div>
          <div>
            <label htmlFor="titleCn" className={labelCls}>Chinese title</label>
            <input id="titleCn" name="titleCn" defaultValue={course?.titleCn} className={inputCls} />
          </div>
          <div>
            <label htmlFor="slug" className={labelCls}>
              Slug {mode === "edit" && <span className="text-xs text-stone-400">(cannot change)</span>}
            </label>
            <input
              id="slug"
              name="slug"
              defaultValue={course?.slug}
              readOnly={mode === "edit"}
              placeholder={mode === "new" ? "auto-generated from title if blank" : undefined}
              className={`${inputCls} ${mode === "edit" ? "bg-stone-100" : ""}`}
            />
          </div>
          <div>
            <label htmlFor="category" className={labelCls}>Category *</label>
            <select id="category" name="category" required defaultValue={course?.category ?? "drawing"} className={inputCls}>
              <option value="drawing">Drawing</option>
              <option value="painting">Painting</option>
              <option value="ceramic">Ceramic</option>
            </select>
          </div>
          <div>
            <label htmlFor="level" className={labelCls}>Level</label>
            <select id="level" name="level" defaultValue={course?.level ?? "All Levels"} className={inputCls}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>All Levels</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className={labelCls}>Short description *</label>
            <textarea id="description" name="description" required rows={2} defaultValue={course?.description} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="longDescription" className={labelCls}>Long description *</label>
            <textarea id="longDescription" name="longDescription" required rows={6} defaultValue={course?.longDescription} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="imageUrl" className={labelCls}>Course image</label>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <input
                id="imageUrl"
                name="imageUrl"
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste an image URL, or upload a file →"
                className="flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
              <label
                className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:bg-stone-100 ${
                  uploading ? "cursor-wait opacity-60" : ""
                }`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {uploading ? "Uploading…" : "Upload image"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  disabled={uploading}
                  onChange={handleImageUpload}
                  className="sr-only"
                />
              </label>
            </div>
            <p className="mt-1 text-xs text-stone-500">
              Paste any public image URL, or upload a file (JPEG/PNG/WebP, up to 8 MB).
            </p>
            {uploadError && (
              <p
                role="alert"
                className="mt-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800"
              >
                {uploadError}
              </p>
            )}
            {imageUrl && (
              <div className="mt-2 overflow-hidden rounded-md border border-stone-200 bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Course preview"
                  className="h-32 w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
                  }}
                />
              </div>
            )}
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input id="featured" name="featured" type="checkbox" defaultChecked={course?.featured} className="h-4 w-4 rounded border-stone-300 text-amber-700 focus:ring-amber-700" />
            <label htmlFor="featured" className="text-sm text-stone-700">
              Show on the home page as a featured course
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-stone-900">Format & booking</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="format" className={labelCls}>Format *</label>
            <select
              id="format"
              name="format"
              defaultValue={format}
              onChange={(e) => setFormat(e.target.value as "in-person" | "online")}
              className={inputCls}
            >
              <option value="in-person">In-person</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className={labelCls}>Status *</label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className={inputCls}
            >
              <option value="upcoming">Upcoming (not bookable yet)</option>
              <option value="open">Open (bookable now)</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label htmlFor="price" className={labelCls}>Price (USD) *</label>
            <input id="price" name="price" type="number" min="0" step="0.01" required defaultValue={priceDollars} className={inputCls} />
          </div>
          <div>
            <label htmlFor="priceUnit" className={labelCls}>Price unit</label>
            <select
              id="priceUnit"
              name="priceUnit"
              value={priceUnit}
              onChange={(e) => setPriceUnit(e.target.value as typeof priceUnit)}
              className={inputCls}
            >
              <option value="total">Total (whole course)</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>
          <div>
            <label htmlFor="maxStudents" className={labelCls}>Max students</label>
            <input id="maxStudents" name="maxStudents" type="number" min="1" defaultValue={course?.maxStudents ?? ""} className={inputCls} />
          </div>
          <div>
            <label htmlFor="minStudents" className={labelCls}>
              Min students to open <span className="text-stone-400">(optional)</span>
            </label>
            <input id="minStudents" name="minStudents" type="number" min="1" defaultValue={course?.minStudents ?? ""} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="duration" className={labelCls}>
              Duration label <span className="text-stone-400">(what shows on the course card &amp; page)</span>
            </label>
            <input
              id="duration"
              name="duration"
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder={previewDuration || "Leave blank to auto-generate from schedule"}
              className={inputCls}
            />
            <div className="mt-1 flex flex-col gap-1 text-xs">
              {durationTrimmed.length === 0 ? (
                <p className="text-stone-500">
                  Empty → auto-generates as{" "}
                  <span className="font-medium text-stone-700">
                    {previewDuration || "(nothing to derive from schedule)"}
                  </span>
                </p>
              ) : durationMismatch ? (
                <p className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1.5 text-amber-900">
                  <span className="font-semibold">Doesn&apos;t match your schedule.</span>{" "}
                  Based on the fields below, this course would auto-read as{" "}
                  <span className="font-medium">{previewDuration}</span>. Your
                  custom text will be shown instead — clear the field to
                  revert to the auto value.
                </p>
              ) : (
                <p className="text-emerald-700">
                  ✓ Matches the schedule below.
                </p>
              )}
            </div>
          </div>
          {format === "online" && (
            <>
              <div className="sm:col-span-2">
                <label htmlFor="meetingUrl" className={labelCls}>
                  Meeting link <span className="text-stone-400">(Zoom, Google Meet, VooV, Tencent, Teams…)</span>
                </label>
                <input
                  id="meetingUrl"
                  name="meetingUrl"
                  type="url"
                  defaultValue={course?.meetingUrl ?? ""}
                  placeholder="https://meet.google.com/…"
                  className={inputCls}
                />
                <p className="mt-1 text-xs text-stone-500">
                  This link is embedded in the calendar invite students receive
                  after booking, plus their confirmation email.
                </p>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="meetingInstructions" className={labelCls}>
                  Meeting details <span className="text-stone-400">(optional — meeting ID, dial-in numbers)</span>
                </label>
                <textarea
                  id="meetingInstructions"
                  name="meetingInstructions"
                  rows={6}
                  defaultValue={course?.meetingInstructions ?? ""}
                  placeholder={"e.g.\n腾讯会议\nMeeting ID: 705-8719-2706\n\n+86 755 3655 0000,,70587192706"}
                  className={inputCls}
                />
                <p className="mt-1 text-xs text-stone-500">
                  Free-form text shown alongside the meeting link in the
                  calendar invite and confirmation email.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-stone-900">Schedule</h2>
        <p className="mt-1 text-xs text-stone-500">
          Leave blank for hourly / on-demand courses. Otherwise build the
          repeat rule below, Google-Calendar style.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="startDate" className={labelCls}>First class date</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="startTime" className={labelCls}>Start time</label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="sessionMinutes" className={labelCls}>Session length (min)</label>
            <input
              id="sessionMinutes"
              name="sessionMinutes"
              type="number"
              min="15"
              step="5"
              value={sessionMinutes}
              onChange={(e) => setSessionMinutes(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-stone-900">Repeat</h3>
            <p className="text-xs text-stone-500">
              Leave counts empty for a single one-off session.
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-stone-700">Every</span>
            <input
              id="recurrenceInterval"
              name="recurrenceInterval"
              type="number"
              min="1"
              max="12"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-16 rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
            />
            <span className="text-stone-700">
              {Number(interval) === 1 ? "week" : "weeks"}
            </span>
            <span className="text-stone-500">on</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {["S", "M", "T", "W", "T", "F", "S"].map((letter, idx) => {
              const active = weekdays.includes(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  aria-pressed={active}
                  aria-label={`Toggle ${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][idx]}`}
                  onClick={() => {
                    setManualWeekdays(true);
                    setWeekdays((prev) =>
                      prev.includes(idx)
                        ? prev.filter((w) => w !== idx)
                        : [...prev, idx].sort((a, b) => a - b)
                    );
                  }}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    active
                      ? "bg-stone-900 text-white shadow-sm"
                      : "border border-stone-300 bg-white text-stone-500 hover:bg-stone-100"
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
          {/* Serialize weekdays as hidden inputs so the server action can read them */}
          {weekdays.map((w) => (
            <input key={w} type="hidden" name="recurrenceWeekdays" value={w} />
          ))}

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-stone-900">Ends</legend>
            <div className="mt-2 flex flex-col gap-2">
              <label className="inline-flex items-center gap-3 text-sm text-stone-700">
                <input
                  type="radio"
                  name="endMode"
                  value="count"
                  checked={endMode === "count"}
                  onChange={() => setEndMode("count")}
                  className="h-4 w-4 accent-stone-900"
                />
                <span className="whitespace-nowrap">After</span>
                <input
                  name="sessionCount"
                  type="number"
                  min="1"
                  max="200"
                  value={sessionCount}
                  onChange={(e) => setSessionCount(e.target.value)}
                  onFocus={() => setEndMode("count")}
                  className="w-20 rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
                <span className="whitespace-nowrap text-stone-500">classes</span>
              </label>
              <label className="inline-flex items-center gap-3 text-sm text-stone-700">
                <input
                  type="radio"
                  name="endMode"
                  value="date"
                  checked={endMode === "date"}
                  onChange={() => setEndMode("date")}
                  className="h-4 w-4 accent-stone-900"
                />
                <span className="whitespace-nowrap">On</span>
                <input
                  name="recurrenceEndDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  onFocus={() => setEndMode("date")}
                  className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </label>
            </div>
          </fieldset>

          <div className="mt-5">
            <label htmlFor="skipDates" className="block text-sm font-medium text-stone-700">
              Skip dates <span className="text-stone-400">(comma-separated YYYY-MM-DD — for holiday breaks or one-off cancellations)</span>
            </label>
            <input
              id="skipDates"
              name="skipDates"
              type="text"
              value={skipDatesRaw}
              onChange={(e) => setSkipDatesRaw(e.target.value)}
              placeholder="2026-10-13, 2026-11-27"
              className={inputCls}
            />
          </div>

          <div className="mt-5">
            <label htmlFor="sessionTimes" className="block text-sm font-medium text-stone-700">
              Additional times same day <span className="text-stone-400">(comma-separated HH:mm — e.g. &ldquo;15:00, 17:00&rdquo;)</span>
            </label>
            <input
              id="sessionTimes"
              name="sessionTimes"
              type="text"
              value={sessionTimesRaw}
              onChange={(e) => setSessionTimesRaw(e.target.value)}
              placeholder="15:00, 17:00"
              className={inputCls}
            />
            <p className="mt-1 text-xs text-stone-500">
              For classes offered in multiple back-to-back slots on the same
              weekday. Each slot appears as its own session on the calendar.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            Auto-derived from these schedule fields
          </p>
          <p className="mt-1 text-sm font-medium text-stone-800">
            {previewDuration}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            This is what the Duration label defaults to when left blank. Set a
            custom value in the &ldquo;Duration label&rdquo; field above to
            override it (a warning will show if the two disagree).
          </p>
        </div>
      </section>

      {state.error && (
        <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 mt-4 flex flex-col-reverse items-center justify-between gap-3 border-t border-stone-200 bg-stone-100/95 px-4 py-3 backdrop-blur-sm sm:mx-0 sm:flex-row sm:rounded-xl sm:border sm:border-stone-200 sm:bg-white sm:px-4 sm:shadow-sm">
        <Link href="/admin" className="text-sm text-stone-600 hover:text-stone-900">
          ← Back to courses
        </Link>
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}
