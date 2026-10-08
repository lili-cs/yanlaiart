import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";
import { getCourseBySlug } from "@/data/courses";
import { getEventBySlug } from "@/data/events";
import { addMinutesToHhmm, formatPrice } from "@/lib/utils";
import { courseScheduledSlots } from "@/lib/schedule";
import type { BookingSlot } from "@/lib/email";
import {
  sendBookingConfirmationToCustomer,
  sendBookingNotificationToOwner,
  type BookingEmailPayload,
} from "@/lib/email";
import { addBooking } from "@/lib/booking-store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const md = session.metadata ?? {};

    const itemType = md.itemType === "event" ? "event" : "course";
    const itemSlug = md.itemSlug ?? "";
    const customerName = md.customerName ?? session.customer_details?.name ?? "";
    const customerEmail =
      md.customerEmail ?? session.customer_details?.email ?? "";
    const customerPhone = md.customerPhone ?? "";
    const requestedDate = md.requestedDate ?? "";
    const requestedTime = md.requestedTime ?? "";
    const requestedEndTime = md.requestedEndTime ?? "";
    const notes = md.notes ?? "";
    const isOnline = md.isOnline === "1";
    const meetingUrl = md.meetingUrl || undefined;
    const meetingInstructions = md.meetingInstructions || undefined;
    const location = md.location || undefined;

    let itemName = "Your booking";
    let itemDetails = "";
    // For scheduled courses with >1 class, hand the email every (date,
    // time) slot so it can render the full class list + a multi-event
    // calendar invite that adds every class in one go.
    let allSlots: BookingSlot[] | undefined;
    if (itemType === "course") {
      const c = await getCourseBySlug(itemSlug);
      if (c) {
        itemName = c.titleCn ? `${c.title} (${c.titleCn})` : c.title;
        itemDetails = [
          c.duration,
          c.level,
          c.maxStudents ? `Max ${c.maxStudents} students` : null,
        ]
          .filter(Boolean)
          .join(" · ");
        const slots = courseScheduledSlots(c);
        if (slots.length > 1) {
          const durationMin = c.sessionMinutes ?? 60;
          allSlots = slots.map((s) => ({
            date: s.date,
            time: s.time,
            endTime: addMinutesToHhmm(s.time, durationMin),
          }));
        }
      }
    } else {
      const e = await getEventBySlug(itemSlug);
      if (e) {
        itemName = e.titleCn ? `${e.title} (${e.titleCn})` : e.title;
        itemDetails = `${e.date} · ${e.time} · ${e.location}`;
      }
    }

    const amountLabel =
      typeof session.amount_total === "number"
        ? formatPrice(session.amount_total)
        : "";

    if (!customerEmail) {
      console.warn("Skipping booking confirmation — no customer email on session", session.id);
    } else {
      const payload: BookingEmailPayload = {
        itemType,
        itemName,
        itemDetails,
        customerName: customerName || "there",
        customerEmail,
        customerPhone: customerPhone || undefined,
        requestedDate: requestedDate || undefined,
        requestedTime: requestedTime || undefined,
        requestedEndTime: requestedEndTime || undefined,
        allSlots,
        notes: notes || undefined,
        amountLabel: amountLabel || "Paid",
        referenceId: session.id,
        isOnline,
        meetingUrl,
        meetingInstructions,
        location,
      };

      try {
        await addBooking({
          id: session.id,
          itemType,
          itemSlug,
          itemName,
          itemDetails,
          customerName: customerName || "there",
          customerEmail,
          customerPhone: customerPhone || undefined,
          requestedDate: requestedDate || undefined,
          requestedTime: requestedTime || undefined,
          requestedEndTime: requestedEndTime || undefined,
          notes: notes || undefined,
          isOnline,
          meetingUrl,
          meetingInstructions,
          location,
          amountLabel: amountLabel || "Paid",
          createdAt: Date.now(),
          source: "stripe",
          paymentStatus: "paid",
        });
      } catch (err) {
        console.error("Failed to persist booking from webhook", err);
      }

      try {
        await Promise.all([
          sendBookingConfirmationToCustomer(payload),
          sendBookingNotificationToOwner(payload),
        ]);
      } catch (err) {
        console.error("Failed to send booking emails from webhook", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
