import Link from "next/link";
import { Course } from "@/types";
import { formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="aspect-[16/10] overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.imageUrl}
          alt={course.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge category={course.category} />
          <span className="text-xs text-gray-500">{course.level}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              course.format === "online"
                ? "bg-blue-100 text-blue-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {course.format === "online" ? "Online" : "In-Person"}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              course.status === "open"
                ? "bg-green-100 text-green-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {course.status === "open" ? "Open Now" : "Upcoming"}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700">
          {course.title}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{course.titleCn}</p>
        <p className="mt-2 flex-1 text-sm text-gray-600 line-clamp-2">
          {course.description}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(course.price)}
            {course.priceUnit === "hourly" && (
              <span className="text-sm font-normal text-gray-500">/hour</span>
            )}
          </span>
          <span className="text-sm text-gray-500">{course.duration}</span>
        </div>
      </div>
    </Link>
  );
}
