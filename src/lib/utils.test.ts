import { describe, expect, it } from "vitest";
import { cn, formatDate, slugifyFilename } from "@/lib/utils";

describe("shared utils", () => {
  it("merges class names", () => {
    expect(cn("px-2", "px-4", false && "hidden", "font-medium")).toBe(
      "px-4 font-medium",
    );
  });

  it("formats dates for en-GB display", () => {
    expect(formatDate("2026-06-30T12:00:00.000Z")).toMatch(/30 Jun 2026/);
  });

  it("slugifies filenames safely", () => {
    expect(slugifyFilename("12 Example Street / REF-001")).toBe(
      "12-example-street-ref-001",
    );
  });
});
