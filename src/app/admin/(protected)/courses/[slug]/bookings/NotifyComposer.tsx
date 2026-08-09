"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { NotifyState } from "../../../actions";

const initial: NotifyState = {};

interface Props {
  variant: "confirm" | "cancel";
  action: (prev: NotifyState, fd: FormData) => Promise<NotifyState>;
  recipientCount: number;
}

const copy = {
  confirm: {
    title: "Send confirmation to all",
    blurb:
      "Let every enrolled student know the course is going ahead as scheduled. For online courses, the meeting link is included.",
    placeholder:
      "Optional note — e.g. things to bring, parking tips, materials list…",
    button: "Send confirmation",
    disabledButton: "Sending…",
    accent: "border-emerald-300 bg-emerald-50/70 text-emerald-900",
    submitCls: "bg-emerald-700 hover:bg-emerald-800",
    confirmMessage: "",
  },
  cancel: {
    title: "Cancel course & notify all",
    blurb:
      "Marks the course as Cancelled (no more bookings allowed) and emails every enrolled student. Add a note explaining why or offering an alternative.",
    placeholder:
      "Optional note — e.g. reason, refund timing, alternative dates…",
    button: "Cancel course & send emails",
    disabledButton: "Sending…",
    accent: "border-red-300 bg-red-50/70 text-red-900",
    submitCls: "bg-red-700 hover:bg-red-800",
    confirmMessage:
      "This will mark the course as Cancelled AND email every enrolled student. This cannot be undone from a single button. Continue?",
  },
} as const;

function SubmitButton({
  variant,
  className,
  confirmMessage,
}: {
  variant: "confirm" | "cancel";
  className: string;
  confirmMessage: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (confirmMessage && !confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
      className={`inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {pending ? copy[variant].disabledButton : copy[variant].button}
    </button>
  );
}

export default function NotifyComposer({
  variant,
  action,
  recipientCount,
}: Props) {
  const [state, formAction] = useActionState(action, initial);
  const c = copy[variant];

  return (
    <div className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${c.accent}`}>
      <h3 className="text-base font-semibold">{c.title}</h3>
      <p className="mt-1 text-sm">{c.blurb}</p>

      <form action={formAction} className="mt-4 space-y-3">
        <div>
          <label
            htmlFor={`msg-${variant}`}
            className="block text-xs font-medium uppercase tracking-wider"
          >
            Note (optional)
          </label>
          <textarea
            id={`msg-${variant}`}
            name="customMessage"
            rows={3}
            maxLength={2000}
            placeholder={c.placeholder}
            className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 shadow-sm focus:border-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-800 sm:text-sm"
          />
        </div>

        {state.error && (
          <p role="alert" className="rounded-md border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-900">
            {state.error}
          </p>
        )}
        {state.ok && (
          <p role="status" className="rounded-md border border-emerald-300 bg-emerald-100 px-3 py-2 text-sm text-emerald-900">
            Sent to {state.sent} recipient{state.sent === 1 ? "" : "s"}
            {state.skipped ? ` (${state.skipped} skipped due to errors)` : ""}.
          </p>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs text-stone-600">
            {recipientCount} recipient{recipientCount === 1 ? "" : "s"}
          </p>
          <SubmitButton
            variant={variant}
            className={c.submitCls}
            confirmMessage={c.confirmMessage}
          />
        </div>
      </form>
    </div>
  );
}
