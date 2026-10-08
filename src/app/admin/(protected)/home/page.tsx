import type { Metadata } from "next";
import { getHomeContent } from "@/lib/page-content";
import HomeForm from "./HomeForm";

export const metadata: Metadata = { title: "Edit home page" };
export const dynamic = "force-dynamic";

export default async function EditHomePage() {
  const content = await getHomeContent();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Home</h1>
        <p className="mt-1 text-sm text-stone-600">
          Hero text and the three section headings.{" "}
          <a href="/" target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-800">
            View page ↗
          </a>
        </p>
      </div>
      <HomeForm content={content} />
    </div>
  );
}
