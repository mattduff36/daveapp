import { describe, expect, it } from "vitest";
import {
  buildConclusions,
  buildExecutiveSummary,
  buildRecommendations,
  buildReportDraft,
} from "@/lib/survey/report-text";
import type { Survey, SurveyArea } from "@/lib/survey/types";

const baseSurvey: Survey = {
  id: "survey-1",
  user_id: "user-1",
  reference_number: "REF-001",
  property_address: "12 Example Street",
  property_type: "Detached house",
  storeys: 2,
  has_garage: true,
  attachment_type: "Detached",
  construction_type: "Traditional masonry",
  instructing_party: "Homeowner",
  engineer_name: "A. Engineer",
  current_step: 3,
  status: "complete",
  executive_summary: null,
  introduction: null,
  conclusions: null,
  recommendations: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function makeArea(
  overrides: Partial<SurveyArea> & Pick<SurveyArea, "name" | "condition_rating">,
): SurveyArea {
  return {
    id: `area-${overrides.name}`,
    survey_id: baseSurvey.id,
    user_id: baseSurvey.user_id,
    area_type: "internal",
    notes: "Crack noted above window.",
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

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
});
