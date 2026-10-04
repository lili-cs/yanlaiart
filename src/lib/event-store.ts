import { ArtEvent } from "@/types";
import { EVENT_SEED } from "@/data/events.seed";
import { readStore, updateStore } from "./store";

const KEY = "events";

async function loadAll(): Promise<ArtEvent[]> {
  const existing = await readStore<ArtEvent[]>(KEY);
  if (existing && Array.isArray(existing)) return existing;
  // Seed atomically — if two cold starts race, only one wins the write.
  return updateStore<ArtEvent[]>(KEY, (current) => {
    if (Array.isArray(current)) return current;
    return EVENT_SEED;
  });
}

function byDateAsc(a: ArtEvent, b: ArtEvent): number {
  return a.date.localeCompare(b.date);
}

export async function getAllEvents(): Promise<ArtEvent[]> {
  const all = await loadAll();
  return [...all].sort(byDateAsc);
}

export async function getEventBySlug(
  slug: string
): Promise<ArtEvent | undefined> {
  const all = await loadAll();
  return all.find((e) => e.slug === slug);
}

/* Admin CRUD --------------------------------------------------------- */

export async function createEvent(event: ArtEvent): Promise<void> {
  await updateStore<ArtEvent[]>(KEY, (current) => {
    const all = Array.isArray(current) ? current : EVENT_SEED;
    if (all.some((e) => e.slug === event.slug)) {
      throw new Error("An event with that slug already exists.");
    }
    return [...all, event];
  });
}

export async function updateEvent(
  slug: string,
  patch: Partial<ArtEvent>
): Promise<ArtEvent> {
  let next!: ArtEvent;
  await updateStore<ArtEvent[]>(KEY, (current) => {
    const all = Array.isArray(current) ? current : EVENT_SEED;
    const idx = all.findIndex((e) => e.slug === slug);
    if (idx === -1) throw new Error("Event not found.");
    next = { ...all[idx], ...patch, slug };
    const updated = [...all];
    updated[idx] = next;
    return updated;
  });
  return next;
}

export async function deleteEvent(slug: string): Promise<void> {
  await updateStore<ArtEvent[]>(KEY, (current) => {
    const all = Array.isArray(current) ? current : EVENT_SEED;
    return all.filter((e) => e.slug !== slug);
  });
}
