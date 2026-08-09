import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Booking Confirmed",
  description: "Your booking has been confirmed. Thank you!",
};

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const sessionId = params.session_id;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
      <p className="mt-4 text-lg text-gray-600">
        Thank you for your booking. You will receive a confirmation email
        shortly with all the details.
      </p>

      <p className="mt-3 text-sm text-gray-500">
        A copy of your booking details has been sent to your inbox, along
        with a calendar invite (.ics) you can open to add this session to
        your calendar. For online sessions, the meeting link is built into
        the invite. If you don&apos;t see the email within a few minutes,
        please check your spam folder.
      </p>

      {sessionId?.startsWith("demo_") && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Demo mode — Stripe is not configured. In production, this would
          process a real payment.
        </p>
      )}
      {sessionId?.startsWith("free_") && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          This booking was free — no payment was required.
        </p>
      )}

      {sessionId && (
        <p className="mt-2 text-sm text-gray-400">
          Reference: {sessionId.slice(0, 32)}
          {sessionId.length > 32 ? "…" : ""}
        </p>
      )}

      <div className="mt-10 flex gap-4">
        <Link
          href="/courses"
          className="inline-flex items-center rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800"
        >
          Browse More Courses
        </Link>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
