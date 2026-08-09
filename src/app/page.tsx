import Link from "next/link";
import Hero from "@/components/ui/Hero";
import SectionHeading from "@/components/ui/SectionHeading";
import BrushDivider from "@/components/ui/BrushDivider";
import CourseCard from "@/components/courses/CourseCard";
import EventCard from "@/components/events/EventCard";
import NewsletterSignup from "@/components/newsletter/NewsletterSignup";
import { getFeaturedCourses } from "@/data/courses";
import { getUpcomingEvents } from "@/data/events";
import { Category } from "@/types";

export const dynamic = "force-dynamic";

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
    color: "from-stone-800 via-slate-800 to-stone-900",
    glow: "shadow-slate-900/30",
  },
  {
    category: "painting",
    label: "Painting",
    labelCn: "绘画",
    color: "from-amber-800 via-orange-900 to-stone-900",
    glow: "shadow-amber-900/30",
  },
  {
    category: "ceramic",
    label: "Ceramic",
    labelCn: "陶艺",
    color: "from-emerald-800 via-stone-800 to-emerald-900",
    glow: "shadow-emerald-900/30",
  },
];

export default async function HomePage() {
  const featuredCourses = await getFeaturedCourses();
  const upcomingEvents = getUpcomingEvents().slice(0, 3);

  return (
    <>
      <Hero />

      {/* Categories */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-100 via-amber-50/40 to-stone-50 py-12 sm:py-16 md:py-20">
        <div className="pointer-events-none absolute -left-40 top-20 h-[28rem] w-[28rem] rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 bottom-20 h-[28rem] w-[28rem] rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Explore Our Art Forms"
            subtitle="From pencil to clay, find the medium that speaks to you"
          />
          <BrushDivider />
          <div className="mt-8 grid gap-4 sm:gap-6 md:grid-cols-3">
            {categoryCards.map((cat) => (
              <Link
                key={cat.category}
                href={`/courses?category=${cat.category}`}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.color} p-6 text-white shadow-lg sm:p-8 ${cat.glow} transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl`}
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
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-50 via-amber-50/50 to-stone-100 py-12 sm:py-16 md:py-20">
        <div className="pointer-events-none absolute -left-40 top-20 h-[28rem] w-[28rem] rounded-full bg-orange-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 bottom-20 h-[28rem] w-[28rem] rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 top-1/2 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Featured Courses"
            subtitle="Our most popular courses hand-picked for you"
          />
          <BrushDivider />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {featuredCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/courses"
              className="inline-flex items-center rounded-lg border border-stone-400/70 bg-white/70 px-6 py-3 text-sm font-semibold text-stone-800 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-amber-700/70 hover:bg-white hover:shadow-lg hover:shadow-amber-900/15"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-100 via-amber-50/50 to-stone-50 py-16 sm:py-20">
        <div className="pointer-events-none absolute -left-40 top-20 h-[28rem] w-[28rem] rounded-full bg-emerald-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 bottom-20 h-[28rem] w-[28rem] rounded-full bg-orange-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
              className="inline-flex items-center rounded-lg border border-stone-400/70 bg-white/70 px-6 py-3 text-sm font-semibold text-stone-800 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-amber-700/70 hover:bg-white hover:shadow-lg hover:shadow-amber-900/15"
            >
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* Keep in Touch */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-50 via-amber-50/50 to-stone-100 py-12 sm:py-16 md:py-20">
        <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <NewsletterSignup />
        </div>
      </section>
    </>
  );
}
