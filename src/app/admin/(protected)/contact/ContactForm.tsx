"use client";

import { useActionState, useState } from "react";
import type { ContactContent, HoursLine } from "@/lib/page-content";
import { updateContactContentAction, type PageContentState } from "../actions";
import { SubmitButton, SaveNotice, inputCls, labelCls } from "../PageFormUI";

const initial: PageContentState = {};

interface Props {
  content: ContactContent;
}

export default function ContactForm({ content }: Props) {
  const [state, formAction] = useActionState(updateContactContentAction, initial);
  const [hours, setHours] = useState<HoursLine[]>(content.hoursLines);

  function updateHours(i: number, patch: Partial<HoursLine>) {
    setHours((prev) => prev.map((h, idx) => (idx === i ? { ...h, ...patch } : h)));
  }
  function addRow() {
    setHours((prev) => [...prev, { label: "", value: "" }]);
  }
  function removeRow(i: number) {
    setHours((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <form action={formAction} className="space-y-6">
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-stone-900">Hero</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="heroTitle" className={labelCls}>Hero title *</label>
            <input id="heroTitle" name="heroTitle" required defaultValue={content.heroTitle} className={inputCls} />
          </div>
          <div>
            <label htmlFor="heroSubtitle" className={labelCls}>Hero subtitle *</label>
            <input id="heroSubtitle" name="heroSubtitle" required defaultValue={content.heroSubtitle} className={inputCls} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-stone-900">Contact info</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className={labelCls}>Email *</label>
            <input id="email" name="email" type="email" required defaultValue={content.email} className={inputCls} />
          </div>
          <div>
            <label htmlFor="phone" className={labelCls}>Phone *</label>
            <input id="phone" name="phone" required defaultValue={content.phone} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="address" className={labelCls}>Studio address *</label>
            <input id="address" name="address" required defaultValue={content.address} className={inputCls} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-stone-900">Studio hours</h2>
          <button
            type="button"
            onClick={addRow}
            className="inline-flex min-h-9 items-center justify-center rounded-md border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
          >
            + Add row
          </button>
        </div>
        <p className="mt-1 text-xs text-stone-500">
          Rendered as a left-aligned label / right-aligned value list on the
          contact page.
        </p>
        <div className="mt-4 space-y-2">
          {hours.length === 0 && (
            <p className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-500">
              No hours shown. Click &ldquo;Add row&rdquo; to add one.
            </p>
          )}
          {hours.map((h, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                name="hoursLabel"
                value={h.label}
                onChange={(e) => updateHours(i, { label: e.target.value })}
                placeholder="e.g. Monday – Friday"
                className={`${inputCls} flex-1`}
              />
              <input
                type="text"
                name="hoursValue"
                value={h.value}
                onChange={(e) => updateHours(i, { value: e.target.value })}
                placeholder="e.g. 1:30 PM – 8:00 PM"
                className={`${inputCls} flex-1`}
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                aria-label={`Remove row ${i + 1}`}
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-red-300 bg-white px-3 text-xs font-medium text-red-700 shadow-sm transition-colors hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-stone-900">Message form</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label htmlFor="formHeading" className={labelCls}>Form heading *</label>
            <input id="formHeading" name="formHeading" required defaultValue={content.formHeading} className={inputCls} />
          </div>
          <div>
            <label htmlFor="formIntro" className={labelCls}>Form intro *</label>
            <textarea id="formIntro" name="formIntro" required rows={2} defaultValue={content.formIntro} className={inputCls} />
          </div>
        </div>
      </section>

      <SaveNotice ok={state.ok} error={state.error} />

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
