import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getStripe } from "@/lib/stripe";
import { getCourseBySlug } from "@/data/courses";
import { getEventBySlug } from "@/data/events";
import { formatPrice } from "@/lib/utils";
import { parseTimeRange } from "@/lib/ics";
import {
  sendBookingConfirmationToCustomer,
  sendBookingNotificationToOwner,
  type BookingEmailPayload,
} from "@/lib/email";
import { addBooking } from "@/lib/booking-store";
import { getBusinessHours, validateBookingSlot } from "@/lib/business-hours";

const STUDIO_ADDRESS = "Yan Lai Art Studio · Pennington, NJ 08534";

function addMinutesToHhmm(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const total = h * 60 + m + minutes;
  const wrapped = ((total % 1440) + 1440) % 1440;
  const nh = Math.floor(wrapped / 60);
  const nm = wrapped % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export const runtime = "nodejs";

interface CheckoutPayload {
  itemType?: string;
  itemSlug?: string;
  name?: string;
  email?: string;
  phone?: string;
  requestedDate?: string;
  requestedTime?: string;
  notes?: string;
  botcheck?: string;
}

export async function POST(request: Request) {
  let payload: CheckoutPayload;
  try {
    payload = (await request.json()) as CheckoutPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (payload.botcheck) {
    // Silent success for honeypot
    return NextResponse.json({ url: "/checkout/success?session_id=bot" });
  }

  const itemType = String(payload.itemType ?? "");
  const itemSlug = String(payload.itemSlug ?? "");
  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const phone = String(payload.phone ?? "").trim();
  const requestedDate = String(payload.requestedDate ?? "").trim();
  const requestedTime = String(payload.requestedTime ?? "").trim();
  const notes = String(payload.notes ?? "").trim();

  if (itemType !== "course" && itemType !== "event") {
    return NextResponse.json({ error: "Invalid item type." }, { status: 400 });
  }
  if (!name || !email) {
    return NextResponse.json(
      { error: "Please provide your name and email." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  if (itemType === "course" && (!requestedDate || !requestedTime)) {
    return NextResponse.json(
      { error: "Please choose a preferred date and time." },
      { status: 400 }
    );
  }
  if (notes.length > 2000) {
    return NextResponse.json({ error: "Notes are too long." }, { status: 400 });
  }

  if (itemType === "course") {
    const hours = await getBusinessHours();
    const check = validateBookingSlot(requestedDate, requestedTime, hours);
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }
  }

  let itemName: string;
  let itemDetails: string;
  let priceInCents: number;
  let isOnline = false;
  let meetingUrl: string | undefined;
  let meetingInstructions: string | undefined;
  let itemLocation: string | undefined;
  // For events, the date/time comes from the event itself; override the
  // customer's inputs so the calendar invite is anchored to the real slot.
  let effectiveDate = requestedDate;
  let effectiveStartTime = requestedTime;
  let effectiveEndTime: string | undefined;

  if (itemType === "course") {
    const course = await getCourseBySlug(itemSlug);
    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }
    if (course.status !== "open") {
      return NextResponse.json(
        { error: "This course isn't open for booking yet." },
        { status: 409 }
      );
    }
    itemName = `${course.title} (${course.titleCn})`;
    itemDetails = [
      course.duration,
      course.level,
      course.maxStudents ? `Max ${course.maxStudents} students` : null,
    ]
      .filter(Boolean)
      .join(" · ");
    priceInCents = course.price;
    isOnline = course.format === "online";
    meetingUrl = course.meetingUrl;
    meetingInstructions = course.meetingInstructions;
    itemLocation = isOnline ? undefined : STUDIO_ADDRESS;
    effectiveEndTime = addMinutesToHhmm(requestedTime, course.sessionMinutes ?? 60);
  } else {
    const event = getEventBySlug(itemSlug);
    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }
    itemName = `${event.title} (${event.titleCn})`;
    itemDetails = `${event.date} · ${event.time} · ${event.location}`;
    priceInCents = event.price;
    meetingUrl = event.meetingUrl;
    isOnline = Boolean(event.meetingUrl);
    itemLocation = event.location;
    effectiveDate = event.date;
    const range = parseTimeRange(event.time);
    if (range) {
      effectiveStartTime = range.start;
      effectiveEndTime = range.end;
    } else {
      effectiveStartTime = requestedTime; // best-effort fallback
    }
  }

  const amountLabel = priceInCents === 0 ? "Free" : formatPrice(priceInCents);

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const stripeReady = Boolean(stripeKey) && stripeKey !== "sk_test_xxx";

  // Free or demo-mode path: skip Stripe, send emails directly, then redirect to success.
  if (priceInCents === 0 || !stripeReady) {
    const referencePrefix = priceInCents === 0 ? "free" : "demo";
    // Random suffix eliminates same-millisecond collision if two users
    // submit the same free/demo course concurrently.
    const referenceId = `${referencePrefix}_${itemSlug}_${crypto.randomUUID()}`;

    const emailPayload: BookingEmailPayload = {
      itemType,
      itemName,
      itemDetails,
      customerName: name,
      customerEmail: email,
      customerPhone: phone || undefined,
      requestedDate: effectiveDate || undefined,
      requestedTime: effectiveStartTime || undefined,
      requestedEndTime: effectiveEndTime,
      notes: notes || undefined,
      amountLabel,
      referenceId,
      isOnline,
      meetingUrl,
      meetingInstructions,
      location: itemLocation,
    };

    try {
      await addBooking({
        id: referenceId,
        itemType,
        itemSlug,
        itemName,
        itemDetails,
        customerName: name,
        customerEmail: email,
        customerPhone: phone || undefined,
        requestedDate: effectiveDate || undefined,
        requestedTime: effectiveStartTime || undefined,
        requestedEndTime: effectiveEndTime,
        notes: notes || undefined,
        isOnline,
        meetingUrl,
        meetingInstructions,
        location: itemLocation,
        amountLabel,
        createdAt: Date.now(),
        source: priceInCents === 0 ? "free" : "demo",
        paymentStatus: "paid",
      });
    } catch (err) {
      console.error("Failed to persist booking", err);
    }

    try {
      await Promise.all([
        sendBookingConfirmationToCustomer(emailPayload),
        sendBookingNotificationToOwner(emailPayload),
      ]);
    } catch (err) {
      console.error("Booking email failed", err);
      // Don't block the booking flow if email sending fails.
    }

    return NextResponse.json({
      url: `/checkout/success?session_id=${encodeURIComponent(referenceId)}`,
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: itemName,
              description: itemDetails,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        itemType,
        itemSlug,
        customerName: name,
        customerEmail: email,
        customerPhone: phone.slice(0, 500),
        requestedDate: effectiveDate,
        requestedTime: effectiveStartTime,
        requestedEndTime: effectiveEndTime ?? "",
        notes: notes.slice(0, 500),
        isOnline: isOnline ? "1" : "0",
        meetingUrl: (meetingUrl ?? "").slice(0, 500),
        meetingInstructions: (meetingInstructions ?? "").slice(0, 500),
        location: (itemLocation ?? "").slice(0, 500),
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${itemType === "course" ? "courses" : "events"}/${itemSlug}`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session." },
        { status: 502 }
      );
    }

    // Persist the booking optimistically so the admin sees enrolled students
    // immediately, without depending on webhook delivery (which doesn't reach
    // localhost during dev). The Stripe webhook, when it fires, dedupes on
    // this same session.id and refreshes the record with the final payment.
    try {
      await addBooking({
        id: session.id,
        itemType,
        itemSlug,
        itemName,
        itemDetails,
        customerName: name,
        customerEmail: email,
        customerPhone: phone || undefined,
        requestedDate: effectiveDate || undefined,
        requestedTime: effectiveStartTime || undefined,
        requestedEndTime: effectiveEndTime,
        notes: notes || undefined,
        isOnline,
        meetingUrl,
        meetingInstructions,
        location: itemLocation,
        amountLabel,
        createdAt: Date.now(),
        source: "stripe",
        paymentStatus: "pending",
      });
    } catch (err) {
      console.error("Failed to persist optimistic booking", err);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe checkout failed", message);
    return NextResponse.json(
      { error: "We couldn't start checkout. Please try again shortly." },
      { status: 502 }
    );
  }
}
