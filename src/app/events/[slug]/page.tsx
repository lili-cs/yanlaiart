import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllEvents, getEventBySlug } from "@/data/events";
import { formatDate } from "@/lib/utils";
import BookingButton from "@/components/courses/BookingButton";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllEvents().map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: "Event Not Found" };
  return {
    title: event.title,
    description: event.description,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-stone-100 via-amber-50/40 to-stone-50 py-12 sm:py-16 md:py-20">
      <div className="pointer-events-none absolute -left-40 top-20 h-[28rem] w-[28rem] rounded-full bg-amber-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/events"
          className="mb-6 inline-flex items-center text-sm text-stone-600 hover:text-amber-900"
        >
          &larr; Back to Events
        </Link>

        <div className="overflow-hidden rounded-2xl border border-stone-300/70 bg-stone-50/95 shadow-xl shadow-stone-500/15 backdrop-blur-sm">
          <div className="relative aspect-[16/10] overflow-hidden bg-stone-200 sm:aspect-[2/1]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900/45 via-transparent to-transparent" />
          </div>

          <div className="p-5 sm:p-6 md:p-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {event.title}
            </h1>
            <p className="mt-1 text-base text-stone-500 sm:text-lg">
              {event.titleCn}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <div className="rounded-xl border border-stone-300/70 bg-gradient-to-br from-stone-50 to-amber-50 p-4">
                <p className="text-sm font-medium text-stone-600">Date</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {formatDate(event.date)}
                </p>
              </div>
              <div className="rounded-xl border border-stone-300/70 bg-gradient-to-br from-stone-50 to-amber-50 p-4">
                <p className="text-sm font-medium text-stone-600">Time</p>
                <p className="mt-1 font-semibold text-gray-900">{event.time}</p>
              </div>
              <div className="rounded-xl border border-stone-300/70 bg-gradient-to-br from-stone-50 to-amber-50 p-4">
                <p className="text-sm font-medium text-stone-600">Location</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {event.location}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900">
                About This Event
              </h2>
              <p className="mt-3 leading-relaxed text-gray-700">
                {event.longDescription}
              </p>
            </div>

            <p className="mt-4 text-sm text-stone-600">
              Capacity: {event.capacity} participants
            </p>

            <div className="mt-8 border-t border-stone-300/70 pt-8">
              <BookingButton
                itemType="event"
                itemSlug={event.slug}
                label="Register Now"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
