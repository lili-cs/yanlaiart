"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { trapFocus } from "@/lib/utils";

interface Props {
  courseTitle: string;
  courseHref: string;
  whenLabel?: string;
  meetingUrl: string;
  meetingInstructions?: string;
  /** "icon" for the compact grid variant, "text" for the agenda variant. */
  variant?: "icon" | "text";
}

export default function MeetingDetailsButton({
  courseTitle,
  courseHref,
  whenLabel,
  meetingUrl,
  meetingInstructions,
  variant = "icon",
}: Props) {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const triggerAtOpen = triggerRef.current;
    const untrap = modalRef.current ? trapFocus(modalRef.current) : () => {};
    // Move focus into the modal so screen readers announce the dialog.
    modalRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      untrap();
      (triggerAtOpen ?? previouslyFocused)?.focus();
    };
  }, [open]);

  const trigger =
    variant === "icon" ? (
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        title="How to join"
        aria-label={`How to join ${courseTitle}`}
        className="flex flex-none items-center justify-center border-l border-current/30 bg-white/60 px-1.5 text-[11px] font-bold text-teal-900 transition-colors hover:bg-white"
      >
        ⓘ
      </button>
    ) : (
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="inline-flex min-h-11 flex-none items-center justify-center rounded-lg border border-teal-700 bg-white px-3 text-xs font-semibold text-teal-800 shadow-sm transition-colors hover:bg-teal-50"
        aria-label={`How to join ${courseTitle}`}
      >
        Details
      </button>
    );

  return (
    <>
      {trigger}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="meeting-details-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div
              ref={modalRef}
              className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-stone-300/70 bg-white shadow-2xl max-h-[calc(100dvh-2rem)]"
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

              <div className="shrink-0 border-b border-stone-200 bg-gradient-to-br from-teal-50 to-white px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                  How to join
                </p>
                <h2
                  id="meeting-details-title"
                  className="mt-1 pr-10 text-lg font-bold text-stone-900"
                >
                  {courseTitle}
                </h2>
                {whenLabel && (
                  <p className="mt-1 text-sm text-stone-600">{whenLabel}</p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <a
                  href={meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800"
                >
                  Join meeting
                </a>
                <p className="mt-2 break-all text-xs text-stone-500">
                  or paste this link:{" "}
                  <a
                    href={meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-700 underline"
                  >
                    {meetingUrl}
                  </a>
                </p>

                {meetingInstructions && (
                  <div className="mt-5 border-t border-stone-200 pt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Meeting details
                    </p>
                    <pre className="whitespace-pre-wrap break-words rounded-md bg-stone-50 p-3 font-sans text-sm leading-relaxed text-stone-800">
                      {meetingInstructions}
                    </pre>
                  </div>
                )}

                <div className="mt-5 border-t border-stone-200 pt-4">
                  <a
                    href={courseHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-stone-600 hover:text-stone-900"
                  >
                    See full course page →
                  </a>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
