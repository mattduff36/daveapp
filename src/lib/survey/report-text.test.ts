import { describe, expect, it } from "vitest";
import {
  buildConclusions,
  buildExecutiveSummary,
  buildPropertyDescription,
  buildRecommendations,
  buildReportDraft,
} from "@/lib/survey/report-text";
import { baseSurvey, makeArea } from "../../../tests/fixtures/survey";

describe("report text generation", () => {
  it("escalates executive summary language for significant defects", () => {
    const summary = buildExecutiveSummary({
      survey: baseSurvey,
      areas: [
        makeArea({ name: "Kitchen", condition_rating: "significant" }),
        makeArea({ name: "Bedroom", condition_rating: "defect" }),
      ],
    });

    expect(summary).toContain("significant defect");
    expect(summary).toContain("12 Example Street");
  });

  it("builds numbered recommendations", () => {
    const recommendations = buildRecommendations({
      survey: baseSurvey,
      areas: [makeArea({ name: "Hall", condition_rating: "monitor" })],
    });

    expect(recommendations).toMatch(/^1\./);
    expect(recommendations).toContain("Monitor identified items");
  });

  it("returns conservative conclusions when no defects are recorded", () => {
    const conclusions = buildConclusions({
      survey: baseSurvey,
      areas: [makeArea({ name: "Living room", condition_rating: "observation" })],
    });

    expect(conclusions).toContain("no significant structural defects");
  });

  it("creates a full draft payload", () => {
    const draft = buildReportDraft({
      survey: baseSurvey,
      areas: [makeArea({ name: "Roof", condition_rating: "defect", area_type: "external" })],
    });

    expect(draft.executive_summary.length).toBeGreaterThan(20);
    expect(draft.introduction).toContain("12 Example Street");
    expect(draft.conclusions.length).toBeGreaterThan(20);
    expect(draft.recommendations.length).toBeGreaterThan(20);
  });

  it("includes garage type in the property description", () => {
    const description = buildPropertyDescription(baseSurvey);

    expect(description).toContain("Garage: Yes (Detached garage)");
    expect(description).toContain("Construction: Cavity masonry");
  });

  it("omits garage type when no garage is recorded", () => {
    const description = buildPropertyDescription({
      ...baseSurvey,
      has_garage: false,
      garage_type: null,
    });

    expect(description).toContain("Garage: No");
    expect(description).not.toContain("Detached garage");
  });
});
