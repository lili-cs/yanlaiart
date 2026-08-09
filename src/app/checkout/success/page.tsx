import type { Metadata } from "next";
import Link from "next/link";
import { getAllBookings } from "@/lib/booking-store";

export const metadata: Metadata = {
  title: "Booking Confirmed",
  description: "Your booking has been confirmed. Thank you!",
};

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

async function bookingExists(sessionId: string): Promise<boolean> {
  // Local free/demo path — ID is minted by our checkout API.
  if (sessionId.startsWith("free_") || sessionId.startsWith("demo_")) {
    const all = await getAllBookings();
    return all.some((b) => b.id === sessionId);
  }
  // Real Stripe path — verify against the Stripe API so we don't accept a
  // fabricated cs_test_xxx string from anyone typing in the URL bar.
  if (sessionId.startsWith("cs_")) {
    try {
      const { getStripe } = await import("@/lib/stripe");
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      // Only treat as valid when Stripe actually completed the session.
      return session.status === "complete" || session.payment_status === "paid";
    } catch {
      return false;
    }
  }
  return false;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const sessionId = params.session_id;

  const isVerified = sessionId ? await bookingExists(sessionId) : false;

  if (!isVerified) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-stone-200">
          <svg
            className="h-8 w-8 text-stone-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v3.75m0-10.036A9 9 0 1 0 12 21a9 9 0 0 0 0-18Zm-.008 15h.008v.008h-.008v-.008Z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-stone-900">
          We couldn&apos;t verify this booking
        </h1>
        <p className="mt-4 text-base text-stone-600">
          The reference in this link doesn&apos;t match a completed booking.
          If you just paid and think this is a mistake, check the confirmation
          email that was sent to your inbox — the booking is there.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/courses"
            className="inline-flex items-center rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
          >
            Browse Courses
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Contact us
          </Link>
        </div>
      </div>
    );
  }

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
