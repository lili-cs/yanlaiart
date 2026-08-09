import type { Metadata } from "next";
import CourseCard from "@/components/courses/CourseCard";
import CategoryFilter from "@/components/courses/CategoryFilter";
import PageHero from "@/components/ui/PageHero";
import { getAllCourses, getCoursesByCategory } from "@/data/courses";
import { Category } from "@/types";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse drawing, painting, and ceramic art courses at Yan Lai Art. Find the perfect class for your skill level.",
};

// Courses are now admin-editable via Neon, so always render at request time.
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ category?: string }>;
}

async function CourseGrid({ searchParams }: Props) {
  const params = await searchParams;
  const validCategories: Category[] = ["drawing", "painting", "ceramic"];
  const category = validCategories.includes(params.category as Category)
    ? (params.category as Category)
    : undefined;

  const courses = category
    ? await getCoursesByCategory(category)
    : await getAllCourses();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.slug} course={course} />
      ))}
    </div>
  );
}

export default async function CoursesPage(props: Props) {
  return (
    <>
      <PageHero
        title="Our Courses"
        subtitle="Drawing, painting, and ceramic art for every skill level"
        backgroundImage="/images/courses-hero.jpg"
      />
      <div className="relative overflow-hidden bg-gradient-to-b from-stone-100 via-amber-50/40 to-stone-50 py-12 sm:py-16 md:py-20">
        <div className="pointer-events-none absolute -left-40 top-20 h-[28rem] w-[28rem] rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-20 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense>
            <CategoryFilter />
          </Suspense>
          <div className="mt-8">
            <Suspense>
              <CourseGrid searchParams={props.searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
