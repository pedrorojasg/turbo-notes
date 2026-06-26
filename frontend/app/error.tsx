"use client";

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 text-center px-6">
      <h1 className="font-serif font-bold text-[40px] text-accent-dark leading-tight">
        Something went wrong
      </h1>
      <p className="text-accent text-[16px] max-w-md">
        We hit an unexpected error. Your notes are safe — try again.
      </p>
      <button
        onClick={() => unstable_retry()}
        className="mt-2 border border-accent text-accent rounded-full px-6 py-2 text-[14px] font-bold hover:bg-accent hover:text-cream transition-colors cursor-pointer"
      >
        Try again
      </button>
    </main>
  );
}
