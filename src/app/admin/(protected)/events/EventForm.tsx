"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ArtEvent } from "@/types";
import type { EventActionState } from "../actions";

const initial: EventActionState = {};

interface Props {
  mode: "new" | "edit";
  event?: ArtEvent;
  action: (prev: EventActionState, fd: FormData) => Promise<EventActionState>;
}

function SubmitButton({ mode }: { mode: "new" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : mode === "new" ? "Create event" : "Save changes"}
    </button>
  );
}

const inputCls =
  "mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 sm:text-sm";
const labelCls = "block text-sm font-medium text-stone-700";

export default function EventForm({ mode, event, action }: Props) {
  const [state, formAction] = useActionState(action, initial);
  const [imageUrl, setImageUrl] = useState(event?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("kind", "event");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        setUploadError(data.error ?? "Upload failed. Please try again.");
        return;
      }
      setImageUrl(data.url);
    } catch {
      setUploadError("Network error while uploading.");
    } finally {
      setUploading(false);
    }
  }

  const priceDollars = event ? (event.price / 100).toFixed(2) : "";

  return (
    <form action={formAction} className="space-y-6">
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-stone-900">Basics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className={labelCls}>Title *</label>
            <input id="title" name="title" required defaultValue={event?.title} className={inputCls} />
          </div>
          <div>
            <label htmlFor="titleCn" className={labelCls}>Chinese title</label>
            <input id="titleCn" name="titleCn" defaultValue={event?.titleCn} className={inputCls} />
          </div>
          <div>
            <label htmlFor="slug" className={labelCls}>
              Slug {mode === "edit" && <span className="text-xs text-stone-400">(cannot change)</span>}
            </label>
            <input
              id="slug"
              name="slug"
              defaultValue={event?.slug}
              readOnly={mode === "edit"}
              placeholder={mode === "new" ? "auto-generated from title if blank" : undefined}
              className={`${inputCls} ${mode === "edit" ? "bg-stone-100" : ""}`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className={labelCls}>Short description *</label>
            <textarea id="description" name="description" required rows={2} defaultValue={event?.description} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="longDescription" className={labelCls}>Long description *</label>
            <textarea id="longDescription" name="longDescription" required rows={6} defaultValue={event?.longDescription} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="imageUrl" className={labelCls}>Event image</label>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <input
                id="imageUrl"
                name="imageUrl"
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste an image URL, or upload a file →"
                className="flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
              <label
                className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:bg-stone-100 ${
                  uploading ? "cursor-wait opacity-60" : ""
                }`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {uploading ? "Uploading…" : "Upload image"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  disabled={uploading}
                  onChange={handleImageUpload}
                  className="sr-only"
                />
              </label>
            </div>
            <p className="mt-1 text-xs text-stone-500">
              Paste any public image URL, or upload a file (JPEG/PNG/WebP, up to 8 MB).
            </p>
            {uploadError && (
              <p role="alert" className="mt-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800">
                {uploadError}
              </p>
            )}
            {imageUrl && (
              <div className="mt-2 overflow-hidden rounded-md border border-stone-200 bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Event preview"
                  className="h-32 w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-stone-900">When & where</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="date" className={labelCls}>Date *</label>
            <input id="date" name="date" type="date" required defaultValue={event?.date} className={inputCls} />
          </div>
          <div>
            <label htmlFor="time" className={labelCls}>Time *</label>
            <input
              id="time"
              name="time"
              type="text"
              required
              defaultValue={event?.time}
              placeholder="e.g. 2:00 PM - 5:00 PM"
              className={inputCls}
            />
            <p className="mt-1 text-xs text-stone-500">
              Free-form display text. Use a start–end range for the calendar
              invite to compute duration correctly (AM/PM).
            </p>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="location" className={labelCls}>Location *</label>
            <input
              id="location"
              name="location"
              type="text"
              required
              defaultValue={event?.location}
              placeholder="e.g. Yan Lai Art Studio, Main Room"
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="meetingUrl" className={labelCls}>Meeting URL (online events only)</label>
            <input
              id="meetingUrl"
              name="meetingUrl"
              type="url"
              defaultValue={event?.meetingUrl}
              placeholder="https://meet.google.com/..."
              className={inputCls}
            />
            <p className="mt-1 text-xs text-stone-500">
              Leave blank for in-person events. When set, the event is treated
              as online on the calendar and a &ldquo;Join&rdquo; link is shown.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-stone-900">Price & capacity</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className={labelCls}>Price (USD) *</label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={priceDollars}
              placeholder="0 for free events"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="capacity" className={labelCls}>Capacity *</label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              required
              defaultValue={event?.capacity}
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {state.error && (
        <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 mt-4 flex flex-col-reverse items-center justify-between gap-3 border-t border-stone-200 bg-stone-100/95 px-4 py-3 backdrop-blur-sm sm:mx-0 sm:flex-row sm:rounded-xl sm:border sm:border-stone-200 sm:bg-white sm:px-4 sm:shadow-sm">
        <Link href="/admin/events" className="text-sm text-stone-600 hover:text-stone-900">
          ← Back to events
        </Link>
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}
