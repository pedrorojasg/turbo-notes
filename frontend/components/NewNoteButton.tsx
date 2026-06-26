"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Category } from "@/lib/types";

export function NewNoteButton({ defaultCategoryId }: { defaultCategoryId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "", content: "", category_id: defaultCategoryId }),
      });
      if (res.ok) {
        const note = await res.json();
        router.push(`/notes/${note.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center justify-center gap-[6px] h-[43px] w-[133px] px-[16px] py-[12px] border border-accent rounded-[46px] text-accent font-bold text-[16px] font-sans hover:bg-accent/20 transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap"
    >
      <span className="text-[16px] leading-none">+</span>
      {loading ? "Creating…" : "New Note"}
    </button>
  );
}
