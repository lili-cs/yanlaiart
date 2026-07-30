import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Yan Lai Art — visit our studio, send us a message, or ask about upcoming courses and events.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="We'd love to hear from you"
      />
      <div className="relative overflow-hidden bg-gradient-to-b from-stone-100 via-amber-50/40 to-stone-50 py-16 sm:py-20">
        <div className="pointer-events-none absolute -left-40 top-20 h-[28rem] w-[28rem] rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-20 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-4xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-300/70 bg-stone-50/85 p-6 shadow-md shadow-stone-500/10 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-amber-700/60 hover:shadow-xl hover:shadow-amber-900/15">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Email
            </h3>
            <a
              href="mailto:info@yanlaiart.com"
              className="mt-2 block text-lg font-medium text-stone-900 hover:text-amber-900"
            >
              info@yanlaiart.com
            </a>
            <p className="mt-1 text-sm text-stone-600">
              We reply within one business day.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-300/70 bg-stone-50/85 p-6 shadow-md shadow-stone-500/10 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-amber-700/60 hover:shadow-xl hover:shadow-amber-900/15">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Phone
            </h3>
            <a
              href="tel:+15551234567"
              className="mt-2 block text-lg font-medium text-stone-900 hover:text-amber-900"
            >
              (555) 123-4567
            </a>
            <p className="mt-1 text-sm text-stone-600">
              Mon–Sat, 10:00 AM – 6:00 PM
            </p>
          </div>

          <div className="rounded-2xl border border-stone-300/70 bg-stone-50/85 p-6 shadow-md shadow-stone-500/10 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-amber-700/60 hover:shadow-xl hover:shadow-amber-900/15">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Studio
            </h3>
            <p className="mt-2 text-lg font-medium text-stone-900">
              Pennington, NJ 08534
            </p>
            <p className="mt-1 text-sm text-stone-600">
              Free street parking after 6 PM
            </p>
          </div>

          <div className="rounded-2xl border border-stone-300/70 bg-stone-50/85 p-6 shadow-md shadow-stone-500/10 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-amber-700/60 hover:shadow-xl hover:shadow-amber-900/15">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Studio Hours
            </h3>
            <dl className="mt-3 space-y-1 text-sm text-stone-700">
              <div className="flex justify-between">
                <dt>Monday – Friday</dt>
                <dd>10:00 AM – 8:00 PM</dd>
              </div>
              <div className="flex justify-between">
                <dt>Saturday</dt>
                <dd>10:00 AM – 6:00 PM</dd>
              </div>
              <div className="flex justify-between">
                <dt>Sunday</dt>
                <dd>Closed</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-300/70 bg-stone-50/85 p-6 shadow-md shadow-stone-500/10 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-stone-900">Send a Message</h3>
          <p className="mt-1 text-sm text-stone-600">
            Have a question about a course or want to book studio time? Drop us a
            note.
          </p>
          <form
            action="mailto:info@yanlaiart.com"
            method="post"
            encType="text/plain"
            className="mt-6 space-y-4"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-stone-700"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-stone-300 bg-white/90 px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-stone-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-stone-300 bg-white/90 px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-stone-700"
              >
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                className="mt-1 block w-full rounded-md border border-stone-300 bg-white/90 px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-stone-700"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="mt-1 block w-full rounded-md border border-stone-300 bg-white/90 px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-lg bg-stone-800 px-4 py-2.5 text-sm font-semibold text-stone-50 shadow-md transition-all hover:-translate-y-0.5 hover:bg-stone-900 hover:shadow-lg hover:shadow-stone-500/20"
            >
              Send Message
            </button>
          </form>
        </div>
        </div>
      </div>
    </>
  );
}
