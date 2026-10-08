import type { Metadata } from "next";
import Link from "next/link";
import EventForm from "../EventForm";
import { createEventAction } from "../../actions";

export const metadata: Metadata = { title: "New event" };

export default function NewEventPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/events"
          className="text-sm text-stone-500 hover:text-stone-800"
        >
          ← All events
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">New event</h1>
        <p className="mt-1 text-sm text-stone-500">
          Set the date, time, location, and how many participants it takes.
          Leave the meeting URL blank for in-person events.
        </p>
      </div>
      <EventForm mode="new" action={createEventAction} />
    </div>
  );
}
