import Link from "next/link";
import { ArtEvent } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";

interface EventCardProps {
  event: ArtEvent;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md sm:flex-row"
    >
      <div className="aspect-[16/10] w-full overflow-hidden bg-gray-100 sm:aspect-auto sm:w-72 sm:shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.imageUrl}
          alt={event.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 text-sm font-medium text-rose-600">
          {formatDate(event.date)} &middot; {event.time}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700">
          {event.title}
        </h3>
        <p className="text-sm text-gray-500">{event.titleCn}</p>
        <p className="mt-2 flex-1 text-sm text-gray-600 line-clamp-2">
          {event.description}
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span>{event.location}</span>
          <span className="font-semibold text-gray-900">
            {event.price === 0 ? "Free" : formatPrice(event.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
