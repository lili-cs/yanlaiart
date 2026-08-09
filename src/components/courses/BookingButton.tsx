"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { trapFocus } from "@/lib/utils";

interface BookingButtonProps {
  itemType: "course" | "event";
  itemSlug: string;
  label?: string;
  disabled?: boolean;
  disabledMessage?: string;
}

type Status = "idle" | "submitting" | "error";

export default function BookingButton({
  itemType,
  itemSlug,
  label = "Book Now",
  disabled = false,
  disabledMessage,
}: BookingButtonProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchParams = useSearchParams();
  const bookParam = searchParams.get("book");

  // Auto-open the modal when the user arrives with ?book=1 (from the calendar's
  // Enroll button). React's "state during render" pattern — no effect needed.
  const [lastBookParam, setLastBookParam] = useState<string | null>(null);
  if (bookParam !== lastBookParam) {
    setLastBookParam(bookParam);
    if (bookParam === "1") setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Capture the trigger at effect-mount time so cleanup uses the same node.
    const triggerAtOpen = triggerRef.current;
    firstFieldRef.current?.focus();
    const untrap = modalRef.current ? trapFocus(modalRef.current) : () => {};
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      untrap();
      // Return focus to whatever opened the modal — for the button click
      // path it's the trigger, for the ?book=1 path it may be the URL bar
      // (no meaningful previouslyFocused), in which case we do nothing.
      (triggerAtOpen ?? previouslyFocused)?.focus();
    };
  }, [open]);

  if (disabled) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-stone-300 px-6 py-3 text-sm font-semibold text-stone-500 shadow-inner sm:w-auto"
        >
          Booking opens soon
        </button>
        {disabledMessage && (
          <p className="text-sm text-stone-600">{disabledMessage}</p>
        )}
      </div>
    );
  }

  // Recompute today's date on every render — including on modal open —
  // so a modal held open past midnight refreshes the "no past dates" rule
  // as soon as any state change re-renders the component.
  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);

    setStatus("submitting");
    setErrorMsg("");

    const payload = {
      itemType,
      itemSlug,
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      requestedDate: String(fd.get("requestedDate") ?? ""),
      requestedTime: String(fd.get("requestedTime") ?? ""),
      notes: String(fd.get("notes") ?? ""),
      botcheck: String(fd.get("botcheck") ?? ""),
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setStatus("error");
      setErrorMsg(data.error || "Something went wrong. Please try again.");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setStatus("idle");
          setErrorMsg("");
          setOpen(true);
        }}
        className="inline-flex w-full items-center justify-center rounded-lg bg-stone-800 px-6 py-3 text-sm font-semibold text-stone-50 shadow-md transition-all hover:-translate-y-0.5 hover:bg-stone-900 hover:shadow-lg hover:shadow-stone-500/20 sm:w-auto"
      >
        {label}
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={modalRef}
            className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-stone-300/70 bg-stone-50 shadow-2xl max-h-[calc(100dvh-2rem)]"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-stone-500 shadow-sm transition-colors hover:bg-stone-200 hover:text-stone-800"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="shrink-0 border-b border-stone-200 bg-gradient-to-br from-amber-50 to-stone-50 px-6 py-5">
              <h2
                id="booking-modal-title"
                className="pr-10 text-xl font-bold text-stone-900"
              >
                {itemType === "course" ? "Book this course" : "Register for this event"}
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                {itemType === "course"
                  ? "Pick a preferred date and time — we'll confirm by email."
                  : "Reserve your spot. Confirmation will arrive by email."}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto"
            >
              <div className="space-y-4 px-6 py-5">
                <input
                  type="checkbox"
                  name="botcheck"
                  className="hidden"
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div>
                  <label
                    htmlFor="booking-name"
                    className="block text-sm font-medium text-stone-700"
                  >
                    Full name
                  </label>
                  <input
                    ref={firstFieldRef}
                    id="booking-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-email"
                    className="block text-sm font-medium text-stone-700"
                  >
                    Email
                  </label>
                  <input
                    id="booking-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-phone"
                    className="block text-sm font-medium text-stone-700"
                  >
                    Phone <span className="text-stone-400">(optional)</span>
                  </label>
                  <input
                    id="booking-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 sm:text-sm"
                  />
                </div>

                {itemType === "course" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="booking-date"
                        className="block text-sm font-medium text-stone-700"
                      >
                        Preferred date
                      </label>
                      <input
                        id="booking-date"
                        name="requestedDate"
                        type="date"
                        required
                        min={today}
                        className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="booking-time"
                        className="block text-sm font-medium text-stone-700"
                      >
                        Preferred time
                      </label>
                      <input
                        id="booking-time"
                        name="requestedTime"
                        type="time"
                        required
                        className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 sm:text-sm"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="booking-notes"
                    className="block text-sm font-medium text-stone-700"
                  >
                    Notes <span className="text-stone-400">(optional)</span>
                  </label>
                  <textarea
                    id="booking-notes"
                    name="notes"
                    rows={3}
                    maxLength={2000}
                    className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 sm:text-sm"
                    placeholder="Experience level, questions, anything we should know…"
                  />
                </div>

                {status === "error" && (
                  <p
                    role="alert"
                    className="rounded-md border border-red-300/70 bg-red-50 px-3 py-2 text-sm text-red-800"
                  >
                    {errorMsg}
                  </p>
                )}
              </div>

              <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-stone-200 bg-stone-50/95 px-6 py-4 backdrop-blur-sm sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex items-center justify-center rounded-lg bg-stone-800 px-5 py-2.5 text-sm font-semibold text-stone-50 shadow-md transition-all hover:-translate-y-0.5 hover:bg-stone-900 hover:shadow-lg hover:shadow-stone-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:bg-stone-800"
                >
                  {status === "submitting" ? "Processing…" : "Continue to payment"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
