import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CategoryDropdown } from "@/components/CategoryDropdown";
import type { Category } from "@/lib/types";

const categories: Category[] = [
  { id: 1, name: "Random Thoughts", color: "#F3C9A6", is_default: true, note_count: 2 },
  { id: 2, name: "School", color: "#F7E3B3", is_default: false, note_count: 1 },
  { id: 3, name: "Personal", color: "#A9D7C9", is_default: false, note_count: 0 },
];

describe("CategoryDropdown", () => {
  it("shows the currently selected category in the trigger", () => {
    render(
      <CategoryDropdown categories={categories} selectedId={2} onSelect={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: /School/ })).toBeTruthy();
  });

  it("is collapsed by default (no listbox)", () => {
    render(
      <CategoryDropdown categories={categories} selectedId={1} onSelect={vi.fn()} />
    );
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("opens the option list when the trigger is clicked", () => {
    render(
      <CategoryDropdown categories={categories} selectedId={1} onSelect={vi.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: /Random Thoughts/ }));
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("calls onSelect with the chosen category and closes", () => {
    const onSelect = vi.fn();
    render(
      <CategoryDropdown categories={categories} selectedId={1} onSelect={onSelect} />
    );
    fireEvent.click(screen.getByRole("button", { name: /Random Thoughts/ }));
    fireEvent.click(
      screen.getByRole("option", { name: /Personal/ }).querySelector("button")!
    );
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 3, name: "Personal" })
    );
    // closed again
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("marks the selected option as aria-selected", () => {
    render(
      <CategoryDropdown categories={categories} selectedId={2} onSelect={vi.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: /School/ }));
    const selectedOption = screen
      .getAllByRole("option")
      .find((o) => o.getAttribute("aria-selected") === "true");
    expect(selectedOption?.textContent).toContain("School");
  });
});
