"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/events", label: "Events" },
  { href: "/calendar", label: "Calendar" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** `/` is only active on the exact home page; everything else is a
 *  section prefix match so a detail page keeps its parent lit up. */
function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function BrushUnderline({ gradientId }: { gradientId: string }) {
  return (
    <svg
      className="nav-brush absolute -bottom-1.5 left-0 h-2 w-full"
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a16207" stopOpacity="0" />
          <stop offset="15%" stopColor="#a16207" stopOpacity="1" />
          <stop offset="55%" stopColor="#b45309" stopOpacity="1" />
          <stop offset="85%" stopColor="#047857" stopOpacity="1" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Hand-drawn curve — not a flat bar — so it reads as a brush mark */}
      <path
        d="M 2 6.5 C 18 3, 36 8, 52 5.5 S 82 4, 98 6"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function Seal() {
  // Vermilion rotated square — Chinese chop/seal mark that stamps in
  // when the section is active.
  return (
    <span
      aria-hidden="true"
      className="nav-seal ml-2 inline-block h-2 w-2 rotate-[-8deg] rounded-[2px] bg-gradient-to-br from-red-600 to-red-800 shadow-[0_0_0_1px_rgba(185,28,28,0.25),inset_0_0_2px_rgba(0,0,0,0.4)]"
    />
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const gradientIdBase = useId();
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const mobileOpen = openedFor === pathname;

  function toggleMobile() {
    setOpenedFor(mobileOpen ? null : pathname);
  }

  function closeMobile() {
    setOpenedFor(null);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">Yan Lai Art</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-5 md:flex lg:gap-7">
          {navLinks.map((link, i) => {
            const active = isActivePath(pathname, link.href);
            const gradientId = `nav-brush-${gradientIdBase}-${i}`;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative inline-flex items-center px-2 py-2 text-sm font-medium transition-all duration-300",
                    active
                      ? "text-amber-900"
                      : "text-stone-600 hover:text-amber-900"
                  )}
                >
                  {/* Watercolor wash bloom behind the label */}
                  <span
                    aria-hidden="true"
                    className="nav-wash absolute inset-x-0 inset-y-1 -z-10 rounded-full bg-gradient-to-br from-amber-200/40 via-orange-100/40 to-emerald-200/30 blur-md"
                  />
                  <span className="relative">
                    <span className="transition-transform duration-300 ease-out group-hover:-translate-y-px inline-block">
                      {link.label}
                    </span>
                    <BrushUnderline gradientId={gradientId} />
                  </span>
                  {active && <Seal />}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 transition-colors hover:bg-amber-50 hover:text-amber-900 md:hidden"
          onClick={toggleMobile}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-200 md:hidden">
          <ul className="space-y-1 px-4 py-3">
            {navLinks.map((link, i) => {
              const active = isActivePath(pathname, link.href);
              const gradientId = `nav-brush-m-${gradientIdBase}-${i}`;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={closeMobile}
                    className={cn(
                      "group relative block overflow-hidden rounded-md pl-5 pr-3 py-3 text-base font-medium transition-colors",
                      // Vermilion seal-stripe on the left of active items;
                      // inactive items get a soft amber hover wash.
                      "before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-gradient-to-b before:from-red-600 before:to-red-800 before:origin-top before:transition-transform before:duration-300",
                      active
                        ? "bg-amber-50 text-amber-900 before:scale-y-100"
                        : "text-stone-600 before:scale-y-0 hover:bg-amber-50/60 hover:text-amber-900 hover:before:scale-y-100"
                    )}
                  >
                    <span className="relative inline-block">
                      {link.label}
                      <BrushUnderline gradientId={gradientId} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
