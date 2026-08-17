import type { Metadata } from "next";
import Link from "next/link";
import { getBusinessHours } from "@/lib/business-hours";
import HoursForm from "./HoursForm";

export const metadata: Metadata = { title: "Business hours" };
export const dynamic = "force-dynamic";

export default async function BusinessHoursPage() {
  const hours = await getBusinessHours();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-stone-500 hover:text-stone-800">
          ← All courses
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">Business hours</h1>
        <p className="mt-1 text-sm text-stone-600">
          Bookings on the public site are limited to these hours. Mark a day as
          closed to block bookings that day entirely.
        </p>
      </div>

      <HoursForm initialHours={hours} />
    </div>
  );
}
