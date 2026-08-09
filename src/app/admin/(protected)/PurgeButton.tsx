"use client";

import { purgeCourseAction } from "./actions";

export default function PurgeButton({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  return (
    <form action={purgeCourseAction}>
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        className="inline-flex min-h-9 items-center justify-center rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
        onClick={(e) => {
          if (
            !confirm(
              `Permanently delete "${title}"? This cannot be undone.`
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        Delete forever
      </button>
    </form>
  );
}
