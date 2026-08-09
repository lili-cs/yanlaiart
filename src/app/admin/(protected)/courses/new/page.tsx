import type { Metadata } from "next";
import Link from "next/link";
import CourseForm from "../CourseForm";
import { createCourseAction } from "../../actions";

export const metadata: Metadata = { title: "New course" };

export default function NewCoursePage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-stone-500 hover:text-stone-800"
        >
          ← All courses
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">New course</h1>
        <p className="mt-1 text-sm text-stone-500">
          Fill in the basics — you can add schedule and meeting details later.
        </p>
      </div>
      <CourseForm mode="new" action={createCourseAction} />
    </div>
  );
}
