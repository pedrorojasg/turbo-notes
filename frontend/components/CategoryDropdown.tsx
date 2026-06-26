"use client";

import { useState, useRef, useEffect } from "react";
import { getCategoryColors } from "@/lib/categoryColors";
import type { Category } from "@/lib/types";

interface CategoryDropdownProps {
  categories: Category[];
  selectedId: number;
  onSelect: (category: Category) => void;
}

export function CategoryDropdown({
  categories,
  selectedId,
  onSelect,
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = categories.find((c) => c.id === selectedId) ?? categories[0];
  const selectedColors = getCategoryColors(selected?.color ?? "");

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative flex flex-col items-start w-[225px]">
      {/* Trigger — neutral accent border, colored dot, chevron */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 w-full h-[39px] px-[15px] py-[7px] rounded-[6px] border border-accent bg-cream"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span
          className="size-[11px] rounded-full shrink-0"
          style={{ backgroundColor: selectedColors.dot }}
        />
        <span className="flex-1 min-w-0 text-left text-[12px] text-black truncate font-sans">
          {selected?.name}
        </span>
        <svg
          className={`size-[16px] text-accent shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Menu — cream background, rounded-8 */}
      {open && (
        <ul
          role="listbox"
          className="absolute top-full left-0 mt-[7px] z-50 w-[225px] bg-cream rounded-[8px] border border-accent/20 shadow-[1px_1px_4px_0px_rgba(0,0,0,0.15)] overflow-hidden"
        >
          {categories.map((cat) => {
            const catColors = getCategoryColors(cat.color);
            const isSelected = cat.id === selectedId;
            return (
              <li key={cat.id} role="option" aria-selected={isSelected}>
                <button
                  onClick={() => {
                    onSelect(cat);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full h-[32px] px-[16px] text-left text-[12px] text-black font-sans transition-colors hover:bg-accent/10 ${
                    isSelected ? "font-semibold" : ""
                  }`}
                >
                  <span
                    className="size-[11px] rounded-full shrink-0"
                    style={{ backgroundColor: catColors.dot }}
                  />
                  {cat.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
