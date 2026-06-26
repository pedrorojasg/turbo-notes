import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { NoteEditor } from "@/components/NoteEditor";
import type { Note, Category } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default async function NoteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = (await cookies()).get("access_token")?.value;
  if (!token) redirect("/login");

  const [noteRes, categoriesRes] = await Promise.all([
    fetch(`${API_URL}/api/notes/${id}/`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(`${API_URL}/api/categories/`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);

  if (noteRes.status === 401) redirect("/login");
  if (noteRes.status === 404 || noteRes.status === 403) notFound();

  const note: Note = await noteRes.json();
  const categories: Category[] = await categoriesRes.json();

  return <NoteEditor initialNote={note} categories={categories} />;
}
