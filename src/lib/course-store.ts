import { Course, Category } from "@/types";
import { COURSE_SEED } from "@/data/courses.seed";
import { formatCourseDuration } from "./utils";
import { readStore, updateStore } from "./store";

/**
 * Overlay the derived duration only when the stored one is blank — so a
 * course whose admin left the field empty still gets a sensible label, but
 * any admin-entered custom text (even if it disagrees with the schedule)
 * is preserved verbatim.
 */
function derive(c: Course): Course {
  if (c.duration && c.duration.trim()) return c;
  return { ...c, duration: formatCourseDuration(c) };
}

const KEY = "courses";

async function loadAllRaw(): Promise<Course[]> {
  const existing = await readStore<Course[]>(KEY);
  if (existing && Array.isArray(existing)) return existing;
  // Seed atomically — if two cold starts race, only one wins the write.
  return updateStore<Course[]>(KEY, (current) => {
    if (Array.isArray(current)) return current;
    return COURSE_SEED;
  });
}

async function loadAll(): Promise<Course[]> {
  const all = await loadAllRaw();
  return all.filter((c) => !c.deletedAt);
}

/* Public reads (exclude trashed) ------------------------------------- */

export async function getAllCourses(): Promise<Course[]> {
  const all = await loadAll();
  return all.map(derive);
}

export async function getCourseBySlug(slug: string): Promise<Course | undefined> {
  const all = await loadAll();
  const c = all.find((c) => c.slug === slug);
  return c ? derive(c) : undefined;
}

export async function getCoursesByCategory(category: Category): Promise<Course[]> {
  const all = await loadAll();
  return all.filter((c) => c.category === category).map(derive);
}

export async function getFeaturedCourses(): Promise<Course[]> {
  const all = await loadAll();
  return all.filter((c) => c.featured).map(derive);
}

/* Admin — including trashed ----------------------------------------- */

export async function getDeletedCourses(): Promise<Course[]> {
  const all = await loadAllRaw();
  return all
    .filter((c) => c.deletedAt)
    .map(derive)
    .sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));
}

export async function getCourseBySlugIncludingDeleted(
  slug: string
): Promise<Course | undefined> {
  const all = await loadAllRaw();
  const c = all.find((c) => c.slug === slug);
  return c ? derive(c) : undefined;
}

/* Admin CRUD --------------------------------------------------------- */

export async function createCourse(course: Course): Promise<void> {
  await updateStore<Course[]>(KEY, (current) => {
    const all = Array.isArray(current) ? current : COURSE_SEED;
    if (all.some((c) => c.slug === course.slug && !c.deletedAt)) {
      throw new Error("A course with that slug already exists.");
    }
    // If a trashed course had the same slug, replace it entirely.
    const without = all.filter((c) => c.slug !== course.slug);
    return [...without, course];
  });
}

export async function updateCourse(
  slug: string,
  patch: Partial<Course>
): Promise<Course> {
  let next!: Course;
  await updateStore<Course[]>(KEY, (current) => {
    const all = Array.isArray(current) ? current : COURSE_SEED;
    const idx = all.findIndex((c) => c.slug === slug);
    if (idx === -1) throw new Error("Course not found.");
    next = { ...all[idx], ...patch, slug };
    const updated = [...all];
    updated[idx] = next;
    return updated;
  });
  return next;
}

/** Soft-delete: mark as deleted so it can be restored from the trash. */
export async function deleteCourse(slug: string): Promise<void> {
  await updateCourse(slug, { deletedAt: Date.now() });
}

/** Reverse a soft-delete. */
export async function restoreCourse(slug: string): Promise<void> {
  await updateStore<Course[]>(KEY, (current) => {
    const all = Array.isArray(current) ? current : COURSE_SEED;
    const idx = all.findIndex((c) => c.slug === slug);
    if (idx === -1) throw new Error("Course not found.");
    const next = { ...all[idx] };
    delete next.deletedAt;
    const updated = [...all];
    updated[idx] = next;
    return updated;
  });
}

/** Hard delete — cannot be undone. */
export async function purgeCourse(slug: string): Promise<void> {
  await updateStore<Course[]>(KEY, (current) => {
    const all = Array.isArray(current) ? current : COURSE_SEED;
    return all.filter((c) => c.slug !== slug);
  });
}
