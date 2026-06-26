import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Sidebar } from "@/components/Sidebar";
import { NoteCard } from "@/components/NoteCard";
import { EmptyState } from "@/components/EmptyState";
import { NewNoteButton } from "@/components/NewNoteButton";
import { logoutAction } from "@/lib/auth-actions";
import type { Category, Note } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function fetchWithAuth(path: string) {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) redirect("/login");

  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) redirect("/login");
  return res;
}

interface NotesPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const { category } = await searchParams;

  const [categoriesRes, notesRes] = await Promise.all([
    fetchWithAuth("/api/categories/"),
    fetchWithAuth(`/api/notes/${category ? `?category=${category}` : ""}`),
  ]);

  const categories: Category[] = await categoriesRes.json();
  const notes: Note[] = await notesRes.json();

  const defaultCategoryId = categories[0]?.id;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 pt-8 pb-2">
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-accent text-[14px] font-sans hover:underline cursor-pointer"
          >
            Log out
          </button>
        </form>
        {defaultCategoryId && (
          <NewNoteButton defaultCategoryId={defaultCategoryId} />
        )}
      </header>

      <div className="flex flex-1 px-8 pb-8 gap-8">
        {/* Sidebar */}
        <Suspense>
          <Sidebar categories={categories} />
        </Suspense>

        {/* Notes grid */}
        <main className="flex-1">
          {notes.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-wrap gap-x-[13px] gap-y-4">
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
