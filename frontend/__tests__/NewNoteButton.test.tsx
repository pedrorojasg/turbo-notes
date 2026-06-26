import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NewNoteButton } from "@/components/NewNoteButton";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => {
  mockPush.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("NewNoteButton", () => {
  it("renders the New Note label", () => {
    render(<NewNoteButton defaultCategoryId={1} />);
    expect(screen.getByRole("button", { name: /New Note/ })).toBeTruthy();
  });

  it("POSTs a blank note with the default category and navigates to the editor", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 42 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<NewNoteButton defaultCategoryId={7} />);
    fireEvent.click(screen.getByRole("button", { name: /New Note/ }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/notes/42"));

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/notes");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      title: "",
      content: "",
      category_id: 7,
    });
  });

  it("does not navigate when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) })
    );

    render(<NewNoteButton defaultCategoryId={1} />);
    fireEvent.click(screen.getByRole("button", { name: /New Note/ }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /New Note/ })).toBeTruthy()
    );
    expect(mockPush).not.toHaveBeenCalled();
  });
});
