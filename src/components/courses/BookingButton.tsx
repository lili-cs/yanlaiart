"use client";

import { createCheckoutSession } from "@/app/actions/stripe";

interface BookingButtonProps {
  itemType: "course" | "event";
  itemSlug: string;
  label?: string;
}

export default function BookingButton({
  itemType,
  itemSlug,
  label = "Book Now",
}: BookingButtonProps) {
  return (
    <form action={createCheckoutSession}>
      <input type="hidden" name="itemType" value={itemType} />
      <input type="hidden" name="itemSlug" value={itemSlug} />
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 sm:w-auto"
      >
        {label}
      </button>
    </form>
  );
}
