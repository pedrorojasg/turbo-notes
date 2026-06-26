import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/Sidebar";
import type { Category } from "@/lib/types";

// Controllable search params for the active-filter state
let currentParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => currentParams,
}));

const categories: Category[] = [
  { id: 1, name: "Random Thoughts", color: "#F3C9A6", is_default: true, note_count: 3 },
  { id: 2, name: "School", color: "#F7E3B3", is_default: false, note_count: 0 },
  { id: 3, name: "Personal", color: "#A9D7C9", is_default: false, note_count: 5 },
];

describe("Sidebar", () => {
  beforeEach(() => {
    currentParams = new URLSearchParams();
  });

  it("renders 'All Categories' plus each category name", () => {
    render(<Sidebar categories={categories} />);
    expect(screen.getByText("All Categories")).toBeTruthy();
    expect(screen.getByText("Random Thoughts")).toBeTruthy();
    expect(screen.getByText("School")).toBeTruthy();
    expect(screen.getByText("Personal")).toBeTruthy();
  });

  it("renders the note count for each category", () => {
    render(<Sidebar categories={categories} />);
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("links each category to its filter URL", () => {
    render(<Sidebar categories={categories} />);
    const schoolLink = screen.getByText("School").closest("a")!;
    expect(schoolLink.getAttribute("href")).toBe("/notes?category=2");
  });

  it("marks 'All Categories' active (bold) when no filter is set", () => {
    render(<Sidebar categories={categories} />);
    const allLink = screen.getByText("All Categories");
    expect(allLink.className).toContain("font-bold");
  });

  it("marks the selected category active when its filter is set", () => {
    currentParams = new URLSearchParams("category=3");
    render(<Sidebar categories={categories} />);
    const personalLink = screen.getByText("Personal").closest("a")!;
    expect(personalLink.className).toContain("font-bold");
    // and "All Categories" is no longer the active one
    expect(screen.getByText("All Categories").className).not.toContain("font-bold");
  });
});
