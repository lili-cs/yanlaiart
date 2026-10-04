"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

export default function Navbar() {
  const pathname = usePathname();
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
        <ul className="hidden items-center gap-6 md:flex lg:gap-8">
          {navLinks.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative inline-flex items-center px-1 py-2 text-sm font-medium transition-colors",
                    active
                      ? "text-amber-900"
                      : "text-stone-600 hover:text-amber-900"
                  )}
                >
                  <span className="relative">
                    {link.label}
                    {/* Animated underline — slides in on hover, locked on active */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none absolute -bottom-1 left-0 right-0 h-0.5 origin-left rounded-full bg-gradient-to-r from-amber-700 via-amber-600 to-emerald-700 transition-transform duration-300 ease-out",
                        active
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      )}
                    />
                  </span>
                  {/* Tiny dot indicator for the active section — reads as
                      "you are here" even if the underline is subtle. */}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-600"
                    />
                  )}
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
            {navLinks.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={closeMobile}
                    className={cn(
                      "relative block rounded-md pl-5 pr-3 py-3 text-base font-medium transition-colors",
                      // Amber accent bar on the left — solid for active,
                      // scales in from top on hover for inactive.
                      "before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-amber-600 before:origin-top before:transition-transform before:duration-200",
                      active
                        ? "bg-amber-50 text-amber-900 before:scale-y-100"
                        : "text-stone-600 before:scale-y-0 hover:bg-amber-50/60 hover:text-amber-900 hover:before:scale-y-100"
                    )}
                  >
                    {link.label}
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
