import Link from "next/link";
import { getCategoryColors } from "@/lib/categoryColors";
import { formatCardDate } from "@/lib/formatDate";
import type { Note } from "@/lib/types";

export function NoteCard({ note }: { note: Note }) {
  const colors = getCategoryColors(note.category_color);
  const dateLabel = formatCardDate(note.updated_at);

  return (
    <Link href={`/notes/${note.id}`} className="block">
      <article
        className="flex flex-col gap-3 h-[246px] w-[303px] rounded-[11px] p-4 shadow-[1px_1px_2px_0px_rgba(0,0,0,0.25)] border-[3px] overflow-hidden hover:opacity-90 transition-opacity cursor-pointer"
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
        }}
      >
        {/* Date + category row */}
        <div className="flex gap-2 items-start text-[12px] whitespace-nowrap shrink-0">
          <span className="font-bold font-sans">{dateLabel}</span>
          <span className="font-normal font-sans">{note.category_name}</span>
        </div>

        {/* Title */}
        <h2 className="font-serif font-bold text-[24px] leading-[normal] line-clamp-2 shrink-0">
          {note.title || <span className="opacity-40 italic">Untitled</span>}
        </h2>

        {/* Content preview — clamp to fill remaining space */}
        <p className="font-sans font-normal text-[12px] leading-normal line-clamp-5 flex-1 overflow-hidden">
          {note.content}
        </p>
      </article>
    </Link>
  );
}
