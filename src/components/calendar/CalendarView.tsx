"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CalendarItem } from "@/lib/schedule";
import { cn } from "@/lib/utils";
import MeetingDetailsButton from "./MeetingDetailsButton";

type Filter = "all" | "course" | "event";

interface Props {
  items: CalendarItem[];
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_LABELS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function isoDate(year: number, month0: number, day: number): string {
  return `${year}-${pad(month0 + 1)}-${pad(day)}`;
}

function formatTime(hhmm?: string): string {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${pad(m)} ${period}`;
}

interface DayCell {
  date: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
}

function buildMonthGrid(year: number, month0: number, todayIso: string): DayCell[] {
  const firstOfMonth = new Date(Date.UTC(year, month0, 1));
  const startWeekday = firstOfMonth.getUTCDay(); // 0-6
  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const dayOffset = i - startWeekday;
    const d = new Date(Date.UTC(year, month0, 1 + dayOffset));
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth();
    const day = d.getUTCDate();
    const iso = isoDate(y, m, day);
    cells.push({
      date: iso,
      day,
      inMonth: m === month0,
      isToday: iso === todayIso,
    });
  }
  return cells;
}

function itemStyle(item: CalendarItem): string {
  if (item.type === "event") {
    return "bg-rose-100 text-rose-900 border-rose-200 hover:bg-rose-200";
  }
  if (item.isOnline) {
    return "bg-teal-100 text-teal-900 border-teal-200 hover:bg-teal-200";
  }
  return "bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200";
}

function itemHref(item: CalendarItem): string {
  return item.type === "course" ? `/courses/${item.slug}` : `/events/${item.slug}`;
}

function enrollHref(item: CalendarItem): string {
  // Route to the course/event detail page so the user can read the full
  // details before booking; they'll click Book Now there.
  return itemHref(item);
}

export default function CalendarView({ items }: Props) {
  // Anchor the initial view on today, or on the first upcoming item's month
  // if today is before the first scheduled item.
  const today = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => {
    return isoDate(today.getFullYear(), today.getMonth(), today.getDate());
  }, [today]);

  const firstItemIso = items[0]?.date;
  const initial = useMemo(() => {
    if (firstItemIso && firstItemIso > todayIso) {
      const d = new Date(`${firstItemIso}T12:00:00Z`);
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    }
    return { year: today.getFullYear(), month: today.getMonth() };
  }, [firstItemIso, todayIso, today]);

  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [filter, setFilter] = useState<Filter>("all");

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((it) => it.type === filter);
  }, [items, filter]);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const it of filteredItems) {
      const bucket = map.get(it.date) ?? [];
      bucket.push(it);
      map.set(it.date, bucket);
    }
    return map;
  }, [filteredItems]);

  const grid = useMemo(() => buildMonthGrid(year, month, todayIso), [year, month, todayIso]);

  // Agenda list — current month's items only, chronological.
  const monthStart = isoDate(year, month, 1);
  const nextMonth0 = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const monthEnd = isoDate(nextYear, nextMonth0, 1);
  const agendaItems = useMemo(
    () =>
      filteredItems.filter((it) => it.date >= monthStart && it.date < monthEnd),
    [filteredItems, monthStart, monthEnd]
  );

  function goPrev() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }
  function goNext() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }
  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }

  const filterChips: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "course", label: "Courses" },
    { value: "event", label: "Events" },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous month"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 shadow-sm transition-colors hover:bg-stone-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 className="min-w-[10rem] text-center text-xl font-semibold text-stone-900 sm:min-w-[12rem] sm:text-2xl">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next month"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 shadow-sm transition-colors hover:bg-stone-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goToday}
            className="ml-2 inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-100"
          >
            Today
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filterChips.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => setFilter(chip.value)}
              className={cn(
                "min-h-11 rounded-full px-4 text-sm font-medium transition-colors",
                filter === chip.value
                  ? "bg-stone-900 text-white"
                  : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" aria-hidden="true" />
          In-person course
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-teal-400" aria-hidden="true" />
          Online course
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" aria-hidden="true" />
          Event
        </span>
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-stone-500">
          <span className="inline-flex items-center rounded bg-stone-900 px-1.5 text-[10px] font-semibold text-white">
            Book
          </span>
          reserve a spot ·
          <span className="inline-flex items-center gap-0.5 rounded bg-teal-600 px-1.5 text-[10px] font-semibold text-white">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
            Join
          </span>
          open the meeting ·
          <span className="inline-flex items-center rounded border border-teal-700 bg-white/60 px-1 text-[10px] font-bold text-teal-900">
            ⓘ
          </span>
          meeting details
        </span>
      </div>

      {/* Month grid — visible from md+ */}
      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-stone-300/70 bg-white shadow-sm md:block">
        <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50 text-center text-xs font-semibold uppercase tracking-wider text-stone-500">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {grid.map((cell) => {
            const dayItems = itemsByDate.get(cell.date) ?? [];
            const shown = dayItems.slice(0, 3);
            const overflow = dayItems.length - shown.length;
            return (
              <div
                key={cell.date}
                className={cn(
                  "min-h-[9rem] border-b border-r border-stone-200 p-2 last:border-r-0",
                  !cell.inMonth && "bg-stone-50/60 text-stone-400",
                  cell.inMonth && "bg-white",
                  cell.isToday && "bg-amber-50 ring-1 ring-inset ring-amber-300"
                )}
              >
                <div
                  className={cn(
                    "mb-1 flex items-center justify-between text-xs",
                    cell.isToday ? "font-semibold text-amber-900" : "text-stone-600"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1",
                      cell.isToday && "bg-amber-600 text-white"
                    )}
                  >
                    {cell.day}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {shown.map((it) => {
                    const joinable = it.isOnline && Boolean(it.meetingUrl);
                    const hasActions = joinable || it.enrollable;
                    return (
                      <div
                        key={it.id}
                        className={cn(
                          "flex flex-col overflow-hidden rounded-md border text-[11px] font-medium leading-tight",
                          itemStyle(it)
                        )}
                      >
                        <Link
                          href={itemHref(it)}
                          className="block px-1.5 py-1 transition-colors"
                          title={`${it.title}${it.startTime ? ` · ${formatTime(it.startTime)}` : ""}${it.sessionInfo ? ` · ${it.sessionInfo}` : ""}`}
                        >
                          <div className="text-[10px] font-semibold uppercase tracking-wider tabular-nums opacity-80">
                            {it.startTime ? formatTime(it.startTime) : ""}
                          </div>
                          <div className="line-clamp-2 break-words text-[11px] font-semibold">
                            {it.title}
                          </div>
                        </Link>
                        {hasActions && (
                          <div className="flex items-stretch border-t border-current/20 bg-white/50 text-[10px] font-semibold">
                            {joinable && (
                              <>
                                <MeetingDetailsButton
                                  variant="icon"
                                  courseTitle={it.title}
                                  courseHref={itemHref(it)}
                                  whenLabel={`${it.date}${it.startTime ? ` · ${formatTime(it.startTime)}` : ""}${it.endTime ? `–${formatTime(it.endTime)}` : ""}`}
                                  meetingUrl={it.meetingUrl!}
                                  meetingInstructions={it.meetingInstructions}
                                />
                                <a
                                  href={it.meetingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Join meeting"
                                  aria-label={`Join ${it.title} meeting`}
                                  className="flex flex-1 items-center justify-center gap-1 border-l border-current/20 bg-teal-600 px-1.5 py-0.5 text-white transition-colors hover:bg-teal-700"
                                >
                                  <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    aria-hidden="true"
                                  >
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                  Join
                                </a>
                              </>
                            )}
                            {it.enrollable && (
                              <Link
                                href={enrollHref(it)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Book this course"
                                aria-label={`Book ${it.title} (opens in new tab)`}
                                className={cn(
                                  "flex flex-1 items-center justify-center bg-stone-900 px-1.5 py-0.5 text-white transition-colors hover:bg-stone-800",
                                  (joinable || it.type === "event") && "border-l border-current/20"
                                )}
                              >
                                Book
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {overflow > 0 && (
                    <span className="pl-1 text-[11px] font-medium text-stone-500">
                      +{overflow} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agenda list — visible on mobile, and always as a "this month" summary on md */}
      <div className="mt-6 md:mt-8">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-600 md:hidden">
          {MONTH_NAMES[month]} agenda
        </h3>
        {agendaItems.length === 0 ? (
          <p className="rounded-xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-500">
            Nothing scheduled in {MONTH_NAMES[month]}. Use the arrows above to
            browse other months.
          </p>
        ) : (
          <ul className="space-y-2 md:hidden">
            {agendaItems.map((it) => {
              const d = new Date(`${it.date}T12:00:00Z`);
              const weekday = WEEKDAY_LABELS_LONG[d.getUTCDay()];
              const dayNum = d.getUTCDate();
              const joinable = it.isOnline && Boolean(it.meetingUrl);
              return (
                <li key={it.id}>
                  <div className="flex items-stretch gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50/40">
                    <Link
                      href={itemHref(it)}
                      className="flex min-w-0 flex-1 items-stretch gap-3"
                    >
                      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-stone-100 py-1 text-center">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                          {weekday.slice(0, 3)}
                        </span>
                        <span className="text-lg font-bold tabular-nums text-stone-900">
                          {dayNum}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-2 w-2 shrink-0 rounded-full",
                              it.type === "event"
                                ? "bg-rose-400"
                                : it.isOnline
                                  ? "bg-teal-400"
                                  : "bg-amber-400"
                            )}
                            aria-hidden="true"
                          />
                          <p className="truncate text-sm font-semibold text-stone-900">
                            {it.title}
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-stone-600">
                          {it.startTime ? `${formatTime(it.startTime)}${it.endTime ? ` – ${formatTime(it.endTime)}` : ""}` : ""}
                          {it.sessionInfo ? ` · ${it.sessionInfo}` : ""}
                          {it.isOnline ? " · Online" : ""}
                        </p>
                      </div>
                    </Link>
                    <div className="flex flex-none flex-col items-stretch gap-2">
                      {it.enrollable && (
                        <Link
                          href={enrollHref(it)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-900 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-stone-800"
                          aria-label={`Book ${it.title} (opens in new tab)`}
                        >
                          Book
                        </Link>
                      )}
                      {joinable && (
                        <>
                          <a
                            href={it.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-teal-700 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-teal-800"
                            aria-label={`Join ${it.title} meeting`}
                          >
                            Join
                          </a>
                          <MeetingDetailsButton
                            variant="text"
                            courseTitle={it.title}
                            courseHref={itemHref(it)}
                            whenLabel={`${weekday} ${dayNum}${it.startTime ? ` · ${formatTime(it.startTime)}` : ""}`}
                            meetingUrl={it.meetingUrl!}
                            meetingInstructions={it.meetingInstructions}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
