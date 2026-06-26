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
  const colors = getCategoryColors(selected?.color ?? "");

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
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-sm font-sans font-medium transition-colors"
        style={{ borderColor: colors.border, backgroundColor: colors.bg }}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: colors.dot }}
        />
        <span className="text-stone-700">{selected?.name}</span>
        <span className="text-stone-400 text-[10px]">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-1.5 z-50 min-w-[180px] rounded-xl border border-stone-200 bg-cream shadow-lg overflow-hidden"
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
                  className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-sans text-left transition-colors ${
                    isSelected
                      ? "font-semibold text-stone-800"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
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
