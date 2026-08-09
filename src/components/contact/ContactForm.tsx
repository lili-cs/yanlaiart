"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    setStatus("submitting");
    setErrorMsg("");

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
      botcheck: String(formData.get("botcheck") ?? ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setErrorMsg(data?.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
          htmlFor="name"
          className="block text-sm font-medium text-stone-700"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-stone-300 bg-white/90 px-3 py-2 text-base text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-stone-700"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 block w-full rounded-md border border-stone-300 bg-white/90 px-3 py-2 text-base text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-medium text-stone-700"
        >
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          className="mt-1 block w-full rounded-md border border-stone-300 bg-white/90 px-3 py-2 text-base text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-stone-700"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="mt-1 block w-full rounded-md border border-stone-300 bg-white/90 px-3 py-2 text-base text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 sm:text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex w-full items-center justify-center rounded-lg bg-stone-800 px-4 py-2.5 text-sm font-semibold text-stone-50 shadow-md transition-all hover:-translate-y-0.5 hover:bg-stone-900 hover:shadow-lg hover:shadow-stone-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:bg-stone-800"
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
      </button>

      {status === "success" && (
        <p
          role="status"
          className="rounded-md border border-emerald-300/70 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-800"
        >
          Thanks — your message is on its way. We&apos;ll reply soon.
        </p>
      )}
      {status === "error" && (
        <p
          role="alert"
          className="rounded-md border border-red-300/70 bg-red-50/80 px-3 py-2 text-sm text-red-800"
        >
          {errorMsg}
        </p>
      )}
    </form>
  );
}
