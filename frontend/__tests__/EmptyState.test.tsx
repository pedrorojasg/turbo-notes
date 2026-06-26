import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/EmptyState";

describe("EmptyState", () => {
  it("renders the waiting message", () => {
    render(<EmptyState />);
    expect(
      screen.getByText(/just here waiting for your charming notes/i)
    ).toBeTruthy();
  });

  it("renders the cactus illustration with alt text", () => {
    render(<EmptyState />);
    const img = screen.getByRole("img");
    expect(img.getAttribute("alt")).toBe("No notes yet");
  });
});
