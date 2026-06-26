// Exact card colors from Figma design tokens (verified via MCP get_design_context)
export interface CategoryColors {
  bg: string;
  border: string;
  dot: string;
}

const COLOR_MAP: Record<string, CategoryColors> = {
  "#F3C9A6": { bg: "rgba(239,156,102,0.5)", border: "#ef9c66", dot: "#E2A06A" },
  "#F7E3B3": { bg: "rgba(252,220,148,0.5)", border: "#fcdc94", dot: "#EBC55F" },
  "#A9D7C9": { bg: "rgba(120,171,168,0.5)", border: "#78aba8", dot: "#5FB7A1" },
};

const FALLBACK: CategoryColors = {
  bg: "rgba(200,200,200,0.3)",
  border: "#ccc",
  dot: "#aaa",
};

export function getCategoryColors(hex: string): CategoryColors {
  return COLOR_MAP[hex.toUpperCase()] ?? COLOR_MAP[hex] ?? FALLBACK;
}
