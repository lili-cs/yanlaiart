import type { Metadata } from "next";
import { getAdmin } from "@/lib/admin-store";
import ResetForm from "./ResetForm";

export const metadata: Metadata = { title: "Reset password" };

interface Props {
  params: Promise<{ token: string }>;
}

function isResetTokenValid(
  reset: { token: string; expiresAt: number } | undefined,
  token: string
): boolean {
  if (!reset) return false;
  return reset.token === token && reset.expiresAt >= Date.now();
}

export default async function ResetPage({ params }: Props) {
  const { token } = await params;
  const admin = await getAdmin();
  const valid = isResetTokenValid(admin.reset, token);

  if (!valid) {
    return (
      <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Link expired</h2>
        <p className="text-sm text-stone-600">
          This reset link is invalid or has already been used. Request a fresh one.
        </p>
        <a
          href="/admin/forgot"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Request new link
        </a>
      </div>
    );
  }

  return <ResetForm token={token} />;
}
