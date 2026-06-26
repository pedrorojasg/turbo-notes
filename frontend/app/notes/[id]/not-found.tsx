import Link from "next/link";

export default function NoteNotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-6 font-sans">
      <p className="text-accent/60 text-[48px]">404</p>
      <h1 className="text-stone-700 text-[24px] font-serif font-bold">
        Note not found
      </h1>
      <p className="text-stone-500 text-[14px]">
        This note may have been deleted or you don&apos;t have access to it.
      </p>
      <Link
        href="/notes"
        className="mt-2 px-6 py-2 border border-accent rounded-full text-accent font-bold text-[14px] hover:bg-accent hover:text-cream transition-colors"
      >
        Back to notes
      </Link>
    </div>
  );
}
