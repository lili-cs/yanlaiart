/**
 * Courses live in a persistent store (Vercel KV in production, JSON file
 * locally) so the admin UI can edit them. The read helpers below are async;
 * update callers accordingly. Seed data lives in `./courses.seed.ts`.
 */
export {
  getAllCourses,
  getCourseBySlug,
  getCoursesByCategory,
  getFeaturedCourses,
} from "@/lib/course-store";
