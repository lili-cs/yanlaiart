import type { Metadata } from "next";
import { getBusinessHours } from "@/lib/business-hours";
import { getContactContent } from "@/lib/page-content";
import ContactForm from "./ContactForm";
import HoursForm from "./HoursForm";

export const metadata: Metadata = { title: "Edit contact page" };
export const dynamic = "force-dynamic";

export default async function EditContactPage() {
  const [content, hours] = await Promise.all([
    getContactContent(),
    getBusinessHours(),
  ]);
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Contact</h1>
        <p className="mt-1 text-sm text-stone-600">
          Hero, contact details, studio hours, the message-form heading, and
          the hours bookings may fall within.{" "}
          <a href="/contact" target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-800">
            View public page ↗
          </a>
        </p>
      </div>

      <ContactForm content={content} />

      <section className="space-y-4 border-t border-stone-200 pt-10">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">
            Bookable business hours
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Separate from the studio hours shown on the contact page — these
            gate the booking slot picker. A date marked closed can&apos;t be
            booked at all.
          </p>
        </div>
        <HoursForm initialHours={hours} />
      </section>
    </div>
  );
}
