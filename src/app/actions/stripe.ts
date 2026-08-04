"use server";

import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe";
import { getCourseBySlug } from "@/data/courses";
import { getEventBySlug } from "@/data/events";

export async function createCheckoutSession(formData: FormData) {
  const itemType = formData.get("itemType") as string;
  const itemSlug = formData.get("itemSlug") as string;

  let name: string;
  let description: string;
  let priceInCents: number;

  if (itemType === "course") {
    const course = getCourseBySlug(itemSlug);
    if (!course) throw new Error("Course not found");
    name = `${course.title} (${course.titleCn})`;
    description = [
      course.duration,
      course.level,
      course.maxStudents ? `Max ${course.maxStudents} students` : null,
    ]
      .filter(Boolean)
      .join(" · ");
    priceInCents = course.price;
  } else if (itemType === "event") {
    const event = getEventBySlug(itemSlug);
    if (!event) throw new Error("Event not found");
    name = `${event.title} (${event.titleCn})`;
    description = `${event.date} · ${event.time} · ${event.location}`;
    priceInCents = event.price;
  } else {
    throw new Error("Invalid item type");
  }

  if (priceInCents === 0) {
    // For free events, skip Stripe and go directly to success
    redirect(`/checkout/success?session_id=free_${itemSlug}`);
  }

  // Demo mode: if Stripe keys are not configured, skip to success page
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey === "sk_test_xxx") {
    redirect(`/checkout/success?session_id=demo_${itemSlug}`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name,
            description,
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      itemType,
      itemSlug,
    },
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/${itemType === "course" ? "courses" : "events"}/${itemSlug}`,
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  redirect(session.url);
}
