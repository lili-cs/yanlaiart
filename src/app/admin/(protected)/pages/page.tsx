import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pages" };

const EDITABLE_PAGES: { slug: "home" | "about" | "contact"; label: string; viewHref: string; description: string }[] = [
  {
    slug: "home",
    label: "Home",
    viewHref: "/",
    description: "Hero tagline and the three section headings.",
  },
  {
    slug: "about",
    label: "About",
    viewHref: "/about",
    description:
      "Hero text plus the Chinese intro and three English paragraphs.",
  },
  {
    slug: "contact",
    label: "Contact",
    viewHref: "/contact",
    description:
      "Hero text, email / phone / address, studio hours, and the message-form heading.",
  },
];

export default function AdminPagesPage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-stone-500 hover:text-stone-800">
          ← Courses
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">Pages</h1>
        <p className="mt-1 text-sm text-stone-600">
          Edit the text content of each public page. Changes go live
          immediately — no deploy needed.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EDITABLE_PAGES.map((p) => (
          <li
            key={p.slug}
            className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-stone-900 group-hover:text-amber-900">
                  {p.label}
                </h2>
                <p className="mt-1 text-sm text-stone-600">{p.description}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Link
                href={`/admin/pages/${p.slug}`}
                className="inline-flex min-h-9 items-center justify-center rounded-md bg-stone-900 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-stone-800"
              >
                Edit
              </Link>
              <a
                href={p.viewHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 items-center justify-center rounded-md border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
              >
                View ↗
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
