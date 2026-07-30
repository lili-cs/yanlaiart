import type { Metadata } from "next";
import EventCard from "@/components/events/EventCard";
import PageHero from "@/components/ui/PageHero";
import { getAllEvents } from "@/data/events";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming art events, workshops, and community gatherings at Yan Lai Art.",
};

export default function EventsPage() {
  const events = getAllEvents();

  return (
    <>
      <PageHero
        title="Upcoming Events"
        subtitle="Holiday workshops, seasonal gatherings, and celebrations in clay"
      />
      <div className="relative overflow-hidden bg-gradient-to-b from-stone-100 via-amber-50/40 to-stone-50 py-16 sm:py-20">
        {/* Mineral pigment washes on rice paper */}
        <div className="pointer-events-none absolute -left-40 top-20 h-[28rem] w-[28rem] rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-20 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 bottom-40 h-72 w-72 rounded-full bg-stone-300/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {events.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
