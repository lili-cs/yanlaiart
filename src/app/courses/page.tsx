import type { Metadata } from "next";
import CourseCard from "@/components/courses/CourseCard";
import CategoryFilter from "@/components/courses/CategoryFilter";
import SectionHeading from "@/components/ui/SectionHeading";
import { getAllCourses, getCoursesByCategory } from "@/data/courses";
import { Category } from "@/types";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse drawing, painting, and ceramic art courses at Yan Lai Art. Find the perfect class for your skill level.",
};

interface Props {
  searchParams: Promise<{ category?: string }>;
}

async function CourseGrid({ searchParams }: Props) {
  const params = await searchParams;
  const validCategories: Category[] = ["drawing", "painting", "ceramic"];
  const category = validCategories.includes(params.category as Category)
    ? (params.category as Category)
    : undefined;

  const courses = category ? getCoursesByCategory(category) : getAllCourses();

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.slug} course={course} />
      ))}
    </div>
  );
}

export default async function CoursesPage(props: Props) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        title="Our Courses"
        subtitle="Drawing, painting, and ceramic art for every skill level"
      />
      <Suspense>
        <CategoryFilter />
      </Suspense>
      <Suspense>
        <CourseGrid searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
