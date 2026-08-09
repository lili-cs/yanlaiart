import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900/45 via-transparent to-transparent" />
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

            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <div className="rounded-xl border border-stone-300/70 bg-gradient-to-br from-stone-50 to-amber-50 p-3 sm:p-4">
                <p className="text-sm font-medium text-rose-700/80">Price</p>
                <p className="mt-1 text-base font-bold text-gray-900 sm:text-lg lg:text-xl">
                  {formatPrice(course.price)}
                  {course.priceUnit === "hourly" && (
                    <span className="text-base font-normal text-rose-700/70">
                      /hour
                    </span>
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-stone-300/70 bg-gradient-to-br from-stone-50 to-amber-50 p-3 sm:p-4">
                <p className="text-sm font-medium text-rose-700/80">Duration</p>
                <p className="mt-1 text-base font-bold text-gray-900 sm:text-lg lg:text-xl">
                  {course.duration}
                </p>
              </div>
              <div className="rounded-xl border border-stone-300/70 bg-gradient-to-br from-stone-50 to-amber-50 p-3 sm:p-4">
                <p className="text-sm font-medium text-rose-700/80">Format</p>
                <p className="mt-1 text-base font-bold text-gray-900 sm:text-lg lg:text-xl">
                  {course.format === "online" ? "Online" : "In-Person"}
                </p>
              </div>
              <div className="rounded-xl border border-stone-300/70 bg-gradient-to-br from-stone-50 to-amber-50 p-3 sm:p-4">
                <p className="text-sm font-medium text-rose-700/80">Class Size</p>
                <p className="mt-1 text-base font-bold text-gray-900 sm:text-lg lg:text-xl">
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

            <div className="mt-8 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/70 to-stone-50 p-5 sm:p-6">
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
                  className="text-amber-800"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <h2 className="text-base font-semibold text-amber-900 sm:text-lg">
                  Schedule
                </h2>
              </div>
              {course.startDate && course.startTime && course.sessionCount ? (
                <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm text-stone-800 sm:grid-cols-[max-content_1fr]">
                  <dt className="text-stone-500">When</dt>
                  <dd className="font-medium">
                    {weekdayPlural(course.startDate)},{" "}
                    {formatWeeklyRange(course.startDate, course.sessionCount)}
                  </dd>
                  <dt className="text-stone-500">Time</dt>
                  <dd className="font-medium">
                    {[course.startTime, ...(course.sessionTimes ?? [])]
                      .map((t) => formatTimeSlot(t, course.sessionMinutes ?? 60))
                      .join(course.sessionTimes?.length ? " / " : "")}
                  </dd>
                  <dt className="text-stone-500">Sessions</dt>
                  <dd className="font-medium">
                    {course.sessionCount} week{course.sessionCount === 1 ? "" : "s"}
                    {course.sessionMinutes ? ` · ${course.sessionMinutes} min each` : ""}
                    {course.sessionTimes?.length
                      ? ` · ${course.sessionTimes.length + 1} slots per week`
                      : ""}
                  </dd>
                  {course.minStudents && (
                    <>
                      <dt className="text-stone-500">Opens with</dt>
                      <dd className="font-medium">
                        {course.minStudents}+ students
                      </dd>
                    </>
                  )}
                  {course.format === "online" && (
                    <>
                      <dt className="text-stone-500">Where</dt>
                      <dd className="font-medium text-teal-800">
                        Online (meeting link on booking)
                      </dd>
                    </>
                  )}
                </dl>
              ) : course.status === "cancelled" ? (
                <p className="mt-3 text-sm text-stone-700">
                  This course has been cancelled.
                </p>
              ) : (
                <p className="mt-3 text-sm text-stone-700">
                  Schedule to be announced. Follow us or subscribe below to be
                  notified when enrollment opens.
                </p>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
