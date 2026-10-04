/**
 * Public-facing accessors for event data. Thin async wrappers over the
 * event store (Neon-backed in prod, JSON file in local dev) so admin edits
 * on /admin/events are picked up by every public page and API route.
 * The initial seed lives in `events.seed.ts` and is written on first read.
 */
import * as store from "@/lib/event-store";
import type { ArtEvent } from "@/types";

export async function getAllEvents(): Promise<ArtEvent[]> {
  return store.getAllEvents();
}

export async function getEventBySlug(
  slug: string
): Promise<ArtEvent | undefined> {
  return store.getEventBySlug(slug);
}

export async function getUpcomingEvents(): Promise<ArtEvent[]> {
  return store.getAllEvents();
}
