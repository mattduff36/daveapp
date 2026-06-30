import { describe, expect, it } from "vitest";
import {
  ATTACHMENT_TYPES,
  CONSTRUCTION_TYPES,
  EXTERNAL_AREA_PRESETS,
  GARAGE_TYPES,
  INTERNAL_AREA_PRESETS,
  PROPERTY_TYPES,
  SURVEY_STEPS,
  getAreaTypeLabel,
} from "@/lib/survey/constants";

describe("survey constants", () => {
  it("defines the four-step workflow", () => {
    expect(SURVEY_STEPS).toEqual([
      "Property",
      "Areas",
      "Survey",
      "Review & Report",
    ]);
  });

  it("includes garage type options required by the parity spec", () => {
    expect(GARAGE_TYPES).toEqual([
      "Detached garage",
      "Adjoining garage",
      "Integral garage",
    ]);
  });

  it("includes detailed construction options", () => {
    expect(CONSTRUCTION_TYPES).toEqual([
      "Cavity masonry",
      "Solid masonry",
      "Stone",
      "Timber frame",
      "Steel frame",
      "Concrete frame",
      "Mixed / unknown",
      "Other",
    ]);
  });

  it("includes property and attachment presets", () => {
    expect(PROPERTY_TYPES.length).toBeGreaterThan(0);
    expect(ATTACHMENT_TYPES).toContain("Detached");
    expect(INTERNAL_AREA_PRESETS).toContain("Kitchen");
    expect(EXTERNAL_AREA_PRESETS).toContain("Front elevation");
  });

  it("labels area types for reports", () => {
    expect(getAreaTypeLabel("internal")).toBe("Internal");
    expect(getAreaTypeLabel("external")).toBe("External");
  });
});
