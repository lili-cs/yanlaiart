"use client";

import { useActionState } from "react";
import type { HomeContent } from "@/lib/page-content";
import { updateHomeContentAction, type PageContentState } from "../../actions";
import { SubmitButton, SaveNotice, inputCls, labelCls } from "../PageStatus";

const initial: PageContentState = {};

interface Props {
  content: HomeContent;
}

export default function HomeForm({ content }: Props) {
  const [state, formAction] = useActionState(updateHomeContentAction, initial);

  return (
    <form action={formAction} className="space-y-6">
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-stone-900">Hero</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label htmlFor="heroTitle" className={labelCls}>Hero title *</label>
            <input id="heroTitle" name="heroTitle" required defaultValue={content.heroTitle} className={inputCls} />
          </div>
          <div>
            <label htmlFor="heroSubtitle" className={labelCls}>Hero subtitle *</label>
            <textarea id="heroSubtitle" name="heroSubtitle" required rows={3} defaultValue={content.heroSubtitle} className={inputCls} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-stone-900">Section headings</h2>
        <p className="mt-1 text-xs text-stone-500">
          The three section titles and subtitles on the home page.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="artFormsTitle" className={labelCls}>Art forms — title *</label>
            <input id="artFormsTitle" name="artFormsTitle" required defaultValue={content.artFormsTitle} className={inputCls} />
          </div>
          <div>
            <label htmlFor="artFormsSubtitle" className={labelCls}>Art forms — subtitle *</label>
            <input id="artFormsSubtitle" name="artFormsSubtitle" required defaultValue={content.artFormsSubtitle} className={inputCls} />
          </div>
          <div>
            <label htmlFor="featuredCoursesTitle" className={labelCls}>Featured courses — title *</label>
            <input id="featuredCoursesTitle" name="featuredCoursesTitle" required defaultValue={content.featuredCoursesTitle} className={inputCls} />
          </div>
          <div>
            <label htmlFor="featuredCoursesSubtitle" className={labelCls}>Featured courses — subtitle *</label>
            <input id="featuredCoursesSubtitle" name="featuredCoursesSubtitle" required defaultValue={content.featuredCoursesSubtitle} className={inputCls} />
          </div>
          <div>
            <label htmlFor="upcomingEventsTitle" className={labelCls}>Upcoming events — title *</label>
            <input id="upcomingEventsTitle" name="upcomingEventsTitle" required defaultValue={content.upcomingEventsTitle} className={inputCls} />
          </div>
          <div>
            <label htmlFor="upcomingEventsSubtitle" className={labelCls}>Upcoming events — subtitle *</label>
            <input id="upcomingEventsSubtitle" name="upcomingEventsSubtitle" required defaultValue={content.upcomingEventsSubtitle} className={inputCls} />
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
