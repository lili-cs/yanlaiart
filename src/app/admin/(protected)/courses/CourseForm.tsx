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
            <label htmlFor="imageUrl" className={labelCls}>Image URL</label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              defaultValue={course?.imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={inputCls}
            />
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
          Leave blank for hourly / on-demand courses. Sessions recur weekly
          from the start date.
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
          <div>
            <label htmlFor="sessionCount" className={labelCls}>Number of weeks</label>
            <input
              id="sessionCount"
              name="sessionCount"
              type="number"
              min="1"
              value={sessionCount}
              onChange={(e) => setSessionCount(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="sessionTimes" className={labelCls}>
              Additional times same day <span className="text-stone-400">(comma-separated HH:mm — e.g. &ldquo;15:00, 17:00&rdquo; for a Sunday offered at 1/3/5 PM)</span>
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
