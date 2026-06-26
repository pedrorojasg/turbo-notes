/**
 * Format a date string for note preview cards.
 * - Today   → "today"
 * - Yesterday → "yesterday"
 * - Older  → "July 16"  (no year)
 */
export function formatCardDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (startOfDate.getTime() === startOfToday.getTime()) return "today";
  if (startOfDate.getTime() === startOfYesterday.getTime()) return "yesterday";

  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

/**
 * Format a date string for the note editor "Last Edited" timestamp.
 * → "July 21, 2024 at 8:39pm"
 */
export function formatEditorDate(dateStr: string): string {
  const date = new Date(dateStr);
  const datePart = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    .toLowerCase()
    .replace(" ", "");
  return `${datePart} at ${timePart}`;
}
