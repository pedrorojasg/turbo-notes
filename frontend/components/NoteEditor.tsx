"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CategoryDropdown } from "@/components/CategoryDropdown";
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
  const [bgColor, setBgColor] = useState(initialNote.category_color);
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
    setBgColor(cat.color);
    pendingRef.current = { ...pendingRef.current, category_id: cat.id };
    // Category changes save immediately (no debounce)
    if (timerRef.current) clearTimeout(timerRef.current);
    save(pendingRef.current);
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: bgColor, transition: "background-color 0.3s ease" }}
    >
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 pt-8 pb-4">
        <button
          onClick={() => router.push("/notes")}
          aria-label="Back to notes"
          className="flex items-center gap-1.5 text-stone-600 hover:text-stone-800 transition-colors font-sans text-[14px]"
        >
          <span className="text-[16px]">←</span>
          <span>Back</span>
        </button>

        <CategoryDropdown
          categories={categories}
          selectedId={categoryId}
          onSelect={handleCategorySelect}
        />
      </header>

      {/* Editor */}
      <main className="flex-1 px-8 pb-8 flex flex-col">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Title"
          className="w-full bg-transparent border-none outline-none font-serif text-[32px] font-bold text-stone-800 placeholder:text-stone-400 mb-4"
          aria-label="Note title"
        />

        <div className="h-px bg-stone-800/10 mb-4" />

        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing…"
          className="flex-1 w-full bg-transparent border-none outline-none font-sans text-[16px] leading-relaxed text-stone-700 placeholder:text-stone-400 resize-none min-h-[400px]"
          aria-label="Note content"
        />
      </main>

      {/* Footer — last edited status */}
      <footer className="px-8 py-4 text-[12px] font-sans text-stone-500">
        {saving ? "Saving…" : `Last edited: ${formatEditorDate(lastSaved)}`}
      </footer>
    </div>
  );
}
