"use client";

import { useMemo, useState, useTransition } from "react";
import {
  cancelCourseAction,
  confirmCourseAction,
  followUpCourseAction,
  revertStatusAction,
  type NotifyState,
} from "../../../actions";

export interface EnrolledStudent {
  id: string;
  customerName?: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  requestedDate?: string;
  requestedTime?: string;
  amountLabel: string;
  paymentStatus: "paid" | "pending";
  source: "stripe" | "free" | "demo";
  createdAt: number;
}

interface Props {
  slug: string;
  students: EnrolledStudent[];
}

type Kind = "confirm" | "cancel" | "followup";

const TEMPLATES: Record<Kind, string> = {
  confirm:
    "Looking forward to seeing you! A few quick reminders — please arrive 5–10 minutes early to get settled, and don't worry about bringing supplies (we have everything you need). If you have any questions between now and class time, just reply to this email.",
  followup:
    "Hi! We noticed you started booking but the payment hasn't come through on our end yet. If you ran into any trouble at checkout — or if you'd rather hold your spot another way (Venmo, Zelle, or cash at the studio) — just reply and we'll take care of it. Already paid? Let us know and we'll match it on our side.",
  cancel:
    "We're really sorry for the change. If you already paid, a full refund will be processed to your original payment method within a few business days. If you'd like to rebook for a different date, just reply and we'll help you find a slot that works.",
};

const KIND_LABEL: Record<Kind, string> = {
  confirm: "Confirmation",
  followup: "Follow-up pending",
  cancel: "Cancellation",
};

interface Feedback {
  kind: Kind;
  ok?: boolean;
  sent?: number;
  skipped?: number;
  error?: string;
  previousStatus?: "upcoming" | "open" | "cancelled";
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(hhmm: string | undefined): string {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function formatWhen(created: number): string {
  const d = new Date(created);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function BookingsBoard({ slug, students }: Props) {
  const allIds = useMemo(() => students.map((s) => s.id), [students]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(allIds));
  const [message, setMessage] = useState("");
  const [activeTemplate, setActiveTemplate] = useState<Kind | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pendingKind, setPendingKind] = useState<Kind | null>(null);
  const [, startTransition] = useTransition();
  const [reverting, startRevert] = useTransition();

  function loadTemplate(kind: Kind) {
    const draft = TEMPLATES[kind];
    const overwriting = message.trim().length > 0 && message !== TEMPLATES[activeTemplate as Kind];
    if (overwriting) {
      const ok = confirm(
        `Replace your current message with the ${KIND_LABEL[kind]} template?`
      );
      if (!ok) return;
    }
    setActiveTemplate(kind);
    setMessage(draft);
    setFeedback(null);
    if (kind === "followup") {
      // The follow-up template is meant for pending checkouts — narrow the
      // selection to those students so the admin doesn't have to re-pick.
      const pendingIds = students
        .filter((s) => s.paymentStatus === "pending")
        .map((s) => s.id);
      setSelected(new Set(pendingIds));
    }
  }

  const total = students.length;
  const selectedCount = selected.size;
  const someSelected = selectedCount > 0;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedCount === total) setSelected(new Set());
    else setSelected(new Set(allIds));
  }

  function send(kind: Kind) {
    if (!someSelected) return;
    if (kind === "cancel") {
      const ok = confirm(
        "This will mark the course as Cancelled AND email the selected students. Continue?"
      );
      if (!ok) return;
    }
    if (!message.trim()) {
      setFeedback({
        kind,
        error: "Please write a message before sending.",
      });
      return;
    }

    const fd = new FormData();
    fd.set("customMessage", message.trim());
    for (const id of selected) fd.append("bookingId", id);

    setFeedback(null);
    setPendingKind(kind);
    startTransition(async () => {
      const action =
        kind === "confirm"
          ? confirmCourseAction
          : kind === "cancel"
            ? cancelCourseAction
            : followUpCourseAction;
      const result: NotifyState = await action(slug, {}, fd);
      setPendingKind(null);
      setFeedback({ kind, ...result });
    });
  }

  function handleRevert(prev: "upcoming" | "open") {
    startRevert(async () => {
      await revertStatusAction(slug, prev);
    });
  }

  const anyPending = pendingKind !== null;
  const disabled = !someSelected || anyPending;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-stone-900">
            Reach out to selected students
          </h2>
          <p className="text-xs text-stone-500">
            {total === 0
              ? "No students enrolled yet"
              : `${selectedCount} of ${total} selected`}
          </p>
        </div>
        <p className="mt-1 text-sm text-stone-600">
          Pick students in the table below, then send a confirmation, a
          follow-up note, or a cancellation email.
        </p>

        <div className="mt-5 overflow-hidden rounded-xl border border-stone-200 bg-stone-50/70 shadow-inner">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-stone-200 bg-white/80 px-4 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              Template
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(["confirm", "followup", "cancel"] as const).map((k) => {
                const active = activeTemplate === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => loadTemplate(k)}
                    className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-medium tracking-tight transition-all ${
                      active
                        ? "bg-stone-900 text-white shadow-sm"
                        : "bg-white text-stone-600 ring-1 ring-inset ring-stone-200 hover:bg-stone-100 hover:text-stone-900"
                    }`}
                  >
                    {KIND_LABEL[k]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <textarea
              id="notify-message"
              rows={7}
              maxLength={2000}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (activeTemplate && e.target.value !== TEMPLATES[activeTemplate]) {
                  setActiveTemplate(null);
                }
              }}
              placeholder="Pick a template above, or write your own note in your own voice…"
              className="block w-full resize-y border-0 bg-transparent px-5 py-4 font-serif text-[15px] leading-relaxed text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-0"
            />
            <div className="pointer-events-none flex items-center justify-between border-t border-stone-200/80 bg-white/60 px-5 py-2 text-[11px] text-stone-500">
              <span>
                {activeTemplate === "followup" ? (
                  <span className="text-amber-800">
                    Selection narrowed to pending students — edit below if
                    needed.
                  </span>
                ) : activeTemplate ? (
                  <span>Template loaded — edit freely before sending.</span>
                ) : (
                  <span>Message is required.</span>
                )}
              </span>
              <span className="tabular-nums text-stone-400">
                {message.length}/2000
              </span>
            </div>
          </div>
        </div>

        {feedback?.error && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900"
          >
            <p className="flex-1">
              <strong className="font-semibold">Failed:</strong> {feedback.error}
            </p>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              aria-label="Dismiss error"
              className="-mr-1 -mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-red-700 hover:bg-red-100 hover:text-red-900"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        {feedback?.ok && (
          <div
            role="status"
            className="mt-3 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          >
            <div className="flex items-start gap-2">
              <p className="flex-1">
                <strong className="font-semibold">Successfully sent</strong> to{" "}
                {feedback.sent} recipient{feedback.sent === 1 ? "" : "s"}
                {feedback.skipped
                  ? ` (${feedback.skipped} failed to send)`
                  : ""}
                .
              </p>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                aria-label="Dismiss notice"
                className="-mr-1 -mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {feedback.kind === "cancel" &&
              feedback.previousStatus &&
              feedback.previousStatus !== "cancelled" && (
                <div className="mt-2 flex flex-col gap-1 border-t border-emerald-300/60 pt-2 text-xs text-emerald-800 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Emails were sent — the status is now Cancelled. Undo only
                    reverts the status; the emails have already gone out.
                  </span>
                  <button
                    type="button"
                    disabled={reverting}
                    onClick={() =>
                      feedback.previousStatus &&
                      handleRevert(feedback.previousStatus as "upcoming" | "open")
                    }
                    className="inline-flex min-h-9 items-center justify-center self-start rounded-md border border-emerald-400 bg-white px-3 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-50 disabled:opacity-60 sm:self-auto"
                  >
                    {reverting
                      ? "Reverting…"
                      : `Undo status → ${feedback.previousStatus}`}
                  </button>
                </div>
              )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          {(() => {
            if (!activeTemplate) {
              return (
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-300 px-4 py-2 text-sm font-semibold text-stone-500 shadow-sm"
                >
                  Pick a template above to send
                </button>
              );
            }
            const kind = activeTemplate;
            const isCancel = kind === "cancel";
            const cls = isCancel
              ? "bg-red-700 hover:bg-red-800"
              : kind === "confirm"
                ? "bg-emerald-700 hover:bg-emerald-800"
                : "bg-stone-800 hover:bg-stone-900";
            const sendingLabel = isCancel ? "Cancelling…" : "Sending…";
            const readyLabel = isCancel
              ? "Cancel course & email"
              : `Send ${KIND_LABEL[kind].toLowerCase()}`;
            return (
              <button
                type="button"
                disabled={disabled}
                onClick={() => send(kind)}
                className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${cls}`}
              >
                {pendingKind === kind ? sendingLabel : readyLabel}
              </button>
            );
          })()}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-stone-900">
          Enrolled ({total})
        </h2>
        {total === 0 ? (
          <p className="rounded-xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-500">
            No one has booked this course yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full min-w-[48rem] text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={
                        selectedCount === total ? "Unselect all" : "Select all"
                      }
                      checked={total > 0 && selectedCount === total}
                      ref={(el) => {
                        if (el)
                          el.indeterminate =
                            selectedCount > 0 && selectedCount < total;
                      }}
                      onChange={toggleAll}
                      className="h-4 w-4 accent-stone-700"
                    />
                  </th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Requested slot</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Booked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {students.map((b) => {
                  const checked = selected.has(b.id);
                  return (
                    <tr
                      key={b.id}
                      className={`align-top transition-colors ${
                        checked ? "bg-amber-50/60" : "hover:bg-stone-50"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Select ${b.customerName || b.customerEmail}`}
                          checked={checked}
                          onChange={() => toggleOne(b.id)}
                          className="h-4 w-4 accent-stone-700"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-stone-900">
                          {b.customerName || (
                            <em className="text-stone-400">no name</em>
                          )}
                        </div>
                        <div className="text-xs text-stone-600">
                          <a
                            href={`mailto:${b.customerEmail}`}
                            className="text-amber-700 hover:text-amber-900"
                          >
                            {b.customerEmail}
                          </a>
                          {b.customerPhone && (
                            <span className="text-stone-500">
                              {" "}
                              · {b.customerPhone}
                            </span>
                          )}
                        </div>
                        {b.notes && (
                          <div className="mt-1 whitespace-pre-wrap text-xs text-stone-500">
                            Note: {b.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-stone-700">
                        <div>{formatDate(b.requestedDate)}</div>
                        {b.requestedTime && (
                          <div className="text-stone-500">
                            {formatTime(b.requestedTime)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="text-stone-700">{b.amountLabel}</div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span
                            className={
                              b.paymentStatus === "paid"
                                ? "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-900"
                                : "inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900"
                            }
                            title={
                              b.paymentStatus === "paid"
                                ? "Payment confirmed"
                                : "Student started checkout but payment hasn't been confirmed yet"
                            }
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${b.paymentStatus === "paid" ? "bg-emerald-500" : "bg-amber-500"}`}
                              aria-hidden
                            />
                            {b.paymentStatus === "paid" ? "Paid" : "Pending"}
                          </span>
                          <span className="text-stone-500">
                            {b.source === "stripe"
                              ? "Stripe"
                              : b.source === "free"
                                ? "Free"
                                : "Demo"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-stone-500">
                        {formatWhen(b.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
