import { describe, it, expect } from "vitest";
import { getCategoryColors } from "@/lib/categoryColors";

describe("getCategoryColors", () => {
  it("returns correct colors for Random Thoughts (#F3C9A6)", () => {
    const colors = getCategoryColors("#F3C9A6");
    expect(colors.bg).toContain("239,156,102");
    expect(colors.border).toBe("#ef9c66");
    expect(colors.dot).toBe("#E2A06A");
  });

  it("returns correct colors for School (#F7E3B3)", () => {
    const colors = getCategoryColors("#F7E3B3");
    expect(colors.bg).toContain("252,220,148");
    expect(colors.border).toBe("#fcdc94");
    expect(colors.dot).toBe("#EBC55F");
  });

  it("returns correct colors for Personal (#A9D7C9)", () => {
    const colors = getCategoryColors("#A9D7C9");
    expect(colors.bg).toContain("120,171,168");
    expect(colors.border).toBe("#78aba8");
    expect(colors.dot).toBe("#5FB7A1");
  });

  it("returns a fallback for unknown colors", () => {
    const colors = getCategoryColors("#123456");
    expect(colors.bg).toBeTruthy();
    expect(colors.border).toBeTruthy();
    expect(colors.dot).toBeTruthy();
  });
});
