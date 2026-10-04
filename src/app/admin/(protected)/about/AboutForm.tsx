"use client";

import { useActionState } from "react";
import type { AboutContent } from "@/lib/page-content";
import { updateAboutContentAction, type PageContentState } from "../actions";
import { SubmitButton, SaveNotice, inputCls, labelCls } from "../PageFormUI";

const initial: PageContentState = {};

interface Props {
  content: AboutContent;
}

export default function AboutForm({ content }: Props) {
  const [state, formAction] = useActionState(updateAboutContentAction, initial);

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
        <h2 className="text-base font-semibold text-stone-900">Mission text</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label htmlFor="introZh" className={labelCls}>Chinese introduction *</label>
            <textarea id="introZh" name="introZh" required rows={5} defaultValue={content.introZh} className={inputCls} />
            <p className="mt-1 text-xs text-stone-500">
              Rendered in a serif font at the top of the mission block.
            </p>
          </div>
          <div>
            <label htmlFor="paragraph1" className={labelCls}>Paragraph 1 (English) *</label>
            <textarea id="paragraph1" name="paragraph1" required rows={5} defaultValue={content.paragraph1} className={inputCls} />
          </div>
          <div>
            <label htmlFor="paragraph2" className={labelCls}>Paragraph 2 (English) *</label>
            <textarea id="paragraph2" name="paragraph2" required rows={6} defaultValue={content.paragraph2} className={inputCls} />
          </div>
          <div>
            <label htmlFor="paragraph3" className={labelCls}>Paragraph 3 (English) *</label>
            <textarea id="paragraph3" name="paragraph3" required rows={5} defaultValue={content.paragraph3} className={inputCls} />
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
