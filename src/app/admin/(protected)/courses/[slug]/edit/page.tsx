import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/lib/course-store";
import CourseForm from "../../CourseForm";
import DeleteButton from "../../../DeleteButton";
import { updateCourseAction, type CourseActionState } from "../../../actions";

export const metadata: Metadata = { title: "Edit course" };

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditCoursePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { saved } = await searchParams;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  async function boundAction(
    prev: CourseActionState,
    fd: FormData
  ): Promise<CourseActionState> {
    "use server";
    return updateCourseAction(slug, prev, fd);
  }

  return (
    <div>
      {saved === "1" && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>
            Saved. Changes are live on the public site and calendar.
          </span>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin"
            className="text-sm text-stone-500 hover:text-stone-800"
          >
            ← All courses
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">
            {course.title}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {course.titleCn && (
              <>
                <span>{course.titleCn}</span>
                <span className="mx-2 text-stone-300">·</span>
              </>
            )}
            <span>Slug:</span>{" "}
            <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">
              {slug}
            </code>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/courses/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            View public page ↗
          </a>
          <Link
            href={`/admin/courses/${slug}/bookings`}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            Bookings
          </Link>
          <DeleteButton slug={slug} title={course.title} />
        </div>
      </div>

      <CourseForm mode="edit" course={course} action={boundAction} />
    </div>
  );
}
