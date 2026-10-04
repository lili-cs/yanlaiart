"use client";

import { useFormStatus } from "react-dom";
import { deleteEventAction } from "../actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-9 items-center justify-center rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-medium text-red-700 shadow-sm transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}

interface Props {
  slug: string;
  title: string;
}

export default function DeleteEventButton({ slug, title }: Props) {
  return (
    <form
      action={deleteEventAction}
      onSubmit={(e) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <Submit />
    </form>
  );
}
