"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { forgotAction, type ForgotState } from "./actions";

const initial: ForgotState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send reset link"}
    </button>
  );
}

export default function ForgotForm() {
  const [state, action] = useActionState(forgotAction, initial);
  return (
    <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-stone-900">Forgot password?</h2>
        <p className="mt-1 text-sm text-stone-600">
          We&apos;ll email a reset link to the studio&apos;s registered inbox
          (<span className="font-medium text-stone-800">yichenhot@icloud.com</span>).
          The link expires in one hour.
        </p>
      </div>

      {state.ok ? (
        <p role="status" className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
          A reset link is on its way to yichenhot@icloud.com. Check the inbox
          (and spam) and click the link to set a new password.
        </p>
      ) : (
        <form action={action} className="space-y-4">
          {state.error && (
            <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
              {state.error}
            </p>
          )}
          <SubmitButton />
        </form>
      )}

      <p className="text-center text-xs text-stone-500">
        <a href="/admin/login" className="text-amber-700 hover:text-amber-900">
          Back to sign in
        </a>
      </p>
    </div>
  );
}
