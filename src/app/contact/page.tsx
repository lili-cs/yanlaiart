import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ContactForm from "@/components/contact/ContactForm";

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
        backgroundImage="/images/figure.jpg"
        backgroundImageStyle="showcase"
      />
      <div className="relative overflow-hidden bg-gradient-to-b from-stone-100 via-amber-50/40 to-stone-50 py-16 sm:py-20">
        {/* Rose-bouquet watercolor melted into the upper-right corner — welcoming, floral */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/bouquet.jpg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-[36rem] w-[36rem] object-cover opacity-[0.18] mix-blend-multiply"
          style={{
            objectPosition: "center center",
            maskImage:
              "radial-gradient(circle at 65% 35%, rgba(0,0,0,0.85) 15%, rgba(0,0,0,0.4) 45%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(circle at 65% 35%, rgba(0,0,0,0.85) 15%, rgba(0,0,0,0.4) 45%, transparent 75%)",
          }}
        />
        <div className="pointer-events-none absolute -left-40 top-20 h-[28rem] w-[28rem] rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-20 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-4xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-300/70 bg-stone-50/85 p-6 shadow-md shadow-stone-500/10 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-amber-700/60 hover:shadow-xl hover:shadow-amber-900/15">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-amber-100/80 text-amber-800 ring-1 ring-amber-700/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-5 w-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                  Email
                </h3>
                <a
                  href="mailto:yichenhot@icloud.com"
                  className="mt-2 block break-all text-lg font-medium text-stone-900 hover:text-amber-900"
                >
                  yichenhot@icloud.com
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-300/70 bg-stone-50/85 p-6 shadow-md shadow-stone-500/10 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-amber-700/60 hover:shadow-xl hover:shadow-amber-900/15">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-amber-100/80 text-amber-800 ring-1 ring-amber-700/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-5 w-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                  Phone
                </h3>
                <a
                  href="tel:+19293299686"
                  className="mt-2 block text-lg font-medium text-stone-900 hover:text-amber-900"
                >
                  (929) 329-9686
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-300/70 bg-stone-50/85 p-6 shadow-md shadow-stone-500/10 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-amber-700/60 hover:shadow-xl hover:shadow-amber-900/15">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-amber-100/80 text-amber-800 ring-1 ring-amber-700/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-5 w-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                  Studio Address
                </h3>
                <p className="mt-2 text-lg font-medium text-stone-900">
                  Pennington, NJ 08534
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-300/70 bg-stone-50/85 p-6 shadow-md shadow-stone-500/10 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-amber-700/60 hover:shadow-xl hover:shadow-amber-900/15">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-amber-100/80 text-amber-800 ring-1 ring-amber-700/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-5 w-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                  Studio Hours
                </h3>
                <dl className="mt-3 space-y-1 text-sm text-stone-700">
              <div className="flex justify-between">
                <dt>Monday – Friday</dt>
                <dd>1:30 PM – 8:00 PM</dd>
              </div>
              <div className="flex justify-between">
                <dt>Saturday</dt>
                <dd>Closed</dd>
              </div>
              <div className="flex justify-between">
                <dt>Sunday</dt>
                <dd>10:00 AM – 8:00 PM</dd>
              </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-300/70 bg-stone-50/85 p-6 shadow-md shadow-stone-500/10 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-stone-900">Send a Message</h3>
          <p className="mt-1 text-sm text-stone-600">
            Have a question about a course or want to book studio time? Drop us a
            note.
          </p>
          <ContactForm />
        </div>
        </div>
      </div>
    </>
  );
}
