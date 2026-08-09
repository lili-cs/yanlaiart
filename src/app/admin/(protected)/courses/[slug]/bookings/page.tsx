import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/lib/course-store";
import { getBookingsForCourse } from "@/lib/booking-store";
import {
  cancelCourseAction,
  confirmCourseAction,
  type NotifyState,
} from "../../../actions";
import NotifyComposer from "./NotifyComposer";

export const metadata: Metadata = { title: "Course bookings" };
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(hhmm: string | undefined): string {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function formatWhen(created: number): string {
  const d = new Date(created);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function CourseBookingsPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();
  const bookings = await getBookingsForCourse(slug);
  const paidCount = bookings.filter((b) => b.paymentStatus === "paid").length;
  const pendingCount = bookings.length - paidCount;

  async function boundConfirm(prev: NotifyState, fd: FormData): Promise<NotifyState> {
    "use server";
    return confirmCourseAction(slug, prev, fd);
  }
  async function boundCancel(prev: NotifyState, fd: FormData): Promise<NotifyState> {
    "use server";
    return cancelCourseAction(slug, prev, fd);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/admin" className="text-sm text-stone-500 hover:text-stone-800">
            ← All courses
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">{course.title}</h1>
          <p className="text-sm text-stone-500">
            {course.titleCn} · {paidCount} paid
            {pendingCount > 0 ? ` (${pendingCount} pending)` : ""} ·{" "}
            <span
              className={
                course.status === "open"
                  ? "text-emerald-700"
                  : course.status === "cancelled"
                    ? "text-red-700"
                    : "text-amber-700"
              }
            >
              {course.status === "open"
                ? "Open"
                : course.status === "cancelled"
                  ? "Cancelled"
                  : "Upcoming"}
            </span>
          </p>
        </div>
        <Link
          href={`/admin/courses/${slug}/edit`}
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
        >
          Edit course
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <NotifyComposer
          variant="confirm"
          action={boundConfirm}
          recipientCount={paidCount}
          slug={slug}
        />
        <NotifyComposer
          variant="cancel"
          action={boundCancel}
          recipientCount={paidCount}
          slug={slug}
        />
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-stone-900">
          Enrolled ({bookings.length})
        </h2>
        {bookings.length === 0 ? (
          <p className="rounded-xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-500">
            No one has booked this course yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full min-w-[44rem] text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Requested slot</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Booked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {bookings.map((b) => (
                  <tr key={b.id} className="align-top">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-900">
                        {b.customerName || <em className="text-stone-400">no name</em>}
                      </div>
                      <div className="text-xs text-stone-600">
                        <a href={`mailto:${b.customerEmail}`} className="text-amber-700 hover:text-amber-900">
                          {b.customerEmail}
                        </a>
                        {b.customerPhone && (
                          <span className="text-stone-500"> · {b.customerPhone}</span>
                        )}
                      </div>
                      {b.notes && (
                        <div className="mt-1 whitespace-pre-wrap text-xs text-stone-500">
                          Note: {b.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-700">
                      <div>{formatDate(b.requestedDate)}</div>
                      {b.requestedTime && (
                        <div className="text-stone-500">{formatTime(b.requestedTime)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="text-stone-700">{b.amountLabel}</div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className={
                            b.paymentStatus === "paid"
                              ? "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-900"
                              : "inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900"
                          }
                          title={
                            b.paymentStatus === "paid"
                              ? "Payment confirmed"
                              : "Student started checkout but payment hasn't been confirmed yet"
                          }
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${b.paymentStatus === "paid" ? "bg-emerald-500" : "bg-amber-500"}`}
                            aria-hidden
                          />
                          {b.paymentStatus === "paid" ? "Paid" : "Pending"}
                        </span>
                        <span className="text-stone-500">
                          {b.source === "stripe"
                            ? "Stripe"
                            : b.source === "free"
                              ? "Free"
                              : "Demo"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-500">
                      {formatWhen(b.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
