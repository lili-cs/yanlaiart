"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Category } from "@/types";

const categories: { value: Category | "all"; label: string }[] = [
  { value: "all", label: "All Courses" },
  { value: "drawing", label: "Drawing" },
  { value: "painting", label: "Painting" },
  { value: "ceramic", label: "Ceramic" },
];

export default function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("category") || "all";

  function handleFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.push(`/courses?${params.toString()}`);
  }

  return (
    <div className="mb-8 flex flex-wrap justify-center gap-2">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => handleFilter(cat.value)}
          className={cn(
            "min-h-11 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            current === cat.value
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
