import type { Metadata } from "next";
import { Suspense } from "react";
import CourseCatalog from "@/components/courses/CourseCatalog";
import PageHero from "@/components/ui/PageHero";
import { getAllCourses } from "@/data/courses";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse drawing, painting, and ceramic art courses at Yan Lai Art. Find the perfect class for your skill level.",
};

// Courses are admin-editable via Neon; always render at request time.
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function CoursesPage({ searchParams }: Props) {
  const [courses, params] = await Promise.all([getAllCourses(), searchParams]);

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
            <CourseCatalog courses={courses} initialCategory={params.category} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
