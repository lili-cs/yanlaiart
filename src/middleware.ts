import { NextRequest, NextResponse } from "next/server";

// Inline instead of importing from '@/lib/auth' — that module pulls in
// node:crypto which isn't available in the Edge runtime that runs middleware.
const SESSION_COOKIE_NAME = "yla_admin_session";

/**
 * When an unauthenticated user hits any /admin/* page (except the public
 * auth ones), redirect to /admin/login?next=<original>. The full session
 * verification still happens in the protected layout — this middleware
 * only checks for the presence of a cookie so the `next` URL is preserved.
 * Verification here would need Web Crypto (Edge runtime), and the layout
 * already handles it in Node.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Only guard admin routes we can identify as protected.
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (
    pathname === "/admin/login" ||
    pathname === "/admin/forgot" ||
    pathname.startsWith("/admin/reset/")
  ) {
    return NextResponse.next();
  }

  const hasCookie = Boolean(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (hasCookie) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  // Preserve the intended destination, but drop query strings to keep the
  // URL clean.
  url.search = "";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
