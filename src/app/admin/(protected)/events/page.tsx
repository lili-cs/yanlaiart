import Link from "next/link";
import type { Metadata } from "next";
import { getAllEvents } from "@/lib/event-store";
import { formatPrice } from "@/lib/utils";
import DeleteEventButton from "./DeleteEventButton";

export const metadata: Metadata = { title: "Events" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ deleted?: string }>;
}

export default async function AdminEventsPage({ searchParams }: Props) {
  const [events, params] = await Promise.all([getAllEvents(), searchParams]);
  const deletedSlug = params.deleted;

  return (
    <div>
      {deletedSlug && (
        <div className="mb-4 rounded-lg border border-stone-300 bg-stone-100 px-4 py-3 text-sm text-stone-700">
          Deleted <strong>{deletedSlug}</strong>.
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Events</h1>
          <p className="mt-1 text-sm text-stone-600">
            {events.length} event{events.length === 1 ? "" : "s"} — holiday
            workshops, seasonal gatherings, one-off celebrations.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800"
        >
          + New event
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[48rem] text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {events.map((e) => (
              <tr
                key={e.slug}
                className="group align-top transition-colors hover:bg-rose-50"
              >
                <td className="relative px-4 py-3 before:absolute before:inset-y-0 before:left-0 before:w-0 before:bg-rose-500 before:transition-all before:duration-200 group-hover:before:w-1.5">
                  <div className="font-semibold text-stone-900 group-hover:text-rose-900">
                    {e.title}
                  </div>
                  <div className="text-xs text-stone-500">{e.titleCn}</div>
                  {e.meetingUrl && (
                    <div className="mt-1 truncate text-xs text-teal-700">
                      {e.meetingUrl}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-stone-700">
                  <div>{e.date}</div>
                  <div className="text-stone-500">{e.time}</div>
                </td>
                <td className="px-4 py-3 text-xs text-stone-700">{e.location}</td>
                <td className="px-4 py-3 text-stone-700">
                  {e.price === 0 ? (
                    <span className="text-emerald-700">Free</span>
                  ) : (
                    formatPrice(e.price)
                  )}
                </td>
                <td className="px-4 py-3 text-stone-700">{e.capacity}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={`/events/${e.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-9 items-center justify-center rounded-md border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
                    >
                      View ↗
                    </a>
                    <Link
                      href={`/admin/events/${e.slug}/edit`}
                      className="inline-flex min-h-9 items-center justify-center rounded-md border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
                    >
                      Edit
                    </Link>
                    <DeleteEventButton slug={e.slug} title={e.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
