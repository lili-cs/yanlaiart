import Link from "next/link";
import type { Metadata } from "next";
import {
  getAllCourses,
  getCourseBySlugIncludingDeleted,
  getDeletedCourses,
} from "@/lib/course-store";
import { getBookingCountsByCourse } from "@/lib/booking-store";
import { formatPrice } from "@/lib/utils";
import DeleteButton from "./DeleteButton";
import PurgeButton from "./PurgeButton";
import { restoreCourseAction } from "./actions";

export const metadata: Metadata = { title: "Courses" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    undo?: string;
    restored?: string;
    purged?: string;
  }>;
}

function formatDeletedAgo(ms: number): string {
  const secs = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default async function AdminDashboard({ searchParams }: Props) {
  const [courses, bookingCounts, deleted, params] = await Promise.all([
    getAllCourses(),
    getBookingCountsByCourse(),
    getDeletedCourses(),
    searchParams,
  ]);

  const undoSlug = params.undo;
  const restoredSlug = params.restored;
  const justPurged = params.purged === "1";

  // Look up the title of the just-deleted course for the banner.
  const undoCourse = undoSlug
    ? await getCourseBySlugIncludingDeleted(undoSlug)
    : undefined;

  return (
    <div>
      {undoCourse && (
        <form
          action={restoreCourseAction}
          className="mb-4 flex flex-col gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between"
        >
          <input type="hidden" name="slug" value={undoCourse.slug} />
          <div className="flex items-center gap-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            </svg>
            <span>
              <strong>{undoCourse.title}</strong> deleted — moved to trash.
            </span>
          </div>
          <button
            type="submit"
            className="inline-flex min-h-10 items-center justify-center self-start rounded-md bg-amber-900 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-amber-800 sm:self-auto"
          >
            Undo
          </button>
        </form>
      )}

      {restoredSlug && (
        <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Restored — <strong>{restoredSlug}</strong> is back on the list.
        </div>
      )}

      {justPurged && (
        <div className="mb-4 rounded-lg border border-stone-300 bg-stone-100 px-4 py-3 text-sm text-stone-700">
          Course permanently deleted.
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Courses</h1>
          <p className="mt-1 text-sm text-stone-600">
            {courses.length} course{courses.length === 1 ? "" : "s"} — edit any
            row, or add a new one.
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800"
        >
          + New course
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[52rem] text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Format</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Schedule</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Bookings</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {courses.map((c) => (
              <tr key={c.slug} className="align-top">
                <td className="px-4 py-3">
                  <div className="font-semibold text-stone-900">{c.title}</div>
                  <div className="text-xs text-stone-500">{c.titleCn}</div>
                  {c.format === "online" && (
                    <div className="mt-1 truncate text-xs text-teal-700">
                      {c.meetingUrl ?? (
                        <span className="italic text-amber-800">
                          no meeting link set
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      c.format === "online"
                        ? "bg-teal-100 text-teal-900"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {c.format === "online" ? "Online" : "In-person"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      c.status === "open"
                        ? "bg-emerald-100 text-emerald-900"
                        : c.status === "cancelled"
                          ? "bg-red-100 text-red-900"
                          : "bg-stone-200 text-stone-700"
                    }`}
                  >
                    {c.status === "open"
                      ? "Open"
                      : c.status === "cancelled"
                        ? "Cancelled"
                        : "Upcoming"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-stone-700">
                  {c.startDate ? (
                    <>
                      <div>{c.startDate}</div>
                      <div className="text-stone-500">
                        {c.startTime}
                        {c.sessionCount ? ` · ${c.sessionCount} sessions` : ""}
                      </div>
                    </>
                  ) : (
                    <span className="text-stone-400">Hourly / on-demand</span>
                  )}
                </td>
                <td className="px-4 py-3 text-stone-700">
                  {formatPrice(c.price)}
                  {c.priceUnit === "hourly" && (
                    <span className="text-xs text-stone-500">/hr</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">
                  {(() => {
                    const counts = bookingCounts[c.slug] ?? {
                      paid: 0,
                      pending: 0,
                    };
                    const total = counts.paid + counts.pending;
                    return (
                      <Link
                        href={`/admin/courses/${c.slug}/bookings`}
                        className="inline-flex flex-col items-start gap-0.5 rounded-md border border-stone-300 bg-white px-2.5 py-1 font-medium text-stone-700 hover:bg-stone-100"
                      >
                        <span className="flex items-center gap-1.5">
                          <span
                            className={
                              counts.paid > 0
                                ? "text-emerald-800"
                                : total > 0
                                  ? "text-stone-600"
                                  : "text-stone-400"
                            }
                          >
                            {counts.paid} paid
                          </span>
                          <span className="text-stone-400">·</span>
                          <span className="text-stone-500">notify</span>
                        </span>
                        {counts.pending > 0 && (
                          <span className="text-[10px] font-normal text-amber-700">
                            {counts.pending} pending
                          </span>
                        )}
                      </Link>
                    );
                  })()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/courses/${c.slug}/edit`}
                      className="inline-flex min-h-9 items-center justify-center rounded-md border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
                    >
                      Edit
                    </Link>
                    <DeleteButton slug={c.slug} title={c.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleted.length > 0 && (
        <section className="mt-10">
          <details className="rounded-2xl border border-stone-200 bg-white p-1 shadow-sm">
            <summary className="cursor-pointer list-none rounded-xl px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50">
              🗑︎ Deleted courses ({deleted.length})
              <span className="ml-2 font-normal text-stone-500">
                — recover or permanently remove
              </span>
            </summary>
            <ul className="divide-y divide-stone-200 border-t border-stone-200">
              {deleted.map((c) => (
                <li
                  key={c.slug}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-medium text-stone-900">{c.title}</div>
                    <div className="text-xs text-stone-500">
                      {c.titleCn ? <>{c.titleCn} · </> : null}
                      Deleted{" "}
                      {c.deletedAt ? formatDeletedAgo(c.deletedAt) : "recently"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={restoreCourseAction}>
                      <input type="hidden" name="slug" value={c.slug} />
                      <button
                        type="submit"
                        className="inline-flex min-h-9 items-center justify-center rounded-md border border-emerald-300 bg-white px-3 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-50"
                      >
                        Restore
                      </button>
                    </form>
                    <PurgeButton slug={c.slug} title={c.title} />
                  </div>
                </li>
              ))}
            </ul>
          </details>
        </section>
      )}
    </div>
  );
}
