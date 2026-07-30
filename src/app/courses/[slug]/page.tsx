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
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/courses"
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Back to Courses
      </Link>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="aspect-[2/1] overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={course.imageUrl}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge category={course.category} />
            <span className="text-sm text-gray-500">{course.level}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-sm font-medium ${
                course.format === "online"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {course.format === "online" ? "Online" : "In-Person"}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-sm font-medium ${
                course.status === "open"
                  ? "bg-green-100 text-green-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {course.status === "open" ? "Open Now" : "Upcoming"}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            {course.title}
          </h1>
          <p className="mt-1 text-lg text-gray-500">{course.titleCn}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Price</p>
              <p className="text-xl font-bold text-gray-900">
                {formatPrice(course.price)}
                {course.priceUnit === "hourly" && (
                  <span className="text-base font-normal text-gray-500">
                    /hour
                  </span>
                )}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Duration</p>
              <p className="text-xl font-bold text-gray-900">
                {course.duration}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Format</p>
              <p className="text-xl font-bold text-gray-900">
                {course.format === "online" ? "Online" : "In-Person"}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Class Size</p>
              <p className="text-xl font-bold text-gray-900">
                Max {course.maxStudents} students
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">
              About This Course
            </h2>
            <p className="mt-3 leading-relaxed text-gray-600">
              {course.longDescription}
            </p>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <BookingButton itemType="course" itemSlug={course.slug} />
          </div>
        </div>
      </div>
    </div>
  );
}
