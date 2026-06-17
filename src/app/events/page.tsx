import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import EventCard from "@/components/events/EventCard";
import { getAllEvents } from "@/data/events";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming art events, workshops, and community gatherings at Yan Lai Art.",
};

export default function EventsPage() {
  const events = getAllEvents();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        title="Upcoming Events"
        subtitle="Workshops, open studios, and community gatherings"
      />
      <div className="space-y-6">
        {events.map((event) => (
          <EventCard key={event.slug} event={event} />
        ))}
      </div>
    </div>
  );
}
