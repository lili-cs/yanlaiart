import { cn } from "@/lib/utils";
import { Category } from "@/types";

const categoryColors: Record<Category, string> = {
  drawing: "bg-stone-200 text-stone-800",
  painting: "bg-amber-100 text-amber-900",
  ceramic: "bg-emerald-100 text-emerald-900",
};

interface BadgeProps {
  category: Category;
}

export default function Badge({ category }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        categoryColors[category]
      )}
    >
      {category}
    </span>
  );
}
