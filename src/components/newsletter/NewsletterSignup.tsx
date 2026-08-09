"use client";

import { useState, useTransition } from "react";
import { subscribe } from "@/app/actions/newsletter";

type Variant = "hero" | "compact";

interface NewsletterSignupProps {
  variant?: Variant;
}

export default function NewsletterSignup({ variant = "hero" }: NewsletterSignupProps) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  function handleSubmit(formData: FormData) {
    setStatus(null);
    startTransition(async () => {
      const result = await subscribe(formData);
      setStatus(result);
    });
  }

  if (variant === "compact") {
    return (
      <div>
        <form action={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            name="email"
            required
            placeholder="Your email"
            disabled={pending}
            className="flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 placeholder-stone-400 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 disabled:opacity-50 sm:text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 disabled:opacity-60"
          >
            {pending ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
        {status && (
          <p
            className={`mt-2 text-xs ${
              status.ok ? "text-emerald-800" : "text-orange-800"
            }`}
          >
            {status.message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-neutral-900 to-stone-950 p-8 sm:p-10">
      {/* Ink + mineral pigment blobs */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-amber-700/30 mix-blend-screen blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-emerald-800/30 mix-blend-screen blur-3xl" />
      <div className="pointer-events-none absolute inset-0 texture-paper opacity-30" />

      <div className="relative">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="animate-gradient bg-gradient-to-r from-amber-100 via-stone-100 to-emerald-100 bg-clip-text text-transparent">
            Stay in Loop
          </span>
        </h2>
        <p className="mt-2 max-w-xl text-stone-300">
          Sign up to get notified about new courses, holiday workshops, and
          upcoming events.
        </p>

        <form action={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nl-name" className="block text-xs font-medium text-gray-300">
              Name
            </label>
            <input
              id="nl-name"
              type="text"
              name="name"
              placeholder="Your name (optional)"
              disabled={pending}
              className="mt-1 block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-base text-white placeholder-gray-400 backdrop-blur-sm focus:border-white/60 focus:bg-white/15 focus:outline-none focus:ring-1 focus:ring-white/40 disabled:opacity-50 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="nl-email" className="block text-xs font-medium text-gray-300">
              Email <span className="text-amber-300">*</span>
            </label>
            <input
              id="nl-email"
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              disabled={pending}
              className="mt-1 block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-base text-white placeholder-gray-400 backdrop-blur-sm focus:border-white/60 focus:bg-white/15 focus:outline-none focus:ring-1 focus:ring-white/40 disabled:opacity-50 sm:text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="nl-phone" className="block text-xs font-medium text-gray-300">
              Phone
            </label>
            <input
              id="nl-phone"
              type="tel"
              name="phone"
              placeholder="Optional — for course reminders"
              disabled={pending}
              className="mt-1 block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-base text-white placeholder-gray-400 backdrop-blur-sm focus:border-white/60 focus:bg-white/15 focus:outline-none focus:ring-1 focus:ring-white/40 disabled:opacity-50 sm:text-sm"
            />
          </div>

          <fieldset className="sm:col-span-2">
            <legend className="text-xs font-medium text-gray-300">
              I&apos;m interested in
            </legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {[
                { value: "courses", label: "Courses" },
                { value: "events", label: "Holiday Events" },
                { value: "open-studio", label: "Open Studio" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-stone-200 backdrop-blur-sm transition-colors hover:bg-white/10 has-checked:border-amber-300 has-checked:bg-amber-600/30 has-checked:text-white"
                >
                  <input
                    type="checkbox"
                    name="interests"
                    value={opt.value}
                    className="h-3.5 w-3.5 accent-amber-500"
                    disabled={pending}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="sm:col-span-2">
            <label htmlFor="nl-message" className="block text-xs font-medium text-gray-300">
              Anything you&apos;d like us to know?
            </label>
            <textarea
              id="nl-message"
              name="message"
              rows={3}
              placeholder="Optional — questions, preferred class times, etc."
              disabled={pending}
              className="mt-1 block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-base text-white placeholder-gray-400 backdrop-blur-sm focus:border-white/60 focus:bg-white/15 focus:outline-none focus:ring-1 focus:ring-white/40 disabled:opacity-50 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center rounded-lg bg-stone-100 px-6 py-3 text-sm font-semibold text-stone-900 shadow-lg shadow-amber-900/20 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-amber-900/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {pending ? "Subscribing…" : "Subscribe"}
            </button>
            {status && (
              <p
                role="status"
                className={`mt-3 text-center text-sm ${
                  status.ok ? "text-emerald-200" : "text-amber-200"
                }`}
              >
                {status.message}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
