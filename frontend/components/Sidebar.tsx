"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getCategoryColors } from "@/lib/categoryColors";
import type { Category } from "@/lib/types";

export function Sidebar({ categories }: { categories: Category[] }) {
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get("category");

  const isAllActive = !activeCategoryId;

  return (
    <aside className="w-[256px] shrink-0 flex flex-col">
      {/* All Categories */}
      <Link
        href="/notes"
        className={`flex h-[32px] items-center px-4 text-[12px] font-sans transition-colors ${
          isAllActive ? "font-bold text-black" : "font-normal text-black/70 hover:text-black"
        }`}
      >
        All Categories
      </Link>

      {/* Individual categories */}
      {categories.map((cat) => {
        const colors = getCategoryColors(cat.color);
        const isActive = activeCategoryId === String(cat.id);

        return (
          <Link
            key={cat.id}
            href={`/notes?category=${cat.id}`}
            className={`flex h-[32px] items-center gap-2 px-4 text-[12px] font-sans transition-colors ${
              isActive ? "font-bold text-black" : "font-normal text-black/70 hover:text-black"
            }`}
          >
            {/* Color dot */}
            <span
              className="shrink-0 size-[11px] rounded-full"
              style={{ backgroundColor: colors.dot }}
            />
            <span className="flex-1 min-w-0 truncate">{cat.name}</span>
            <span className="shrink-0">{cat.note_count}</span>
          </Link>
        );
      })}
    </aside>
  );
}
