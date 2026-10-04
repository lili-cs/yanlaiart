"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  href: string;
  /** The tab is active when the current path matches any of these. */
  matches: (path: string) => boolean;
}

const TABS: Tab[] = [
  {
    label: "Courses",
    href: "/admin",
    matches: (p) =>
      p === "/admin" ||
      p.startsWith("/admin/courses"),
  },
  {
    label: "Events",
    href: "/admin/events",
    matches: (p) => p.startsWith("/admin/events"),
  },
  {
    label: "Pages",
    href: "/admin/pages",
    matches: (p) => p.startsWith("/admin/pages"),
  },
  {
    label: "Business hours",
    href: "/admin/hours",
    matches: (p) => p.startsWith("/admin/hours"),
  },
];

export default function AdminNav() {
  const pathname = usePathname() ?? "/admin";
  return (
    <nav
      aria-label="Admin sections"
      className="border-b border-stone-200 bg-white"
    >
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
        {TABS.map((tab) => {
          const active = tab.matches(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative inline-flex min-h-11 shrink-0 items-center whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "text-amber-900"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              {tab.label}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-2 bottom-0 h-0.5 rounded-full transition-colors",
                  active ? "bg-amber-700" : "bg-transparent"
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
