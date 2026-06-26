"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CategoryDropdown } from "@/components/CategoryDropdown";
import { getCategoryColors } from "@/lib/categoryColors";
import { formatEditorDate } from "@/lib/formatDate";
import type { Note, Category } from "@/lib/types";

interface NoteEditorProps {
  initialNote: Note;
  categories: Category[];
}

export function NoteEditor({ initialNote, categories }: NoteEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialNote.title);
  const [content, setContent] = useState(initialNote.content);
  const [categoryId, setCategoryId] = useState(initialNote.category_id);
  const [cardColor, setCardColor] = useState(initialNote.category_color);
  const [lastSaved, setLastSaved] = useState(initialNote.updated_at);
  const [saving, setSaving] = useState(false);

  // Tracks the latest field values to avoid stale closures in the debounced save
  const pendingRef = useRef({
    title: initialNote.title,
    content: initialNote.content,
    category_id: initialNote.category_id,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (patch: { title: string; content: string; category_id: number }) => {
      setSaving(true);
      try {
        const res = await fetch(`/api/notes/${initialNote.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (res.ok) {
          const updated: Note = await res.json();
          setLastSaved(updated.updated_at);
        }
      } finally {
        setSaving(false);
      }
    },
    [initialNote.id]
  );

  function scheduleSave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(pendingRef.current), 500);
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setTitle(value);
    pendingRef.current = { ...pendingRef.current, title: value };
    scheduleSave();
  }

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setContent(value);
    pendingRef.current = { ...pendingRef.current, content: value };
    scheduleSave();
  }

  function handleCategorySelect(cat: Category) {
    setCategoryId(cat.id);
    setCardColor(cat.color);
    pendingRef.current = { ...pendingRef.current, category_id: cat.id };
    // Category changes save immediately (no debounce)
    if (timerRef.current) clearTimeout(timerRef.current);
    save(pendingRef.current);
  }

  const colors = getCategoryColors(cardColor);

  return (
    <div className="min-h-screen bg-cream flex flex-col px-[37px] pt-[33px] pb-[37px]">
      {/* Top bar: category dropdown (left) + close (right) */}
      <div className="flex items-start justify-between mb-3">
        <CategoryDropdown
          categories={categories}
          selectedId={categoryId}
          onSelect={handleCategorySelect}
        />

        <button
          onClick={() => router.push("/notes")}
          aria-label="Close note"
          className="size-6 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Colored note card panel */}
      <div
        className="flex-1 flex flex-col gap-6 rounded-[11px] border-[3px] shadow-[1px_1px_2px_0px_rgba(0,0,0,0.25)] px-[64px] pt-[39px] pb-[64px]"
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}
      >
        <span className="text-right text-[12px] text-black/80 font-sans">
          {saving ? "Saving…" : `Last Edited: ${formatEditorDate(lastSaved)}`}
        </span>

        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note Title"
          aria-label="Note title"
          className="w-full bg-transparent border-none outline-none font-serif font-bold text-[24px] leading-[normal] text-black placeholder:text-black/40"
        />

        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Pour your heart out…"
          aria-label="Note content"
          className="flex-1 w-full bg-transparent border-none outline-none font-sans text-[16px] leading-[27px] text-black placeholder:text-black/40 resize-none"
        />
      </div>
    </div>
  );
}
