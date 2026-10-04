import type { Metadata } from "next";
import Link from "next/link";
import { getAboutContent } from "@/lib/page-content";
import AboutForm from "./AboutForm";

export const metadata: Metadata = { title: "Edit about page" };
export const dynamic = "force-dynamic";

export default async function EditAboutPage() {
  const content = await getAboutContent();
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/pages" className="text-sm text-stone-500 hover:text-stone-800">
          ← All pages
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">About</h1>
        <p className="mt-1 text-sm text-stone-600">
          Hero plus the Chinese intro and three English paragraphs.{" "}
          <a href="/about" target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-800">
            View public page ↗
          </a>
        </p>
      </div>
      <AboutForm content={content} />
    </div>
  );
}
