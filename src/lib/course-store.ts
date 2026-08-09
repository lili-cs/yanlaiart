import { Course, Category } from "@/types";
import { COURSE_SEED } from "@/data/courses.seed";
import { readStore, writeStore } from "./store";

const KEY = "courses";

async function loadAllRaw(): Promise<Course[]> {
  const existing = await readStore<Course[]>(KEY);
  if (existing && Array.isArray(existing)) return existing;
  await writeStore(KEY, COURSE_SEED);
  return COURSE_SEED;
}

async function loadAll(): Promise<Course[]> {
  const all = await loadAllRaw();
  return all.filter((c) => !c.deletedAt);
}

async function saveAll(courses: Course[]): Promise<void> {
  await writeStore(KEY, courses);
}

/* Public reads (exclude trashed) ------------------------------------- */

export async function getAllCourses(): Promise<Course[]> {
  return loadAll();
}

export async function getCourseBySlug(slug: string): Promise<Course | undefined> {
  const all = await loadAll();
  return all.find((c) => c.slug === slug);
}

export async function getCoursesByCategory(category: Category): Promise<Course[]> {
  const all = await loadAll();
  return all.filter((c) => c.category === category);
}

export async function getFeaturedCourses(): Promise<Course[]> {
  const all = await loadAll();
  return all.filter((c) => c.featured);
}

/* Admin — including trashed ----------------------------------------- */

export async function getDeletedCourses(): Promise<Course[]> {
  const all = await loadAllRaw();
  return all
    .filter((c) => c.deletedAt)
    .sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));
}

export async function getCourseBySlugIncludingDeleted(
  slug: string
): Promise<Course | undefined> {
  const all = await loadAllRaw();
  return all.find((c) => c.slug === slug);
}

/* Admin CRUD --------------------------------------------------------- */

export async function createCourse(course: Course): Promise<void> {
  const all = await loadAllRaw();
  if (all.some((c) => c.slug === course.slug && !c.deletedAt)) {
    throw new Error("A course with that slug already exists.");
  }
  // If a trashed course had the same slug, replace it entirely.
  const without = all.filter((c) => c.slug !== course.slug);
  await saveAll([...without, course]);
}

export async function updateCourse(
  slug: string,
  patch: Partial<Course>
): Promise<Course> {
  const all = await loadAllRaw();
  const idx = all.findIndex((c) => c.slug === slug);
  if (idx === -1) throw new Error("Course not found.");
  const next: Course = { ...all[idx], ...patch, slug };
  const updated = [...all];
  updated[idx] = next;
  await saveAll(updated);
  return next;
}

/** Soft-delete: mark as deleted so it can be restored from the trash. */
export async function deleteCourse(slug: string): Promise<void> {
  await updateCourse(slug, { deletedAt: Date.now() });
}

/** Reverse a soft-delete. */
export async function restoreCourse(slug: string): Promise<void> {
  const all = await loadAllRaw();
  const idx = all.findIndex((c) => c.slug === slug);
  if (idx === -1) throw new Error("Course not found.");
  const next = { ...all[idx] };
  delete next.deletedAt;
  const updated = [...all];
  updated[idx] = next;
  await saveAll(updated);
}

/** Hard delete — cannot be undone. */
export async function purgeCourse(slug: string): Promise<void> {
  const all = await loadAllRaw();
  await saveAll(all.filter((c) => c.slug !== slug));
}
