import { cn } from "@/lib/utils";
import { Category } from "@/types";

const categoryColors: Record<Category, string> = {
  drawing: "bg-blue-100 text-blue-800",
  painting: "bg-amber-100 text-amber-800",
  ceramic: "bg-green-100 text-green-800",
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
