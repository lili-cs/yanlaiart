import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import CalendarView from "@/components/calendar/CalendarView";
import { getAllCalendarItems, getUnscheduledOpenCourses } from "@/lib/schedule";

export const metadata: Metadata = {
  title: "Calendar",
  description:
    "See all upcoming Yan Lai Art courses and events on one calendar. Click any session to view details and book.",
};

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const [items, openHourly] = await Promise.all([
    getAllCalendarItems(),
    getUnscheduledOpenCourses(),
  ]);

  return (
    <>
      <PageHero
        title="Calendar"
        subtitle="Every course session and event on one page"
        backgroundImage="/images/yichen-flower.jpg"
      />
      <div className="relative overflow-hidden bg-gradient-to-b from-stone-100 via-amber-50/40 to-stone-50 py-12 sm:py-16 md:py-20">
        <div className="pointer-events-none absolute -left-40 top-20 h-[28rem] w-[28rem] rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-20 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <CalendarView items={items} />

          {openHourly.length > 0 && (
            <div className="mt-10 rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-semibold text-emerald-900 sm:text-lg">
                Book on demand
              </h2>
              <p className="mt-1 text-sm text-emerald-800/90">
                These open sessions don&apos;t follow a fixed schedule — pick
                any date and time when you book.
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {openHourly.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/courses/${c.slug}`}
                      className="flex flex-col rounded-xl border border-emerald-200 bg-white p-3 shadow-sm transition-colors hover:border-emerald-400 hover:bg-emerald-50"
                    >
                      <span className="text-sm font-semibold text-stone-900">
                        {c.title}
                      </span>
                      <span className="mt-0.5 text-xs text-stone-500">
                        {c.titleCn} · {c.duration}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
