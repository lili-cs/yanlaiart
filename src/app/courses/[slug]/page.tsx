import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllCourses, getCourseBySlug } from "@/data/courses";
import { formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import BookingButton from "@/components/courses/BookingButton";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllCourses().map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return { title: "Course Not Found" };
  return {
    title: course.title,
    description: course.description,
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-stone-100 via-amber-50/40 to-stone-50 py-16 sm:py-20">
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
          <div className="relative aspect-[2/1] overflow-hidden bg-stone-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={course.imageUrl}
              alt={course.title}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900/45 via-transparent to-transparent" />
          </div>

          <div className="p-6 sm:p-8">
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
                    : "bg-orange-100 text-orange-900"
                }`}
              >
                {course.status === "open" ? "Open Now" : "Upcoming"}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              {course.title}
            </h1>
            <p className="mt-1 text-lg text-stone-500">{course.titleCn}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-stone-300/70 bg-gradient-to-br from-stone-50 to-amber-50 p-4">
                <p className="text-sm font-medium text-rose-700/80">Price</p>
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
                <p className="text-sm font-medium text-rose-700/80">Duration</p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {course.duration}
                </p>
              </div>
              <div className="rounded-xl border border-stone-300/70 bg-gradient-to-br from-stone-50 to-amber-50 p-4">
                <p className="text-sm font-medium text-rose-700/80">Format</p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {course.format === "online" ? "Online" : "In-Person"}
                </p>
              </div>
              <div className="rounded-xl border border-stone-300/70 bg-gradient-to-br from-stone-50 to-amber-50 p-4">
                <p className="text-sm font-medium text-rose-700/80">Class Size</p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  Max {course.maxStudents} students
                </p>
              </div>
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
              <BookingButton itemType="course" itemSlug={course.slug} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
