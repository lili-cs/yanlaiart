import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Yan Lai Art — visit our studio, send us a message, or ask about upcoming courses and events.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        title="Contact Us"
        subtitle="We'd love to hear from you"
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Email
            </h3>
            <a
              href="mailto:info@yanlaiart.com"
              className="mt-2 block text-lg font-medium text-gray-900 hover:text-gray-700"
            >
              info@yanlaiart.com
            </a>
            <p className="mt-1 text-sm text-gray-600">
              We reply within one business day.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Phone
            </h3>
            <a
              href="tel:+15551234567"
              className="mt-2 block text-lg font-medium text-gray-900 hover:text-gray-700"
            >
              (555) 123-4567
            </a>
            <p className="mt-1 text-sm text-gray-600">
              Mon–Sat, 10:00 AM – 6:00 PM
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Studio
            </h3>
            <p className="mt-2 text-lg font-medium text-gray-900">
              Pennington, NJ 08534
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Free street parking after 6 PM
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Studio Hours
            </h3>
            <dl className="mt-3 space-y-1 text-sm text-gray-700">
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

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Send a Message</h3>
          <p className="mt-1 text-sm text-gray-600">
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
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700"
              >
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
