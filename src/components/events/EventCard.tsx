import Link from "next/link";
import { ArtEvent } from "@/types";
import { formatDate } from "@/lib/utils";

interface EventCardProps {
  event: ArtEvent;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-300/70 bg-stone-50/85 shadow-md shadow-stone-500/10 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-amber-700/60 hover:bg-white hover:shadow-2xl hover:shadow-amber-900/20 sm:flex-row"
    >
      {/* Mineral pigment washes on hover — ochre + celadon */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-200/0 blur-3xl transition-all duration-700 group-hover:bg-amber-300/50" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-emerald-200/0 blur-3xl transition-all duration-700 group-hover:bg-emerald-300/40" />

      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 sm:aspect-auto sm:w-72 sm:shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.imageUrl}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Ink wash overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent" />
      </div>
      <div className="relative flex flex-1 flex-col p-5">
        <div className="mb-1 inline-flex w-fit items-center gap-2 rounded-full border border-amber-200/60 bg-gradient-to-r from-amber-50 via-stone-50 to-emerald-50 px-3 py-1 text-xs font-semibold text-stone-700 shadow-sm shadow-stone-500/10">
          <span>{formatDate(event.date)}</span>
          <span aria-hidden className="text-stone-400">·</span>
          <span>{event.time}</span>
        </div>
        <h3 className="mt-2 text-lg font-semibold text-stone-900 transition-colors group-hover:text-amber-900">
          {event.title}
        </h3>
        <p className="text-sm text-stone-500">{event.titleCn}</p>
        <p className="mt-2 flex-1 text-sm text-stone-600 line-clamp-2">
          {event.description}
        </p>
        <div className="mt-4 border-t border-stone-200 pt-4 text-sm text-stone-500">
          <span className="truncate">{event.location}</span>
        </div>
      </div>
    </Link>
  );
}
