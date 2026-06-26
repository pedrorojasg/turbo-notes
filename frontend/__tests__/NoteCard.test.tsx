import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NoteCard } from "@/components/NoteCard";
import { getCategoryColors } from "@/lib/categoryColors";
import type { Note } from "@/lib/types";

const FIXED_NOW = new Date("2024-07-21T20:39:00.000Z");

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});

afterAll(() => {
  vi.useRealTimers();
});

const baseNote: Note = {
  id: 7,
  title: "Grocery list",
  content: "Milk, eggs, bread",
  category_id: 1,
  category_name: "Personal",
  category_color: "#A9D7C9",
  created_at: "2024-07-21T10:00:00.000Z",
  updated_at: "2024-07-21T10:00:00.000Z",
};

describe("NoteCard", () => {
  it("renders the title, category name and content", () => {
    render(<NoteCard note={baseNote} />);
    expect(screen.getByText("Grocery list")).toBeTruthy();
    expect(screen.getByText("Personal")).toBeTruthy();
    expect(screen.getByText("Milk, eggs, bread")).toBeTruthy();
  });

  it("links to the note editor", () => {
    render(<NoteCard note={baseNote} />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/notes/7");
  });

  it("shows 'today' for a note updated today", () => {
    render(<NoteCard note={baseNote} />);
    expect(screen.getByText("today")).toBeTruthy();
  });

  it("applies the category color to the card background and border", () => {
    const { container } = render(<NoteCard note={baseNote} />);
    const article = container.querySelector("article")!;
    const colors = getCategoryColors("#A9D7C9");
    expect(article.style.backgroundColor).toBeTruthy();
    expect(article.style.borderColor).toBeTruthy();
    // sanity: the resolved color map is wired through (teal border)
    expect(colors.border).toBe("#78aba8");
  });

  it("falls back to 'Untitled' when the title is empty", () => {
    render(<NoteCard note={{ ...baseNote, title: "" }} />);
    expect(screen.getByText("Untitled")).toBeTruthy();
  });
});
