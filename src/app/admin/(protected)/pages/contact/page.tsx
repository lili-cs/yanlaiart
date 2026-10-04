import type { Metadata } from "next";
import Link from "next/link";
import { getContactContent } from "@/lib/page-content";
import ContactForm from "./ContactForm";

export const metadata: Metadata = { title: "Edit contact page" };
export const dynamic = "force-dynamic";

export default async function EditContactPage() {
  const content = await getContactContent();
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/pages" className="text-sm text-stone-500 hover:text-stone-800">
          ← All pages
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">Contact</h1>
        <p className="mt-1 text-sm text-stone-600">
          Hero, contact details, studio hours, and the message-form heading.{" "}
          <a href="/contact" target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-800">
            View public page ↗
          </a>
        </p>
      </div>
      <ContactForm content={content} />
    </div>
  );
}
