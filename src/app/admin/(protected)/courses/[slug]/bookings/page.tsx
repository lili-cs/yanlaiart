import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/lib/course-store";
import { getBookingsForCourse } from "@/lib/booking-store";
import BookingsBoard, { type EnrolledStudent } from "./BookingsBoard";

export const metadata: Metadata = { title: "Course bookings" };
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CourseBookingsPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();
  const bookings = await getBookingsForCourse(slug);
  const paidCount = bookings.filter((b) => b.paymentStatus === "paid").length;
  const pendingCount = bookings.length - paidCount;

  const students: EnrolledStudent[] = bookings.map((b) => ({
    id: b.id,
    customerName: b.customerName,
    customerEmail: b.customerEmail,
    customerPhone: b.customerPhone,
    notes: b.notes,
    requestedDate: b.requestedDate,
    requestedTime: b.requestedTime,
    amountLabel: b.amountLabel,
    paymentStatus: b.paymentStatus,
    source: b.source,
    createdAt: b.createdAt,
  }));

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

      <BookingsBoard slug={slug} students={students} />
    </div>
  );
}
