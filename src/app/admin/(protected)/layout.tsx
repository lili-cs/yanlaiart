import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";
import { storageBackend } from "@/lib/store";
import { logoutAction } from "./actions";
import AdminNav from "./AdminNav";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const c = await cookies();
  const session = verifySession(c.get(SESSION_COOKIE_NAME)?.value);
  if (!session) {
    // Middleware already redirected unauthenticated requests with a ?next=
    // parameter based on the actual pathname; if we somehow got here with
    // a stale/invalid cookie, send them back through the same funnel.
    redirect("/admin/login");
  }

  const isServerless = Boolean(process.env.VERCEL) || Boolean(process.env.NETLIFY);
  const storageWarning =
    storageBackend === "json-file" && isServerless
      ? "Warning: this deployment writes to the filesystem, which is ephemeral on Vercel/Netlify. Set DATABASE_URL (Neon) or KV_REST_API_URL/KV_REST_API_TOKEN (Vercel KV) to persist admin edits."
      : null;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/admin"
            className="text-base font-semibold text-stone-900 hover:text-amber-900"
          >
            Yan Lai Art · Admin
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-stone-500 sm:inline">
              Signed in as{" "}
              <strong className="text-stone-700">{session.username}</strong>
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <AdminNav />

      {storageWarning && (
        <div className="border-b border-amber-300 bg-amber-100 px-4 py-3 text-center text-sm text-amber-900 sm:px-6">
          ⚠︎ {storageWarning}
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
