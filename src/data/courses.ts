/**
 * Public-facing accessors for course data. These wrap the underlying
 * course-store helpers and additionally hide any course flagged as
 * `hidden: true` — so a course can be parked (hidden from index, detail,
 * calendar, home featured, and booking API) without deleting it. The admin
 * dashboard imports from `@/lib/course-store` directly and still sees
 * hidden courses, so they remain editable and toggleable.
 */
import * as store from "@/lib/course-store";
import type { Course, Category } from "@/types";

function isPublic(c: Course): boolean {
  return !c.hidden;
}

export async function getAllCourses(): Promise<Course[]> {
  const all = await store.getAllCourses();
  return all.filter(isPublic);
}

export async function getCourseBySlug(slug: string): Promise<Course | undefined> {
  const c = await store.getCourseBySlug(slug);
  return c && isPublic(c) ? c : undefined;
}

export async function getCoursesByCategory(category: Category): Promise<Course[]> {
  const all = await store.getCoursesByCategory(category);
  return all.filter(isPublic);
}

export async function getFeaturedCourses(): Promise<Course[]> {
  const all = await store.getFeaturedCourses();
  return all.filter(isPublic);
}
