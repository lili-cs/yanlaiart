import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { getCourseBySlug } from "@/data/courses";
import {
  formatPrice,
  formatTimeSlot,
  formatWeeklyRange,
  weekdayPlural,
} from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import BookingButton from "@/components/courses/BookingButton";

interface Props {
  params: Promise<{ slug: string }>;
}

// Courses are admin-editable; render each detail page at request time so new
// courses appear without requiring a redeploy.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Course Not Found" };
  return {
    title: course.title,
    description: course.description,
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-stone-100 via-amber-50/40 to-stone-50 py-12 sm:py-16 md:py-20">
      <div className="pointer-events-none absolute -left-40 top-20 h-[28rem] w-[28rem] rounded-full bg-amber-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/courses"
          className="mb-6 inline-flex items-center text-sm text-stone-600 hover:text-rose-900"
        >
          &larr; Back to Courses
        </Link>

        <div className="overflow-hidden rounded-2xl border border-stone-300/70 bg-stone-50/95 shadow-xl shadow-stone-500/15 backdrop-blur-sm">
          <div className="relative aspect-[16/10] overflow-hidden bg-stone-200 sm:aspect-[2/1]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={course.imageUrl}
              alt={course.title}
              className="h-full w-full object-contain"
            />
          </div>

          <div className="p-5 sm:p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge category={course.category} />
              <span className="text-sm font-medium text-stone-600">{course.level}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-sm font-medium ${
                  course.format === "online"
                    ? "bg-slate-200 text-slate-800"
                    : "bg-amber-100 text-amber-900"
                }`}
              >
                {course.format === "online" ? "Online" : "In-Person"}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-sm font-medium ${
                  course.status === "open"
                    ? "bg-emerald-100 text-emerald-900"
                    : course.status === "cancelled"
                      ? "bg-red-100 text-red-900"
                      : "bg-orange-100 text-orange-900"
                }`}
              >
                {course.status === "open"
                  ? "Open Now"
                  : course.status === "cancelled"
                    ? "Cancelled"
                    : "Upcoming"}
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">
              {course.title}
            </h1>
            <p className="mt-1 text-base text-stone-500 sm:text-lg">
              {course.titleCn}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              <div className="rounded-xl border border-stone-300/70 bg-gradient-to-br from-stone-50 to-amber-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-rose-700/80">
                  Price
                </p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {formatPrice(course.price)}
                  {course.priceUnit === "hourly" && (
                    <span className="text-base font-normal text-rose-700/70">
                      /hour
                    </span>
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-stone-300/70 bg-gradient-to-br from-stone-50 to-amber-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-rose-700/80">
                  Duration
                </p>
                <p className="mt-1 text-base font-bold text-gray-900 sm:text-lg">
                  {course.duration}
                </p>
              </div>
              <div className="rounded-xl border border-stone-300/70 bg-gradient-to-br from-stone-50 to-amber-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-rose-700/80">
                  Format
                </p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {course.format === "online" ? "Online" : "In-Person"}
                </p>
              </div>
              <div className="rounded-xl border border-stone-300/70 bg-gradient-to-br from-stone-50 to-amber-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-rose-700/80">
                  Class Size
                </p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {course.maxStudents
                    ? `Max ${course.maxStudents}`
                    : "No limit"}
                </p>
                {course.minStudents && (
                  <p className="mt-0.5 text-xs text-stone-500">
                    Opens with {course.minStudents}+ students
                  </p>
                )}
              </div>
            </div>

            {/* Schedule — redesigned. Single source of truth for all timing info. */}
            <div className="mt-8 overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/60 via-stone-50 to-stone-50 shadow-sm">
              <div className="flex items-center gap-2 border-b border-amber-200/70 bg-white/60 px-5 py-3 sm:px-6">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-amber-800"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-900">
                  Schedule
                </h2>
              </div>

              {course.status === "cancelled" ? (
                <div className="px-5 py-6 text-sm text-stone-700 sm:px-6">
                  This course has been cancelled.
                </div>
              ) : course.startDate &&
                course.startTime &&
                course.sessionCount ? (
                <div className="flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-start sm:gap-8 sm:px-6">
                  {/* Prominent left column: when + time */}
                  <div className="sm:min-w-[10rem]">
                    <p className="text-2xl font-bold text-stone-900 sm:text-3xl">
                      {weekdayPlural(course.startDate)}
                    </p>
                    <p className="mt-1 text-base font-medium text-amber-900 tabular-nums sm:text-lg">
                      {[course.startTime, ...(course.sessionTimes ?? [])]
                        .map((t) =>
                          formatTimeSlot(t, course.sessionMinutes ?? 60)
                        )
                        .join(course.sessionTimes?.length ? " · " : "")}
                    </p>
                  </div>

                  {/* Right column: everything else */}
                  <div className="flex-1 space-y-1.5 text-sm text-stone-700 sm:border-l sm:border-amber-200/70 sm:pl-8">
                    <p>
                      <span className="font-semibold text-stone-900">
                        {formatWeeklyRange(
                          course.startDate,
                          course.sessionCount
                        )}
                      </span>
                    </p>
                    <p>
                      {course.sessionCount} week
                      {course.sessionCount === 1 ? "" : "s"} ·{" "}
                      {course.sessionMinutes ?? 60} min per class
                      {course.sessionTimes?.length
                        ? ` · ${course.sessionTimes.length + 1} slots each ${weekdayPlural(course.startDate).slice(0, -1)}`
                        : ""}
                    </p>
                    {course.minStudents && (
                      <p className="text-stone-600">
                        Opens with {course.minStudents}+ students enrolled
                      </p>
                    )}
                    {course.format === "online" ? (
                      <p className="pt-1 text-teal-800">
                        Online · meeting link arrives with your booking
                      </p>
                    ) : (
                      <p className="pt-1 text-stone-600">
                        In-person at the studio
                      </p>
                    )}
                  </div>
                </div>
              ) : course.status === "open" ? (
                // Open + no fixed schedule → book on demand (free trial,
                // hourly ceramics).
                <div className="flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-start sm:gap-8 sm:px-6">
                  <div className="sm:min-w-[10rem]">
                    <p className="text-2xl font-bold text-stone-900 sm:text-3xl">
                      Book any time
                    </p>
                    <p className="mt-1 text-sm text-amber-900">
                      Pick a date &amp; time when you book.
                    </p>
                  </div>
                  <div className="flex-1 space-y-1.5 text-sm text-stone-700 sm:border-l sm:border-amber-200/70 sm:pl-8">
                    <p>
                      <span className="font-semibold text-stone-900">
                        {course.priceUnit === "hourly"
                          ? "Book by the hour"
                          : `${course.sessionMinutes ?? 60}-min session`}
                      </span>
                    </p>
                    {course.minStudents && (
                      <p className="text-stone-600">
                        Runs with {course.minStudents}+ students
                      </p>
                    )}
                    {course.format === "online" ? (
                      <p className="pt-1 text-teal-800">
                        Online · meeting link arrives with your booking
                      </p>
                    ) : (
                      <p className="pt-1 text-stone-600">
                        In-person at the studio
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                // Upcoming, not yet scheduled.
                <div className="px-5 py-6 sm:px-6">
                  <p className="text-xl font-semibold text-stone-900 sm:text-2xl">
                    Schedule to be announced
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    Follow us or subscribe below to be notified when this
                    course opens for enrollment.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900">
                About This Course
              </h2>
              <p className="mt-3 leading-relaxed text-gray-700">
                {course.longDescription}
              </p>
            </div>

            <div className="mt-8 border-t border-stone-300/70 pt-8">
              {course.format === "online" && course.status === "open" && (
                <div className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
                  <p>
                    <span className="font-semibold">Online course.</span> After
                    booking, you&apos;ll receive a calendar invite with the
                    meeting link — just click it from your calendar at class
                    time.
                  </p>
                  {course.meetingInstructions && (
                    <details className="mt-2 group">
                      <summary className="cursor-pointer text-xs font-semibold text-teal-800 hover:text-teal-900">
                        Meeting details
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-teal-900">
                        {course.meetingInstructions}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              <Suspense fallback={null}>
                <BookingButton
                  itemType="course"
                  itemSlug={course.slug}
                  disabled={course.status !== "open"}
                  disabledMessage={
                    course.status === "cancelled"
                      ? "This course has been cancelled. Contact us if you have any questions."
                      : course.status !== "open"
                        ? "This course isn't open for booking yet. Follow us or check back soon for enrollment."
                        : undefined
                  }
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
