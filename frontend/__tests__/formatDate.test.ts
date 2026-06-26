import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { formatCardDate, formatEditorDate } from "@/lib/formatDate";

const FIXED_NOW = new Date("2024-07-21T20:39:00.000Z");

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});

afterAll(() => {
  vi.useRealTimers();
});

describe("formatCardDate", () => {
  it("returns 'today' for a timestamp from today", () => {
    const todayStr = new Date("2024-07-21T10:00:00.000Z").toISOString();
    expect(formatCardDate(todayStr)).toBe("today");
  });

  it("returns 'yesterday' for a timestamp from yesterday", () => {
    const yesterdayStr = new Date("2024-07-20T15:00:00.000Z").toISOString();
    expect(formatCardDate(yesterdayStr)).toBe("yesterday");
  });

  it("returns 'Month Day' for older dates — no year", () => {
    const oldStr = new Date("2024-07-16T09:00:00.000Z").toISOString();
    const result = formatCardDate(oldStr);
    expect(result).toBe("July 16");
    expect(result).not.toMatch(/\d{4}/); // no year
  });

  it("returns 'Month Day' for dates from a different month", () => {
    const oldStr = new Date("2024-06-12T09:00:00.000Z").toISOString();
    expect(formatCardDate(oldStr)).toBe("June 12");
  });
});

describe("formatEditorDate", () => {
  it("formats with full date and time — no seconds", () => {
    const str = new Date("2024-07-21T20:39:00.000Z").toISOString();
    const result = formatEditorDate(str);
    // Should contain the date and a time with am/pm
    expect(result).toMatch(/July 21, 2024/);
    expect(result).toMatch(/at \d{1,2}:\d{2}(am|pm)/);
  });

  it("does not include seconds", () => {
    const str = new Date("2024-07-21T20:39:00.000Z").toISOString();
    expect(formatEditorDate(str)).not.toMatch(/:\d{2}:\d{2}/);
  });
});
