import Link from "next/link";
import Hero from "@/components/ui/Hero";
import SectionHeading from "@/components/ui/SectionHeading";
import CourseCard from "@/components/courses/CourseCard";
import EventCard from "@/components/events/EventCard";
import { getFeaturedCourses } from "@/data/courses";
import { getUpcomingEvents } from "@/data/events";
import { Category } from "@/types";

const categoryCards: {
  category: Category;
  label: string;
  labelCn: string;
  color: string;
  glow: string;
}[] = [
  {
    category: "drawing",
    label: "Drawing",
    labelCn: "素描",
    color: "from-slate-700 via-indigo-700 to-blue-800",
    glow: "shadow-blue-500/20",
  },
  {
    category: "painting",
    label: "Painting",
    labelCn: "绘画",
    color: "from-amber-600 via-rose-600 to-orange-700",
    glow: "shadow-amber-500/20",
  },
  {
    category: "ceramic",
    label: "Ceramic",
    labelCn: "陶艺",
    color: "from-emerald-700 via-teal-700 to-emerald-800",
    glow: "shadow-emerald-500/20",
  },
];

function BrushDivider() {
  return (
    <div className="mx-auto flex max-w-md items-center justify-center py-2">
      <svg
        className="h-3 w-full"
        viewBox="0 0 400 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M4 6 C 60 2, 120 10, 200 6 S 340 2, 396 6"
          stroke="url(#dividerGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        <defs>
          <linearGradient id="dividerGradient" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fcd34d" stopOpacity="0" />
            <stop offset="50%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function HomePage() {
  const featuredCourses = getFeaturedCourses();
  const upcomingEvents = getUpcomingEvents().slice(0, 3);

  return (
    <>
      <Hero />

      {/* Categories */}
      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Explore Our Art Forms"
            subtitle="From pencil to clay, find the medium that speaks to you"
          />
          <BrushDivider />
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {categoryCards.map((cat) => (
              <Link
                key={cat.category}
                href={`/courses?category=${cat.category}`}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.color} p-8 text-white shadow-lg ${cat.glow} transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl`}
              >
                {/* Painterly wash on hover */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-transform duration-700 group-hover:scale-150" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-transform duration-700 group-hover:scale-150" />

                <div className="relative">
                  <h3 className="text-2xl font-bold tracking-tight">{cat.label}</h3>
                  <p className="mt-1 text-white/80">{cat.labelCn}</p>
                  <p className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-white/95 transition-transform group-hover:translate-x-1">
                    View courses <span aria-hidden>&rarr;</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-amber-50/30 to-gray-50 py-16 sm:py-20">
        {/* Subtle painterly accents */}
        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Featured Courses"
            subtitle="Our most popular courses hand-picked for you"
          />
          <BrushDivider />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
          <BrushDivider />
          <div className="mt-8 space-y-6">
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
