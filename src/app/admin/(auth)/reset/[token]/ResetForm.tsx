"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { resetAction, type ResetState } from "./actions";

const initial: ResetState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : "Set new password"}
    </button>
  );
}

export default function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetAction, initial);
  return (
    <form action={action} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <input type="hidden" name="token" value={token} />
      <div>
        <h2 className="text-lg font-semibold text-stone-900">Choose a new password</h2>
        <p className="mt-1 text-sm text-stone-600">At least 6 characters.</p>
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-stone-700">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-stone-700">
          Confirm new password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 sm:text-sm"
        />
      </div>
      {state.error && (
        <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
