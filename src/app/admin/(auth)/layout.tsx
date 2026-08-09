import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-stone-500 hover:text-stone-800"
          >
            ← Back to site
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-stone-900">Yan Lai Art</h1>
          <p className="text-sm text-stone-500">Admin</p>
        </div>
        {children}
      </div>
    </div>
  );
}
