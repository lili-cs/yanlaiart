"use client";

import { deleteCourseAction } from "./actions";

export default function DeleteButton({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  return (
    <form action={deleteCourseAction}>
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        className="inline-flex min-h-9 items-center justify-center rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
        onClick={(e) => {
          if (
            !confirm(
              `Delete "${title}"? It moves to trash — you can restore it from the dashboard.`
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        Delete
      </button>
    </form>
  );
}
