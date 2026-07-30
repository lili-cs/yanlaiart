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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-300/70 bg-stone-50/85 shadow-md shadow-stone-500/10 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-amber-700/60 hover:bg-white hover:shadow-2xl hover:shadow-amber-900/20"
    >
      {/* Mineral pigment washes on hover */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-200/0 blur-3xl transition-all duration-700 group-hover:bg-amber-300/40" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-emerald-200/0 blur-3xl transition-all duration-700 group-hover:bg-emerald-300/40" />

      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.imageUrl}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900/25 via-transparent to-transparent" />
      </div>
      <div className="relative flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge category={course.category} />
          <span className="text-xs font-medium text-stone-600">{course.level}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              course.format === "online"
                ? "bg-slate-200 text-slate-800"
                : "bg-amber-100 text-amber-900"
            }`}
          >
            {course.format === "online" ? "Online" : "In-Person"}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              course.status === "open"
                ? "bg-emerald-100 text-emerald-900"
                : "bg-orange-100 text-orange-900"
            }`}
          >
            {course.status === "open" ? "Open Now" : "Upcoming"}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-stone-900 transition-colors group-hover:text-amber-900">
          {course.title}
        </h3>
        <p className="mt-1 text-sm text-stone-500">{course.titleCn}</p>
        <p className="mt-2 flex-1 text-sm text-stone-600 line-clamp-2">
          {course.description}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
          <span className="text-lg font-bold text-stone-900">
            {formatPrice(course.price)}
            {course.priceUnit === "hourly" && (
              <span className="text-sm font-normal text-stone-500">/hour</span>
            )}
          </span>
          <span className="text-sm text-stone-600">{course.duration}</span>
        </div>
      </div>
    </Link>
  );
}
