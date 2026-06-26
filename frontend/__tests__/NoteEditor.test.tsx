import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { NoteEditor } from "@/components/NoteEditor";
import type { Note, Category } from "@/lib/types";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockCategories: Category[] = [
  { id: 1, name: "Random Thoughts", color: "#F3C9A6", is_default: true, note_count: 2 },
  { id: 2, name: "School", color: "#F7E3B3", is_default: false, note_count: 1 },
  { id: 3, name: "Personal", color: "#A9D7C9", is_default: false, note_count: 0 },
];

const mockNote: Note = {
  id: 42,
  title: "My Note",
  content: "Hello world",
  category_id: 1,
  category_name: "Random Thoughts",
  category_color: "#F3C9A6",
  created_at: "2024-07-21T10:00:00.000Z",
  updated_at: "2024-07-21T20:39:00.000Z",
};

function renderEditor(note = mockNote, categories = mockCategories) {
  return render(<NoteEditor initialNote={note} categories={categories} />);
}

describe("NoteEditor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ...mockNote, updated_at: "2024-07-21T21:00:00.000Z" }),
      })
    );
    mockPush.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders the initial title and content", () => {
    renderEditor();
    expect(screen.getByDisplayValue("My Note")).toBeTruthy();
    expect(screen.getByDisplayValue("Hello world")).toBeTruthy();
  });

  it("renders the current category in the dropdown button", () => {
    renderEditor();
    expect(screen.getByText("Random Thoughts")).toBeTruthy();
  });

  it("shows 'Last edited:' with formatted timestamp", () => {
    renderEditor();
    expect(screen.getByText(/Last edited:/)).toBeTruthy();
  });

  it("debounces save when title changes — does not call fetch immediately", async () => {
    renderEditor();
    const titleInput = screen.getByLabelText("Note title");

    fireEvent.change(titleInput, { target: { value: "Updated title" } });

    // Not yet called (debounced)
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("calls fetch after 500ms debounce following title change", async () => {
    renderEditor();
    const titleInput = screen.getByLabelText("Note title");

    fireEvent.change(titleInput, { target: { value: "Updated title" } });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(vi.mocked(fetch)).toHaveBeenCalledOnce();
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      "/api/notes/42",
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("only fires one save when title changes multiple times within 500ms", async () => {
    renderEditor();
    const titleInput = screen.getByLabelText("Note title");

    fireEvent.change(titleInput, { target: { value: "A" } });
    fireEvent.change(titleInput, { target: { value: "AB" } });
    fireEvent.change(titleInput, { target: { value: "ABC" } });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(vi.mocked(fetch)).toHaveBeenCalledOnce();
  });

  it("saves with latest values after debounce when both title and content change", async () => {
    renderEditor();
    const titleInput = screen.getByLabelText("Note title");
    const contentInput = screen.getByLabelText("Note content");

    fireEvent.change(titleInput, { target: { value: "New title" } });
    fireEvent.change(contentInput, { target: { value: "New content" } });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(vi.mocked(fetch)).toHaveBeenCalledOnce();
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.title).toBe("New title");
    expect(body.content).toBe("New content");
  });

  it("saves immediately (no debounce) when category changes", async () => {
    renderEditor();

    // Open the dropdown
    fireEvent.click(screen.getByRole("button", { name: /Random Thoughts/ }));
    // Select a different category
    fireEvent.click(screen.getByRole("option", { name: /School/ }).querySelector("button")!);

    // Should save immediately without needing to advance timers
    await act(async () => {});

    expect(vi.mocked(fetch)).toHaveBeenCalledOnce();
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.category_id).toBe(2);
  });

  it("navigates to /notes when back button is clicked", () => {
    renderEditor();
    fireEvent.click(screen.getByLabelText("Back to notes"));
    expect(mockPush).toHaveBeenCalledWith("/notes");
  });
});
