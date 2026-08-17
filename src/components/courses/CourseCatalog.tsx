"use client";

import { useMemo, useState } from "react";
import CourseCard from "./CourseCard";
import { cn } from "@/lib/utils";
import type { Course, Category } from "@/types";

interface Props {
  courses: Course[];
}

type CategoryFilter = "all" | Category;
type LevelFilter = "all" | Course["level"];
type FormatFilter = "all" | Course["format"];
type StatusFilter = "all" | "open" | "upcoming";

const CATEGORY_OPTS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "drawing", label: "Drawing" },
  { value: "painting", label: "Painting" },
  { value: "ceramic", label: "Ceramic" },
];

const LEVEL_OPTS: { value: LevelFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

const FORMAT_OPTS: { value: FormatFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in-person", label: "In-person" },
  { value: "online", label: "Online" },
];

const STATUS_OPTS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "upcoming", label: "Upcoming" },
];

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

export default function CourseCatalog({ courses }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [format, setFormat] = useState<FormatFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    return courses.filter((c) => {
      if (c.status === "cancelled") return false;
      if (category !== "all" && c.category !== category) return false;
      if (level !== "all" && c.level !== level) return false;
      if (format !== "all" && c.format !== format) return false;
      if (status !== "all" && c.status !== status) return false;
      if (tokens.length === 0) return true;
      const haystack = [
        c.title,
        c.titleCn,
        c.description,
        c.longDescription,
        c.level,
        c.category,
        c.format,
        c.duration,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return tokens.every((t) => haystack.includes(t));
    });
  }, [courses, query, category, level, format, status]);

  const anyFilterActive =
    query.trim().length > 0 ||
    category !== "all" ||
    level !== "all" ||
    format !== "all" ||
    status !== "all";

  function clearAll() {
    setQuery("");
    setCategory("all");
    setLevel("all");
    setFormat("all");
    setStatus("all");
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 rounded-xl border border-stone-200 bg-white/70 p-3 shadow-sm backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
        <div className="relative flex-1 sm:min-w-[16rem]">
          <label htmlFor="course-search" className="sr-only">
            Search courses
          </label>
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="course-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses…"
            className="block w-full rounded-md border border-stone-300 bg-white pl-8 pr-3 py-1.5 text-sm text-stone-900 placeholder-stone-400 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
          />
        </div>

        <FilterSelect
          label="Category"
          options={CATEGORY_OPTS}
          value={category}
          onChange={(v) => setCategory(v as CategoryFilter)}
        />
        <FilterSelect
          label="Level"
          options={LEVEL_OPTS}
          value={level}
          onChange={(v) => setLevel(v as LevelFilter)}
        />
        <FilterSelect
          label="Format"
          options={FORMAT_OPTS}
          value={format}
          onChange={(v) => setFormat(v as FormatFilter)}
        />
        <FilterSelect
          label="Status"
          options={STATUS_OPTS}
          value={status}
          onChange={(v) => setStatus(v as StatusFilter)}
        />

        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="text-xs text-stone-500">
            <strong className="tabular-nums text-stone-800">
              {filtered.length}
            </strong>{" "}
            {filtered.length === 1 ? "course" : "courses"}
          </span>
          {anyFilterActive && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center rounded-md border border-stone-300 bg-white px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-10 text-center">
          <p className="text-base font-semibold text-stone-800">
            No courses match your filters.
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Try clearing a filter or searching for a different term.
          </p>
          {anyFilterActive && (
            <button
              type="button"
              onClick={clearAll}
              className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

interface FilterSelectProps<V extends string> {
  label: string;
  options: { value: V; label: string }[];
  value: V;
  onChange: (value: V) => void;
}

function FilterSelect<V extends string>({
  label,
  options,
  value,
  onChange,
}: FilterSelectProps<V>) {
  const isActive = value !== "all";
  return (
    <label
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
        isActive
          ? "border-amber-700 bg-amber-50 text-amber-900"
          : "border-stone-300 bg-white text-stone-600 hover:bg-stone-50"
      )}
    >
      <span className="text-stone-500">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as V)}
        className="min-w-0 cursor-pointer appearance-none bg-transparent pr-4 text-xs font-semibold text-current focus:outline-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0 center",
          backgroundSize: "10px 10px",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
