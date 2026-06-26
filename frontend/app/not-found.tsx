import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-serif font-bold text-[48px] text-accent-dark">
        Page Not Found
      </h1>
      <p className="text-accent text-[16px]">
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/notes"
        className="border border-accent text-accent rounded-full px-6 py-2 text-[14px] font-bold hover:bg-accent hover:text-cream transition-colors"
      >
        Back to notes
      </Link>
    </main>
  );
}
