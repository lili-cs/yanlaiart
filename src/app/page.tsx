import Link from "next/link";
import Hero from "@/components/ui/Hero";
import SectionHeading from "@/components/ui/SectionHeading";
import CourseCard from "@/components/courses/CourseCard";
import EventCard from "@/components/events/EventCard";
import { getFeaturedCourses } from "@/data/courses";
import { getUpcomingEvents } from "@/data/events";
import { Category } from "@/types";

const categoryCards: { category: Category; label: string; labelCn: string; color: string }[] = [
  { category: "drawing", label: "Drawing", labelCn: "素描", color: "from-blue-500 to-blue-600" },
  { category: "painting", label: "Painting", labelCn: "绘画", color: "from-amber-500 to-amber-600" },
  { category: "ceramic", label: "Ceramic", labelCn: "陶艺", color: "from-green-500 to-green-600" },
];

export default function HomePage() {
  const featuredCourses = getFeaturedCourses();
  const upcomingEvents = getUpcomingEvents().slice(0, 3);

  return (
    <>
      <Hero />

      {/* Categories */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Explore Our Art Forms"
            subtitle="From pencil to clay, find the medium that speaks to you"
          />
          <div className="grid gap-6 sm:grid-cols-3">
            {categoryCards.map((cat) => (
              <Link
                key={cat.category}
                href={`/courses?category=${cat.category}`}
                className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${cat.color} p-8 text-white shadow-md transition-shadow hover:shadow-lg`}
              >
                <h3 className="text-2xl font-bold">{cat.label}</h3>
                <p className="mt-1 text-white/80">{cat.labelCn}</p>
                <p className="mt-3 text-sm text-white/90">
                  View courses &rarr;
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Featured Courses"
            subtitle="Our most popular courses hand-picked for you"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/courses"
              className="inline-flex items-center rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Upcoming Events"
            subtitle="Workshops, open studios, and community gatherings"
          />
          <div className="space-y-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/events"
              className="inline-flex items-center rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
            >
              View All Events
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
