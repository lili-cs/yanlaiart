"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateBusinessHoursAction, type HoursFormState } from "../actions";
import { WEEKDAY_LABELS, type BusinessHours, type DayHours } from "@/lib/business-hours";

const initial: HoursFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save business hours"}
    </button>
  );
}

interface Props {
  initialHours: BusinessHours;
}

export default function HoursForm({ initialHours }: Props) {
  const [state, formAction] = useActionState(updateBusinessHoursAction, initial);
  const [days, setDays] = useState<DayHours[]>(initialHours.days);

  function updateDay(i: number, patch: Partial<DayHours>) {
    setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[36rem] text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3">Day</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Opens</th>
              <th className="px-4 py-3">Closes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {days.map((d, i) => (
              <tr key={i}>
                <td className="px-4 py-3 font-medium text-stone-800">
                  {WEEKDAY_LABELS[i]}
                </td>
                <td className="px-4 py-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      name={`day-${i}-closed`}
                      checked={d.closed}
                      onChange={(e) => updateDay(i, { closed: e.target.checked })}
                      className="h-4 w-4 accent-stone-700"
                    />
                    Closed
                  </label>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="time"
                    name={`day-${i}-open`}
                    value={d.open}
                    disabled={d.closed}
                    onChange={(e) => updateDay(i, { open: e.target.value })}
                    className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="time"
                    name={`day-${i}-close`}
                    value={d.close}
                    disabled={d.closed}
                    onChange={(e) => updateDay(i, { close: e.target.value })}
                    className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {state.error && (
        <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Saved — new bookings will use these hours.
        </p>
      )}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
