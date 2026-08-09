"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "./actions";

const initial: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function LoginForm({ nextUrl }: { nextUrl?: string }) {
  const [state, action] = useActionState(loginAction, initial);
  return (
    <form action={action} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <input type="hidden" name="next" value={nextUrl ?? "/admin"} />
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-stone-700">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          defaultValue="yanlaiart"
          className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-stone-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 sm:text-sm"
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <SubmitButton />

      <p className="text-center text-xs text-stone-500">
        <a href="/admin/forgot" className="text-amber-700 hover:text-amber-900">
          Forgot password?
        </a>
      </p>
    </form>
  );
}
