import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllEvents, getEventBySlug } from "@/data/events";
import { formatPrice, formatDate } from "@/lib/utils";
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
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/events"
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Back to Events
      </Link>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="aspect-[2/1] overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.imageUrl}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          <p className="mt-1 text-lg text-gray-500">{event.titleCn}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-semibold text-gray-900">
                {formatDate(event.date)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-semibold text-gray-900">{event.time}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-semibold text-gray-900">{event.location}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-semibold text-gray-900">
                {event.price === 0 ? "Free" : formatPrice(event.price)}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">
              About This Event
            </h2>
            <p className="mt-3 leading-relaxed text-gray-600">
              {event.longDescription}
            </p>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Capacity: {event.capacity} participants
          </p>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <BookingButton
              itemType="event"
              itemSlug={event.slug}
              label={event.price === 0 ? "Register (Free)" : "Register Now"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
